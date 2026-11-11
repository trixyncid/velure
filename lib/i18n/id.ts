import type { Dictionary } from "@/lib/i18n/en";

export const id: Dictionary = {
  meta: {
    title: "Velure — Parfum Mewah",
    description:
      "Temukan Velure, rumah parfum mewah. Pilih aroma favorit Anda secara online dan pesan langsung melalui WhatsApp.",
    ogDescription:
      "Temukan aroma khas Anda. Parfum mewah dari bahan-bahan terbaik, dipesan secara personal melalui WhatsApp.",
  },
  common: {
    skipToContent: "Langsung ke konten",
    closeDialog: "Tutup dialog",
    optional: "Opsional",
    items: (n: number) => `${n} produk`,
    decrease: (name: string) => `Kurangi jumlah ${name}`,
    increase: (name: string) => `Tambah jumlah ${name}`,
    language: "Bahasa",
  },
  categories: {
    All: "Semua",
    Women: "Wanita",
    Men: "Pria",
    Unisex: "Unisex",
  },
  announcement: {
    orderVia: "Pesan dengan mudah melalui WhatsApp",
    shipping: (amount: string) => `Gratis ongkir untuk pembelian di atas ${amount}`,
    shippingShort: (amount: string) => `Gratis ongkir di atas ${amount}`,
  },
  nav: {
    shop: "Belanja",
    collections: "Koleksi",
    howToOrder: "Cara memesan",
    story: "Kisah kami",
    faq: "FAQ",
  },
  header: {
    searchShort: "Cari",
    search: "Cari parfum",
    concierge: "Konsultan",
    openBag: (count: string) => `Buka keranjang, ${count}`,
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    chatConcierge: "Chat dengan konsultan",
  },
  hero: {
    eyebrow: "Maison de Parfum",
    titleTop: "Temukan Aroma",
    titleBottom: "Khas Anda",
    body: "Parfum mewah dari bahan-bahan langka — Anda yang memilih, konsultan kami yang mengonfirmasi secara personal melalui WhatsApp.",
    shop: "Lihat koleksi",
    ask: "Tanya konsultan",
    imageAlt: "Botol parfum Velure di atas kain sutra berwarna sampanye",
  },
  trust: {
    label: "Komitmen kami",
    concierge: { title: "Konsultan pribadi", detail: "Setiap pesanan dilayani via WhatsApp" },
    payLater: { title: "Bayar setelah konfirmasi", detail: "Tanpa pembayaran online" },
    shipping: {
      title: "Gratis ongkir",
      detail: (amount: string) => `Untuk pembelian di atas ${amount}`,
    },
    quality: { title: "Asli & buatan sendiri", detail: "Bahan langka, botol tersegel" },
  },
  collections: {
    eyebrow: "Temukan karakter Anda",
    heading: "Belanja per Koleksi",
    explore: "Jelajahi",
    items: {
      women: { eyebrow: "Wanita", title: "Anggun & Memikat" },
      men: { eyebrow: "Pria", title: "Penuh Percaya Diri" },
      unisex: { eyebrow: "Unisex", title: "Untuk Setiap Suasana" },
      all: { eyebrow: "Seluruh Koleksi", title: "Semua Komposisi" },
    },
  },
  shop: {
    eyebrow: "Koleksi kami",
    heading: "Parfum Kami",
    filterLabel: "Saring berdasarkan koleksi",
    quickView: "Lihat cepat",
    viewDetails: (name: string) => `Lihat detail ${name}`,
    bottleAlt: (name: string) => `Botol parfum ${name}`,
    addToBag: "Tambah ke keranjang",
    added: "Ditambahkan",
    notSure: "Masih ragu? Ketuk parfum mana pun untuk melihat detailnya, atau",
    priceOnRequest: "Harga atas permintaan",
    askPrice: "Tanya harga",
    bestSeller: "Terlaris",
    noDescription: "Tanyakan kepada konsultan kami tentang karakter, aroma, dan ketahanan parfum ini.",
    emptyTitle: "Koleksi sedang kami siapkan",
    emptyBody: "Parfum baru segera hadir. Sementara itu, konsultan kami siap membantu Anda via WhatsApp.",
    emptyFilter: "Belum ada parfum di koleksi ini.",
    showAll: "Tampilkan semua parfum",
    seeHow: "lihat cara memesan",
  },
  howToOrder: {
    eyebrow: "Mudah & personal",
    heading: "Cara Memesan",
    intro:
      "Tidak ada pembayaran online. Setiap pesanan dikonfirmasi langsung oleh tim kami, sehingga Anda baru membayar setelah semuanya sesuai.",
    steps: [
      {
        title: "Pilih parfum Anda",
        detail:
          "Jelajahi koleksi dan tambahkan parfum favorit ke keranjang. Jumlahnya dapat diubah kapan saja.",
      },
      {
        title: "Kirim pesanan via WhatsApp",
        detail:
          "Kami menyiapkan ringkasan pesanan yang rapi dan terperinci. Periksa, lalu tekan kirim — selesai.",
      },
      {
        title: "Konfirmasi & bayar bersama konsultan",
        detail:
          "Konsultan kami mengonfirmasi ketersediaan, ongkos kirim, dan detail pembayaran, lalu mengirimkan pesanan Anda.",
      },
    ],
    start: "Mulai memilih",
    questions: "Ada pertanyaan?",
  },
  story: {
    eyebrow: "Seni Meracik Parfum",
    titleTop: "Diracik dengan Sepenuh Hati,",
    titleBottom: "Dibuat untuk Anda",
    body: "Di Velure, setiap parfum adalah perpaduan bahan-bahan terbaik yang dipilih dengan cermat dari seluruh dunia.",
    cta: "Jelajahi koleksi",
    imageAlt: "Botol parfum amber dengan bunga melati putih di atas batu gelap",
  },
  testimonials: {
    label: "Testimoni pelanggan",
    heading: "Kata Pelanggan Kami",
    previous: "Testimoni sebelumnya",
    next: "Testimoni berikutnya",
    show: (n: number) => `Tampilkan testimoni ${n}`,
  },
  faq: {
    eyebrow: "Perlu Anda ketahui",
    heading: "Tanya Jawab",
    items: (shipping: string) => [
      {
        question: "Mengapa saya tidak membayar di website?",
        answer:
          "Setiap pesanan Velure dikonfirmasi secara langsung oleh tim kami. Setelah Anda mengirim pesanan via WhatsApp, konsultan kami akan memeriksa ketersediaan, mengonfirmasi total akhir termasuk ongkos kirim, dan membagikan detail pembayaran kepada Anda. Tidak ada biaya yang ditagih sebelum Anda setuju.",
      },
      {
        question: "Metode pembayaran apa saja yang tersedia?",
        answer:
          "Konsultan kami akan menginformasikan pilihan pembayaran yang tersedia untuk lokasi Anda saat mengonfirmasi pesanan, sehingga Anda dapat memilih yang paling nyaman.",
      },
      {
        question: "Berapa lama saya akan mendapat balasan?",
        answer:
          "Kami membalas secara personal pada jam kerja, biasanya di hari yang sama. Setelah pembayaran dikonfirmasi, pesanan Anda segera kami siapkan dan kirimkan.",
      },
      {
        question: "Berapa ongkos kirimnya?",
        answer: `Gratis ongkir untuk pembelian di atas ${shipping}. Untuk pembelian di bawah itu, konsultan kami akan menginformasikan biaya pasti ke kota Anda sebelum Anda membayar.`,
      },
      {
        question: "Apakah pesanan bisa diubah setelah dikirim?",
        answer:
          "Tentu saja. Cukup balas di percakapan WhatsApp yang sama sebelum pembayaran, dan kami akan memperbaruinya untuk Anda.",
      },
    ],
    still: "Masih ada yang ingin ditanyakan?",
    ask: "Tanya konsultan kami",
  },
  footer: {
    bannerEyebrow: "Konsultan pribadi Anda",
    bannerTitle: "Butuh bantuan memilih aroma? Kami hanya sejauh satu pesan.",
    chat: "Chat via WhatsApp",
    about:
      "Rumah parfum yang berdedikasi pada bahan-bahan langka, kemewahan yang bersahaja, dan aroma yang tak terlupakan.",
    explore: "Jelajahi",
    collections: "Koleksi",
    contact: "Kontak",
    rights: (year: number) => `© ${year} Velure. Hak cipta dilindungi.`,
    note: "Pesanan dikonfirmasi secara personal via WhatsApp · Tanpa pembayaran online",
  },
  cart: {
    titleBag: "Keranjang Anda",
    titleDetails: "Data Anda",
    titleSent: "Pesanan siap",
    back: "Kembali ke keranjang",
    close: "Tutup keranjang",
    steps: { bag: "Keranjang", details: "Data", sent: "WhatsApp" },
    emptyTitle: "Keranjang Anda kosong",
    emptyBody:
      "Tambahkan parfum favorit Anda, lalu kirim pesanan ke konsultan kami via WhatsApp hanya dengan satu ketukan.",
    emptyCta: "Jelajahi parfum",
    addMoreBefore: "Tambah",
    addMoreAfter: "lagi untuk gratis ongkir.",
    freeUnlocked: "Anda mendapatkan gratis ongkir.",
    remove: "Hapus",
    subtotal: "Subtotal",
    shippingConfirmed: "Ongkos kirim akan dikonfirmasi oleh konsultan kami. ",
    nothingCharged:
      "Belum ada pembayaran — Anda baru membayar setelah kami konfirmasi via WhatsApp.",
    continue: "Lanjutkan",
    detailsIntro:
      "Cukup beberapa data agar konsultan kami dapat menyiapkan pesanan Anda. Kami akan menghubungi Anda melalui nomor WhatsApp yang Anda gunakan.",
    name: "Nama lengkap",
    nameError: "Mohon isi nama Anda agar konsultan kami dapat menyapa Anda dengan tepat.",
    city: "Kota tujuan",
    cityPlaceholder: "Membantu kami menghitung ongkir",
    note: "Catatan untuk konsultan",
    notePlaceholder: "Bungkus kado, waktu pengiriman yang diinginkan…",
    send: "Kirim pesanan via WhatsApp",
    sendHintTop: "WhatsApp akan terbuka dengan ringkasan pesanan Anda.",
    sendHintBottom: "Periksa kembali, lalu tekan kirim.",
    reference: (ref: string) => `Nomor pesanan ${ref}`,
    thanks: (name: string) => `Terima kasih, ${name}.`,
    readyBefore: "Pesanan Anda senilai",
    readyAfter: "sudah siap di WhatsApp. Belum ada pembayaran yang ditagih.",
    next: [
      "Tekan kirim di WhatsApp untuk mengirimkan pesanan Anda.",
      "Konsultan kami mengonfirmasi ketersediaan, ongkos kirim, dan total akhir.",
      "Lakukan pembayaran sesuai detail dari kami — lalu pesanan kami kirim.",
    ],
    reopen: "WhatsApp tidak terbuka? Ketuk di sini",
    keepBrowsing: "Lanjut belanja",
  },
  productDialog: {
    close: "Tutup detail",
    reviews: (rating: string, count: number) => `${rating} · ${count} ulasan`,
    photo: (n: number) => `Tampilkan foto ${n}`,
    forWhom: "Untuk",
    addToBag: (price: string) => `Tambah ke keranjang · ${price}`,
    ask: "Tanya tentang parfum ini",
  },
  search: {
    title: "Cari parfum",
    placeholder: "Cari nama, aroma, atau koleksi",
    close: "Tutup pencarian",
    collection: (name: string) => `Koleksi ${name}`,
    noMatch: (query: string) => `Tidak ada hasil untuk “${query}”`,
    tryBefore: "Coba cari aroma seperti “vanila”, atau",
    askConcierge: "tanya konsultan kami",
  },
  toast: {
    title: "Ditambahkan ke keranjang",
    viewBag: "Lihat keranjang",
    dismiss: "Tutup",
  },
  floating: {
    label: "Chat dengan konsultan via WhatsApp",
    short: "Konsultan",
  },
  whatsapp: {
    header: "VELURE — PERMINTAAN PESANAN",
    reference: "No. Pesanan",
    date: "Tanggal",
    customer: "PELANGGAN",
    name: "Nama",
    city: "Kota",
    details: "RINCIAN PESANAN",
    items: "Jumlah",
    subtotal: "Subtotal",
    shipping: "Ongkir",
    total: "Total",
    free: "Gratis",
    tbc: "Menunggu konfirmasi",
    exclShipping: "(belum termasuk ongkir)",
    notes: "CATATAN",
    closing:
      "Halo, saya ingin melakukan pemesanan di atas. Mohon konfirmasi ketersediaan, ongkos kirim, dan detail pembayarannya.",
    thanks: "Terima kasih.",
    concierge: "Halo, saya ingin dibantu memilih parfum Velure.",
    inquiry: (name: string, details: string) =>
      `Halo, saya ingin mengetahui lebih lanjut tentang *${name}*${details ? ` (${details})` : ""}.`,
  },
};
