// Prices are stored in whole Rupiah and shown as "Rp 1.250.000" in every language.
const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return currency.format(value);
}
