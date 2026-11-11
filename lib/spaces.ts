import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/** Spaces rejects the AWS SDK's default flexible checksums unless they are requested. */
const SDK_REGION = "us-east-1";
const PUBLIC_ACL: ObjectCannedACL = "public-read";

const REQUIRED_ENV = [
  "SPACES_KEY",
  "SPACES_SECRET",
  "SPACES_BUCKET",
  "SPACES_REGION",
] as const;

export const MEDIA_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
} as const;

export type MediaContentType = keyof typeof MEDIA_TYPES;

const MEDIA_KEY =
  /^cms\/\d{4}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif|gif)$/;

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

type SpacesConfig = {
  key: string;
  secret: string;
  bucket: string;
  region: string;
  endpoint: string;
  cdnEndpoint: string | null;
};

export function spacesStatus() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
  return {
    configured: missing.length === 0,
    missing,
    bucket: process.env.SPACES_BUCKET?.trim() || null,
    region: process.env.SPACES_REGION?.trim() || null,
  };
}

function readConfig(): SpacesConfig {
  const status = spacesStatus();
  if (!status.configured) {
    throw new Error(
      `DigitalOcean Spaces is not configured. Missing ${status.missing.join(", ")}.`,
    );
  }

  const region = process.env.SPACES_REGION!.trim();
  const endpoint =
    process.env.SPACES_ENDPOINT?.trim() ||
    `https://${region}.digitaloceanspaces.com`;
  const cdnEndpoint = process.env.SPACES_CDN_ENDPOINT?.trim() || null;

  assertSpacesUrl(endpoint, "SPACES_ENDPOINT");
  if (cdnEndpoint) assertSpacesUrl(cdnEndpoint, "SPACES_CDN_ENDPOINT");

  return {
    key: process.env.SPACES_KEY!.trim(),
    secret: process.env.SPACES_SECRET!.trim(),
    bucket: process.env.SPACES_BUCKET!.trim(),
    region,
    endpoint: endpoint.replace(/\/$/, ""),
    cdnEndpoint: cdnEndpoint?.replace(/\/$/, "") ?? null,
  };
}

function assertSpacesUrl(value: string, name: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an https URL.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https.`);
  }
  if (!url.hostname.endsWith("digitaloceanspaces.com")) {
    throw new Error(`${name} must point at digitaloceanspaces.com.`);
  }
}

let client: S3Client | undefined;

function getClient() {
  const config = readConfig();
  if (!client) {
    client = new S3Client({
      endpoint: config.endpoint,
      region: SDK_REGION,
      forcePathStyle: false,
      credentials: {
        accessKeyId: config.key,
        secretAccessKey: config.secret,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return { client, config };
}

export function isMediaContentType(value: string): value is MediaContentType {
  return Object.prototype.hasOwnProperty.call(MEDIA_TYPES, value);
}

export function createMediaKey(contentType: MediaContentType) {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `cms/${year}/${month}/${crypto.randomUUID()}.${MEDIA_TYPES[contentType]}`;
}

export function isMediaKey(key: string) {
  return MEDIA_KEY.test(key);
}

export function publicObjectUrl(key: string) {
  if (!isMediaKey(key)) throw new Error("Media key is not valid.");
  const config = readConfig();
  if (config.cdnEndpoint) return `${config.cdnEndpoint}/${key}`;
  return `https://${config.bucket}.${config.region}.digitaloceanspaces.com/${key}`;
}

export async function uploadMedia(input: {
  key: string;
  body: Uint8Array;
  contentType: MediaContentType;
}) {
  if (!isMediaKey(input.key)) throw new Error("Media key is not valid.");
  if (input.body.byteLength > MAX_MEDIA_BYTES) {
    throw new Error("File is too large.");
  }

  const { client: spaces, config } = getClient();
  await spaces.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      ContentLength: input.body.byteLength,
      ACL: PUBLIC_ACL,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key: input.key,
    url: publicObjectUrl(input.key),
    contentType: input.contentType,
    size: input.body.byteLength,
  };
}

export async function deleteMedia(key: string) {
  if (!isMediaKey(key)) throw new Error("Media key is not valid.");
  const { client: spaces, config } = getClient();
  await spaces.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

export async function createPresignedMediaUpload(input: {
  contentType: MediaContentType;
  expiresIn?: number;
}) {
  const key = createMediaKey(input.contentType);
  const { client: spaces, config } = getClient();
  const url = await getSignedUrl(
    spaces,
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: input.contentType,
      ACL: PUBLIC_ACL,
    }),
    { expiresIn: input.expiresIn ?? 600 },
  );

  return {
    url,
    key,
    publicUrl: publicObjectUrl(key),
  };
}
