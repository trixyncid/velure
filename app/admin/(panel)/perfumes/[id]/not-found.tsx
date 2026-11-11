import Link from "next/link";

export default function FragranceNotFound() {
  return (
    <div className="max-w-xl">
      <p className="text-[12px] tracking-[0.22em] text-muted uppercase">Catalog</p>
      <h1 className="mt-3 font-serif text-5xl text-ink">This fragrance is not in the catalog</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        It may have been removed. Return to the list and choose another.
      </p>
      <Link
        href="/admin/perfumes"
        className="mt-8 inline-flex bg-ink px-5 py-3 text-[12px] tracking-[0.18em] text-white uppercase"
      >
        Back to fragrances
      </Link>
    </div>
  );
}
