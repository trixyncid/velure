import { requireAdminApi } from "@/lib/session";
import {
  MAX_MEDIA_BYTES,
  createMediaKey,
  deleteMedia,
  isMediaContentType,
  isMediaKey,
  uploadMedia,
} from "@/lib/spaces";

export const runtime = "nodejs";

function mediaErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("DigitalOcean Spaces is not configured")) {
    return Response.json({ error: message }, { status: 503 });
  }
  if (message === "File is too large." || message === "Media key is not valid.") {
    return Response.json({ error: message }, { status: 400 });
  }
  console.error(error);
  return Response.json({ error: "Could not store the image." }, { status: 500 });
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_MEDIA_BYTES + 1024 * 1024) {
    return Response.json({ error: "File is too large." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!isMediaContentType(file.type)) {
    return Response.json(
      { error: "Use a JPEG, PNG, WebP, AVIF, or GIF image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return Response.json({ error: "Images must be 8 MB or smaller." }, { status: 413 });
  }

  try {
    const uploaded = await uploadMedia({
      key: createMediaKey(file.type),
      body: new Uint8Array(await file.arrayBuffer()),
      contentType: file.type,
    });
    return Response.json(uploaded);
  } catch (error) {
    return mediaErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let key = "";
  try {
    const body = (await request.json()) as { key?: unknown };
    key = typeof body.key === "string" ? body.key : "";
  } catch {
    return Response.json({ error: "Expected a media key." }, { status: 400 });
  }

  if (!isMediaKey(key)) {
    return Response.json({ error: "Media key is not valid." }, { status: 400 });
  }

  try {
    await deleteMedia(key);
    return Response.json({ ok: true });
  } catch (error) {
    return mediaErrorResponse(error);
  }
}
