import { freeShippingThreshold, type Product } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import { getDictionary, localeTags, type Locale } from "@/lib/i18n";

// International format, digits only (no "+", spaces or leading zero).
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281930854396"
).replace(/\D/g, "");

/** Human-friendly version of the number, e.g. "+62 819 3085 4396". */
export const WHATSAPP_DISPLAY = WHATSAPP_NUMBER.replace(
  /^(\d{2})(\d{3})(\d{4})(\d+)$/,
  "+$1 $2 $3 $4",
);

export type OrderCustomer = {
  name: string;
  city?: string;
  note?: string;
};

export type OrderLine = { id: string; qty: number };

export function createOrderReference(date = new Date()) {
  const stamp = [
    String(date.getFullYear()).slice(2),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `VLR-${stamp}-${suffix}`;
}

type Lookup = (id: string) => Product | undefined;

export function orderTotals(lines: OrderLine[], getProduct: Lookup) {
  const itemCount = lines.reduce((total, line) => total + line.qty, 0);
  const subtotal = lines.reduce(
    (total, line) => total + (getProduct(line.id)?.price ?? 0) * line.qty,
    0,
  );
  const freeShipping = subtotal >= freeShippingThreshold;
  return { itemCount, subtotal, freeShipping };
}

/** Pads labels so the colons line up, e.g. "Name     :". */
function labeller(labels: string[]) {
  const width = Math.max(...labels.map((label) => label.length));
  return (label: string) => `${label.padEnd(width)} :`;
}

export function buildOrderMessage({
  locale,
  reference,
  customer,
  lines,
  getProduct,
  date = new Date(),
}: {
  locale: Locale;
  reference: string;
  customer: OrderCustomer;
  lines: OrderLine[];
  getProduct: Lookup;
  date?: Date;
}) {
  const t = getDictionary(locale);
  const w = t.whatsapp;
  const divider = "------------------------------";
  const items = lines.flatMap((line, index) => {
    const product = getProduct(line.id);
    if (!product || product.price == null) return [];
    const categories = product.categories.map((category) => t.categories[category]).join(", ");
    return [
      `${index + 1}. *${product.name}*`,
      ...(categories ? [`    ${categories}`] : []),
      `    ${line.qty} x ${formatPrice(product.price)} = ${formatPrice(product.price * line.qty)}`,
    ];
  });
  const { itemCount, subtotal, freeShipping } = orderTotals(lines, getProduct);
  const issued = new Intl.DateTimeFormat(localeTags[locale], {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);

  const city = customer.city?.trim();
  const note = customer.note?.trim();
  const head = labeller([w.reference, w.date]);
  const who = labeller([w.name, w.city]);
  const sum = labeller([w.items, w.subtotal, w.shipping, w.total]);

  return [
    `*${w.header}*`,
    divider,
    `${head(w.reference)} ${reference}`,
    `${head(w.date)} ${issued}`,
    "",
    `*${w.customer}*`,
    `${who(w.name)} ${customer.name}`,
    ...(city ? [`${who(w.city)} ${city}`] : []),
    "",
    `*${w.details}*`,
    ...items,
    divider,
    `${sum(w.items)} ${itemCount}`,
    `${sum(w.subtotal)} ${formatPrice(subtotal)}`,
    `${sum(w.shipping)} ${freeShipping ? w.free : w.tbc}`,
    freeShipping
      ? `*${sum(w.total)} ${formatPrice(subtotal)}*`
      : `*${sum(w.total)} ${formatPrice(subtotal)}* ${w.exclShipping}`,
    divider,
    ...(note ? [`*${w.notes}*`, note, ""] : []),
    w.closing,
    "",
    w.thanks,
  ].join("\n");
}

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function conciergeUrl(locale: Locale) {
  return whatsappUrl(getDictionary(locale).whatsapp.concierge);
}

export function productInquiryUrl(product: Product, locale: Locale) {
  const t = getDictionary(locale);
  const categories = product.categories.map((category) => t.categories[category]).join(", ");
  const price = product.price != null ? formatPrice(product.price) : t.shop.priceOnRequest;
  return whatsappUrl(
    t.whatsapp.inquiry(product.name, [categories, price].filter(Boolean).join(", ")),
  );
}
