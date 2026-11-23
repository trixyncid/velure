/**
 * Landing-page copy that does not live in the CMS. Edit freely; no component changes needed.
 *
 * CONFIDENTIALITY: Velure's materials and formulation are a trade secret. Keep this copy
 * evocative. Never name essence types, suppliers, origins, ratios, timings or extra steps,
 * and never add claims (natural, long-lasting, and so on) the client has not approved.
 * The making process has exactly three steps.
 */
import type { Locale } from "@/lib/i18n/config";

export type CraftStep = { number: string; title: string; step: string; body: string };

export type LandingContent = {
  meta: { title: string; description: string; ogDescription: string; ogAlt: string };
  brand: { collection: string; size: string };
  nav: {
    /** The one name used everywhere for "take me to the perfumes". */
    collection: string;
    /** Floating button in the shop once the cart has something in it. */
    viewCart: (count: number) => string;
    cart: (count: number) => string;
    home: string;
    menu: string;
    /** Name of the opening screen in the section indicator. */
    top: string;
    /** Accessible name of the section indicator. */
    sections: string;
    openMenu: string;
    closeMenu: string;
    concierge: string;
    links: { href: string; label: string }[];
  };
  preloader: { label: string };
  hero: {
    eyebrow: string;
    titleLines: string[];
    /** Under the title on the first screen: what this is, in one line. */
    sub: string;
    /** One line over the mist, between the title and the bottle. */
    interlude: string;
    /** Beside the bottle once it has risen: the collection, or help choosing. */
    reveal: { eyebrow: string; line: string; secondary: string };
    cta: string;
    scroll: string;
  };
  story: { eyebrow: string; blocks: { titleLines: string[]; body: string }[] };
  craft: {
    eyebrow: string;
    heading: string;
    /** Exactly three steps. Do not add steps, quantities or materials here. */
    steps: CraftStep[];
    /** Caption for the pour and seal. Not a step: it is not numbered. */
    pour: { label: string; title: string; body: string };
    /** Closing shot of the chapter: the collection, then a question that leads into it. */
    finale: { eyebrow: string; lines: string[]; question: string; cta: string };
  };
  collection: {
    eyebrow: string;
    heading: string;
    intro: string;
    /** e.g. "7 wangi". */
    count: (total: number) => string;
    characterLabel: string;
    scentsLabel: string;
    details: string;
    detailsFor: (name: string) => string;
    add: string;
    close: string;
    photo: (name: string, index: number) => string;
    /** Link from the collection to the scent finder, for the undecided. */
    unsure: string;
    emptyTitle: string;
    emptyBody: string;
    noDescription: string;
  };
  assurance: { eyebrow: string; heading: string };
  pyramid: {
    eyebrow: string;
    tiers: { key: "top" | "middle" | "base"; title: string; hint: string }[];
    notesPending: string;
  };
  finder: {
    eyebrow: string;
    heading: string;
    intro: string;
    who: { title: string; options: { value: "men" | "women" | "both"; label: string }[] };
    /** The second step: pick scents. The scents themselves are managed in the admin (Scents). */
    scents: { title: string; hint: string; submit: string; picked: (count: number) => string };
    /** Why this perfume: the picked scents it has. */
    matched: (names: string, count: number, total: number) => string;
    /** Shown when no perfume has any of the picked scents. */
    closest: string;
    step: (current: number, total: number) => string;
    back: string;
    resultEyebrow: string;
    resultHeading: string;
    alsoLike: string;
    order: string;
    details: string;
    restart: string;
    noMatch: string;
  };
  order: {
    variantLabel: string;
    quantity: string;
    total: string;
    addToCart: string;
    added: string;
    buyNow: string;
    /** Under the buy buttons: how ordering works, in one line. */
    note: string;
    priceOnRequest: string;
    askPrice: string;
    trust: { title: string; detail: string }[];
    trustShipping: (amount: string) => { title: string; detail: string };
  };
  outro: {
    faqEyebrow: string;
    /** Last call to action before the footer. */
    closing: { eyebrow: string; heading: string; body: string; primary: string; secondary: string };
  };
  footer: { about: string; explore: string; contact: string; links: { href: string; label: string }[] };
  fallback: { bottleAlt: (name: string) => string };
};

const id: LandingContent = {
  meta: {
    title: "Velure — The Midnight Collection",
    description:
      "The Midnight Collection dari Velure: Eau de Parfum yang lahir dari tengah malam. Kenali setiap wanginya dan pesan langsung lewat WhatsApp.",
    ogDescription: "Tujuh wangi. Satu malam yang tak terlupakan. Kenali The Midnight Collection dari Velure.",
    ogAlt: "Velure — The Midnight Collection",
  },
  brand: { collection: "The Midnight Collection", size: "Eau de Parfum · 30ml" },
  nav: {
    collection: "Lihat Koleksi",
    viewCart: (count) => `Lihat Keranjang · ${count}`,
    cart: (count) => `Buka keranjang, ${count} produk`,
    home: "Velure — kembali ke atas",
    menu: "Menu utama",
    top: "Pembuka",
    sections: "Bagian halaman",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    concierge: "Chat Konsultan",
    links: [
      { href: "#story", label: "Kisah" },
      { href: "#craft", label: "Proses" },
      { href: "#collection", label: "Koleksi" },
      { href: "#finder", label: "Bantu Memilih" },
      { href: "#faq", label: "Tanya Jawab" },
    ],
  },
  preloader: { label: "Menyiapkan malam" },
  hero: {
    eyebrow: "Velure Perfume",
    titleLines: ["The Midnight", "Collection"],
    sub: "Tujuh wangi. Satu malam yang tak terlupakan.",
    interlude: "Saat kota meredup, wangi mulai bercerita.",
    reveal: {
      eyebrow: "Eau de Parfum",
      line: "Lahir dari kabut tengah malam.",
      secondary: "Bantu saya memilih",
    },
    cta: "Lihat Koleksi",
    scroll: "Gulir untuk memulai",
  },
  story: {
    eyebrow: "Kisah Velure",
    blocks: [
      {
        titleLines: ["Tengah malam,", "saat dunia berbisik."],
        body: "Ada jam ketika kota meredup dan segalanya terasa lebih jujur. Di jam itulah Velure lahir.",
      },
      {
        titleLines: ["Wangi adalah", "ingatan yang dikenakan."],
        body: "Setiap Midnight menyimpan satu suasana malam, lalu meninggalkannya pada siapa pun yang berpapasan dengan Anda.",
      },
      {
        titleLines: ["Setiap malam", "punya racikannya."],
        body: "Racikan rahasia Velure lahir dari tiga langkah sederhana. Selebihnya, biarlah tetap menjadi misteri.",
      },
    ],
  },
  craft: {
    eyebrow: "Bagaimana Midnight Tercipta",
    heading: "Tiga langkah, satu rahasia",
    steps: [
      {
        number: "01",
        title: "Dua Bibit Pilihan",
        step: "Sediakan 2 jenis bibit parfum",
        body: "Semuanya berawal dari dua bibit pilihan. Masing-masing membawa cahayanya sendiri, menunggu dalam gelap.",
      },
      {
        number: "02",
        title: "Sebuah Perpaduan",
        step: "Campurkan kedua bibit parfum",
        body: "Keduanya saling mendekat, lalu melebur perlahan. Dua karakter menjadi satu racikan rahasia Velure.",
      },
      {
        number: "03",
        title: "Sentuhan Akhir",
        step: "Campurkan ethanol",
        body: "Tetes-tetes bening ethanol jatuh satu per satu, menyempurnakan perpaduan itu hingga ia berpendar.",
      },
    ],
    pour: {
      label: "Racikan rahasia Velure",
      title: "Menemukan Botolnya",
      body: "Perpaduan itu dituang perlahan, lalu disegel. Kini ia menunggu malam yang akan mengenangnya.",
    },
    finale: {
      eyebrow: "The Midnight Collection",
      lines: ["Satu racikan rahasia.", "Tujuh wangi tengah malam."],
      question: "Yang mana milik Anda?",
      cta: "Lihat Koleksi",
    },
  },
  collection: {
    eyebrow: "The Midnight Collection",
    heading: "Pilih Midnight Anda",
    intro: "Setiap Midnight punya karakternya sendiri. Kenali satu per satu, lalu bawa pulang yang paling terasa seperti Anda.",
    count: (total) => `${total} wangi`,
    characterLabel: "Karakter Aroma",
    scentsLabel: "Aroma",
    details: "Lihat Detail",
    detailsFor: (name) => `Lihat detail ${name}`,
    add: "Tambah ke Keranjang",
    close: "Tutup",
    photo: (name, index) => `Foto ${name} ${index}`,
    unsure: "Belum yakin? Pilih aroma yang Anda suka",
    emptyTitle: "Koleksi sedang kami siapkan",
    emptyBody: "Parfum baru segera hadir. Sementara itu, konsultan kami siap membantu Anda via WhatsApp.",
    noDescription: "Tanyakan kepada konsultan kami tentang karakter wangi ini.",
  },
  assurance: { eyebrow: "Belanja dengan Tenang", heading: "Dari kami, sampai ke tangan Anda" },
  pyramid: {
    eyebrow: "Piramida Aroma",
    tiers: [
      { key: "top", title: "Top Notes", hint: "Kesan pertama" },
      { key: "middle", title: "Middle Notes", hint: "Jantung wangi" },
      { key: "base", title: "Base Notes", hint: "Yang paling lama tinggal" },
    ],
    notesPending: "Detail aroma segera hadir.",
  },
  finder: {
    eyebrow: "Bantu Memilih",
    heading: "Belum yakin yang mana?",
    intro: "Pilih untuk siapa dan aroma yang Anda suka. Kami carikan Midnight yang paling banyak memilikinya.",
    who: {
      title: "Untuk siapa wangi ini?",
      options: [
        { value: "men", label: "Pria" },
        { value: "women", label: "Wanita" },
        { value: "both", label: "Keduanya" },
      ],
    },
    scents: {
      title: "Aroma apa yang Anda suka?",
      hint: "Pilih sebanyak yang Anda mau.",
      submit: "Lihat Hasil",
      picked: (count) => (count === 0 ? "Belum ada yang dipilih" : `${count} aroma dipilih`),
    },
    matched: (names, count, total) => `Cocok dengan pilihan Anda: ${names} (${count} dari ${total})`,
    closest: "Belum ada yang memiliki aroma pilihan Anda. Ini yang paling mendekati.",
    step: (current, total) => `Pertanyaan ${current} dari ${total}`,
    back: "Kembali",
    resultEyebrow: "Midnight Anda",
    resultHeading: "Midnight yang paling cocok untuk Anda",
    alsoLike: "Anda mungkin juga suka",
    order: "Pesan Sekarang",
    details: "Lihat Detail",
    restart: "Ulangi dari awal",
    noMatch: "Koleksi belum tersedia. Konsultan kami siap membantu memilih.",
  },
  order: {
    variantLabel: "Ukuran",
    quantity: "Jumlah",
    total: "Total",
    addToCart: "Tambah ke Keranjang",
    added: "Ditambahkan",
    buyNow: "Beli Sekarang",
    note: "Pesanan dikonfirmasi lewat WhatsApp. Anda baru membayar setelah konfirmasi.",
    priceOnRequest: "Harga atas permintaan",
    askPrice: "Tanya harga via WhatsApp",
    trust: [
      { title: "Racikan asli Velure", detail: "Setiap botol dikirim langsung oleh kami" },
      { title: "Bayar setelah konfirmasi", detail: "Tanpa pembayaran online di website" },
      { title: "Konsultan pribadi", detail: "Setiap pesanan dilayani via WhatsApp" },
    ],
    trustShipping: (amount) => ({ title: "Gratis ongkir", detail: `Untuk pembelian di atas ${amount}` }),
  },
  outro: {
    faqEyebrow: "Perlu Anda ketahui",
    closing: {
      eyebrow: "Malam Anda Menunggu",
      heading: "Temukan Midnight Anda malam ini.",
      body: "Pilih wanginya, kirim pesanan lewat WhatsApp, dan konsultan kami mengurus sisanya.",
      primary: "Lihat Koleksi",
      secondary: "Chat Konsultan",
    },
  },
  footer: {
    about: "Velure Perfume — wangi yang lahir dari tengah malam, diracik dengan rahasia yang kami jaga.",
    explore: "Jelajahi",
    contact: "Kontak",
    links: [
      { href: "#story", label: "Kisah" },
      { href: "#craft", label: "Proses" },
      { href: "#collection", label: "Koleksi" },
      { href: "#finder", label: "Bantu Memilih" },
      { href: "#faq", label: "Tanya Jawab" },
    ],
  },
  fallback: { bottleAlt: (name) => `Botol parfum ${name}` },
};

const en: LandingContent = {
  meta: {
    title: "Velure — The Midnight Collection",
    description:
      "The Midnight Collection by Velure: Eau de Parfum born at midnight. Meet every scent and order directly through WhatsApp.",
    ogDescription: "Seven scents. One unforgettable night. Meet The Midnight Collection by Velure.",
    ogAlt: "Velure — The Midnight Collection",
  },
  brand: { collection: "The Midnight Collection", size: "Eau de Parfum · 30ml" },
  nav: {
    collection: "View Collection",
    viewCart: (count) => `View Cart · ${count}`,
    cart: (count) => `Open cart, ${count} ${count === 1 ? "item" : "items"}`,
    home: "Velure — back to top",
    menu: "Main menu",
    top: "Opening",
    sections: "Page sections",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    concierge: "Chat with Concierge",
    links: [
      { href: "#story", label: "Story" },
      { href: "#craft", label: "The Craft" },
      { href: "#collection", label: "Collection" },
      { href: "#finder", label: "Help Me Choose" },
      { href: "#faq", label: "Questions" },
    ],
  },
  preloader: { label: "Setting the night" },
  hero: {
    eyebrow: "Velure Perfume",
    titleLines: ["The Midnight", "Collection"],
    sub: "Seven scents. One unforgettable night.",
    interlude: "When the city dims, scent begins to speak.",
    reveal: {
      eyebrow: "Eau de Parfum",
      line: "Born from the midnight mist.",
      secondary: "Help me choose",
    },
    cta: "View Collection",
    scroll: "Scroll to begin",
  },
  story: {
    eyebrow: "The Velure Story",
    blocks: [
      {
        titleLines: ["Midnight,", "when the world whispers."],
        body: "There is an hour when the city dims and everything feels more honest. Velure was born in that hour.",
      },
      {
        titleLines: ["A scent is", "a memory you wear."],
        body: "Each Midnight holds one mood of the night, and leaves it with everyone who passes you.",
      },
      {
        titleLines: ["Every night", "has its blend."],
        body: "Velure's secret blend is born in three simple steps. The rest is better left a mystery.",
      },
    ],
  },
  craft: {
    eyebrow: "How Midnight Is Made",
    heading: "Three steps, one secret",
    steps: [
      {
        number: "01",
        title: "Two Chosen Essences",
        step: "Prepare two perfume essences",
        body: "It begins with two chosen essences. Each carries its own light, waiting in the dark.",
      },
      {
        number: "02",
        title: "The Blend",
        step: "Blend the two essences",
        body: "They drift together and slowly become one. Two characters turn into Velure's secret blend.",
      },
      {
        number: "03",
        title: "The Final Touch",
        step: "Add ethanol",
        body: "Clear drops of ethanol fall one by one, completing the blend until it glows.",
      },
    ],
    pour: {
      label: "Velure's secret blend",
      title: "Finding Its Bottle",
      body: "The blend is poured slowly, then sealed. Now it waits for the night that will remember it.",
    },
    finale: {
      eyebrow: "The Midnight Collection",
      lines: ["One secret blend.", "Seven midnight scents."],
      question: "Which one is yours?",
      cta: "View Collection",
    },
  },
  collection: {
    eyebrow: "The Midnight Collection",
    heading: "Choose Your Midnight",
    intro: "Every Midnight has a character of its own. Meet them one by one, then take home the one that is most you.",
    count: (total) => `${total} ${total === 1 ? "scent" : "scents"}`,
    characterLabel: "Scent Character",
    scentsLabel: "Scents",
    details: "View Details",
    detailsFor: (name) => `View details of ${name}`,
    add: "Add to Cart",
    close: "Close",
    photo: (name, index) => `${name}, photo ${index}`,
    unsure: "Not sure yet? Pick the scents you like",
    emptyTitle: "The collection is on its way",
    emptyBody: "New perfumes are coming soon. Meanwhile, our concierge is happy to help on WhatsApp.",
    noDescription: "Ask our concierge about the character of this scent.",
  },
  assurance: { eyebrow: "Shop with Confidence", heading: "From us to your hands" },
  pyramid: {
    eyebrow: "The Scent Pyramid",
    tiers: [
      { key: "top", title: "Top Notes", hint: "The first impression" },
      { key: "middle", title: "Middle Notes", hint: "The heart of the scent" },
      { key: "base", title: "Base Notes", hint: "What lingers longest" },
    ],
    notesPending: "Scent details coming soon.",
  },
  finder: {
    eyebrow: "Help Me Choose",
    heading: "Not sure which one?",
    intro: "Choose who it is for and the scents you like. We will find the Midnight that has the most of them.",
    who: {
      title: "Who is this scent for?",
      options: [
        { value: "men", label: "Men" },
        { value: "women", label: "Women" },
        { value: "both", label: "Both" },
      ],
    },
    scents: {
      title: "Which scents do you like?",
      hint: "Pick as many as you like.",
      submit: "See Results",
      picked: (count) => (count === 0 ? "Nothing picked yet" : `${count} ${count === 1 ? "scent" : "scents"} picked`),
    },
    matched: (names, count, total) => `Matches your picks: ${names} (${count} of ${total})`,
    closest: "None has the scents you picked yet. This is the closest.",
    step: (current, total) => `Question ${current} of ${total}`,
    back: "Back",
    resultEyebrow: "Your Midnight",
    resultHeading: "The Midnight that suits you best",
    alsoLike: "You may also like",
    order: "Order Now",
    details: "View Details",
    restart: "Start over",
    noMatch: "The collection is not available yet. Our concierge is happy to help you choose.",
  },
  order: {
    variantLabel: "Size",
    quantity: "Quantity",
    total: "Total",
    addToCart: "Add to Bag",
    added: "Added",
    buyNow: "Buy Now",
    note: "Orders are confirmed over WhatsApp. You only pay after confirmation.",
    priceOnRequest: "Price on request",
    askPrice: "Ask the price on WhatsApp",
    trust: [
      { title: "Authentic Velure blend", detail: "Every bottle is sent directly by us" },
      { title: "Pay after confirmation", detail: "No online payment on the website" },
      { title: "Personal concierge", detail: "Every order is handled on WhatsApp" },
    ],
    trustShipping: (amount) => ({ title: "Free shipping", detail: `On orders above ${amount}` }),
  },
  outro: {
    faqEyebrow: "Good to know",
    closing: {
      eyebrow: "Your Night Awaits",
      heading: "Find your Midnight tonight.",
      body: "Choose the scent, send your order over WhatsApp, and our concierge takes care of the rest.",
      primary: "View Collection",
      secondary: "Chat with Concierge",
    },
  },
  footer: {
    about: "Velure Perfume — scents born at midnight, blended with a secret we keep.",
    explore: "Explore",
    contact: "Contact",
    links: [
      { href: "#story", label: "Story" },
      { href: "#craft", label: "The Craft" },
      { href: "#collection", label: "Collection" },
      { href: "#finder", label: "Help Me Choose" },
      { href: "#faq", label: "Questions" },
    ],
  },
  fallback: { bottleAlt: (name) => `${name} perfume bottle` },
};

const content: Record<Locale, LandingContent> = { id, en };

export function getLandingContent(locale: Locale): LandingContent {
  return content[locale];
}
