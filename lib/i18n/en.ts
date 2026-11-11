const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const en = {
  meta: {
    title: "Velure — Luxury Perfumes",
    description:
      "Discover Velure, a house of luxury fragrances. Choose your scents online and order personally through WhatsApp.",
    ogDescription:
      "Discover your signature scent. Luxury fragrances crafted with the finest ingredients, ordered personally through WhatsApp.",
  },
  common: {
    skipToContent: "Skip to content",
    closeDialog: "Close dialog",
    optional: "Optional",
    items: (n: number) => plural(n, "item", "items"),
    decrease: (name: string) => `Decrease ${name} quantity`,
    increase: (name: string) => `Increase ${name} quantity`,
    language: "Language",
  },
  categories: {
    All: "All",
    Women: "Women",
    Men: "Men",
    Unisex: "Unisex",
  },
  announcement: {
    orderVia: "Order easily through WhatsApp",
    shipping: (amount: string) => `Complimentary shipping over ${amount}`,
    shippingShort: (amount: string) => `Free shipping over ${amount}`,
  },
  nav: {
    shop: "Shop",
    collections: "Collections",
    howToOrder: "How to order",
    story: "Our story",
    faq: "FAQ",
  },
  header: {
    searchShort: "Search",
    search: "Search fragrances",
    concierge: "Concierge",
    openBag: (count: string) => `Open bag, ${count}`,
    openMenu: "Open menu",
    closeMenu: "Close menu",
    chatConcierge: "Chat with a concierge",
  },
  hero: {
    eyebrow: "Maison de Parfum",
    titleTop: "Discover Your",
    titleBottom: "Signature Scent",
    body: "Luxury fragrances crafted with rare ingredients — chosen by you, confirmed personally by our concierge on WhatsApp.",
    shop: "Shop the collection",
    ask: "Ask a concierge",
    imageAlt: "A Velure perfume bottle resting on champagne silk",
  },
  trust: {
    label: "Our promises",
    concierge: { title: "Personal concierge", detail: "Every order handled on WhatsApp" },
    payLater: { title: "Pay after confirmation", detail: "Nothing is charged online" },
    shipping: {
      title: "Complimentary shipping",
      detail: (amount: string) => `On orders over ${amount}`,
    },
    quality: { title: "Authentic, house-made", detail: "Rare ingredients, sealed bottles" },
  },
  collections: {
    eyebrow: "Find your family",
    heading: "Shop by Collection",
    explore: "Explore",
    items: {
      women: { eyebrow: "Women", title: "Embrace Elegance" },
      men: { eyebrow: "Men", title: "Unleash Confidence" },
      unisex: { eyebrow: "Unisex", title: "For Every Mood" },
      all: { eyebrow: "The Full Wardrobe", title: "Every Composition" },
    },
  },
  shop: {
    eyebrow: "The collection",
    heading: "Our Fragrances",
    filterLabel: "Filter by collection",
    quickView: "Quick view",
    viewDetails: (name: string) => `View details for ${name}`,
    bottleAlt: (name: string) => `${name} perfume bottle`,
    addToBag: "Add to bag",
    added: "Added",
    notSure: "Not sure which to choose? Tap any fragrance for its details, or",
    priceOnRequest: "Price on request",
    askPrice: "Ask for price",
    bestSeller: "Best seller",
    noDescription: "Ask our concierge for the full story of this fragrance — its notes, character and how it wears.",
    emptyTitle: "The collection is being prepared",
    emptyBody: "New fragrances are arriving soon. In the meantime, our concierge is happy to help on WhatsApp.",
    emptyFilter: "No fragrances in this collection yet.",
    showAll: "Show all fragrances",
    seeHow: "see how ordering works",
  },
  howToOrder: {
    eyebrow: "Simple & personal",
    heading: "How Ordering Works",
    intro:
      "There is no online checkout. Every order is confirmed by a real person, so you only pay once everything is exactly right.",
    steps: [
      {
        title: "Choose your scents",
        detail:
          "Browse the collection and add the fragrances you love to your bag. Adjust quantities anytime.",
      },
      {
        title: "Send your order on WhatsApp",
        detail:
          "We prepare a clear, itemised order summary for you. Review it and press send — that is all.",
      },
      {
        title: "Confirm & pay with your concierge",
        detail:
          "Our concierge confirms availability, shipping and payment details personally, then dispatches your order.",
      },
    ],
    start: "Start choosing",
    questions: "Questions first?",
  },
  story: {
    eyebrow: "The Art of Perfume",
    titleTop: "Crafted with Passion,",
    titleBottom: "Made for You",
    body: "At Velure, every fragrance is a blend of the finest ingredients, carefully selected from around the world.",
    cta: "Explore the collection",
    imageAlt: "Amber perfume bottle with white jasmine on dark stone",
  },
  testimonials: {
    label: "Customer testimonials",
    heading: "What Our Customers Say",
    previous: "Previous testimonial",
    next: "Next testimonial",
    show: (n: number) => `Show testimonial ${n}`,
  },
  faq: {
    eyebrow: "Good to know",
    heading: "Questions & Answers",
    items: (shipping: string) => [
      {
        question: "Why don't I pay on the website?",
        answer:
          "Every Velure order is confirmed by a person. Once you send your order on WhatsApp, our concierge checks availability, confirms the final total including shipping, and shares the payment details with you directly. Nothing is charged until you agree.",
      },
      {
        question: "Which payment methods are accepted?",
        answer:
          "Your concierge will share the payment options available for your location when confirming your order, so you can choose the one that suits you.",
      },
      {
        question: "How quickly will I hear back?",
        answer:
          "We reply personally during business hours, typically the same day. Once payment is confirmed, your order is prepared and dispatched promptly.",
      },
      {
        question: "How much is shipping?",
        answer: `Shipping is complimentary on orders over ${shipping}. For smaller orders, your concierge will quote the exact cost for your city before you pay.`,
      },
      {
        question: "Can I change my order after sending it?",
        answer:
          "Of course. Simply reply in the same WhatsApp chat before payment and we will update it for you.",
      },
    ],
    still: "Still wondering about something?",
    ask: "Ask our concierge",
  },
  footer: {
    bannerEyebrow: "Your personal concierge",
    bannerTitle: "Need help finding your scent? We are one message away.",
    chat: "Chat on WhatsApp",
    about:
      "A perfume house devoted to rare materials, quiet luxury, and scents made to be remembered.",
    explore: "Explore",
    collections: "Collections",
    contact: "Contact",
    rights: (year: number) => `© ${year} Velure. All rights reserved.`,
    note: "Orders confirmed personally via WhatsApp · No online payment required",
  },
  cart: {
    titleBag: "Your bag",
    titleDetails: "Your details",
    titleSent: "Order prepared",
    back: "Back to bag",
    close: "Close bag",
    steps: { bag: "Bag", details: "Details", sent: "WhatsApp" },
    emptyTitle: "Your bag is empty",
    emptyBody:
      "Add the fragrances you love, then send your order to our concierge on WhatsApp in one tap.",
    emptyCta: "Explore fragrances",
    addMoreBefore: "Add",
    addMoreAfter: "more for complimentary shipping.",
    freeUnlocked: "Complimentary shipping unlocked.",
    remove: "Remove",
    subtotal: "Subtotal",
    shippingConfirmed: "Shipping is confirmed by your concierge. ",
    nothingCharged: "Nothing is charged now — you pay only after we confirm on WhatsApp.",
    continue: "Continue",
    detailsIntro:
      "Just a few details so our concierge can prepare your order. We will reach you on the WhatsApp number you send from.",
    name: "Full name",
    nameError: "Please tell us your name so our concierge can address you.",
    city: "Delivery city",
    cityPlaceholder: "Helps us quote shipping",
    note: "Note for the concierge",
    notePlaceholder: "Gift wrapping, preferred delivery time…",
    send: "Send order via WhatsApp",
    sendHintTop: "WhatsApp opens with your order summary ready.",
    sendHintBottom: "Review it, then press send.",
    reference: (ref: string) => `Reference ${ref}`,
    thanks: (name: string) => `Thank you, ${name}.`,
    readyBefore: "Your order of",
    readyAfter: "is ready in WhatsApp. No payment has been taken.",
    next: [
      "Press send in WhatsApp to deliver your order.",
      "Our concierge confirms availability, shipping and the final total.",
      "Pay using the details we share — then we dispatch.",
    ],
    reopen: "WhatsApp didn't open? Tap here",
    keepBrowsing: "Continue browsing",
  },
  productDialog: {
    close: "Close details",
    reviews: (rating: string, count: number) =>
      `${rating} · ${count} ${count === 1 ? "review" : "reviews"}`,
    photo: (n: number) => `Show photo ${n}`,
    forWhom: "Worn by",
    addToBag: (price: string) => `Add to bag · ${price}`,
    ask: "Ask about this scent",
  },
  search: {
    title: "Search fragrances",
    placeholder: "Search by name, note or collection",
    close: "Close search",
    collection: (name: string) => `${name} collection`,
    noMatch: (query: string) => `No match for “${query}”`,
    tryBefore: "Try a note like “vanilla”, or",
    askConcierge: "ask our concierge",
  },
  toast: {
    title: "Added to your bag",
    viewBag: "View bag",
    dismiss: "Dismiss",
  },
  floating: {
    label: "Chat with a concierge on WhatsApp",
    short: "Concierge",
  },
  whatsapp: {
    header: "VELURE — ORDER REQUEST",
    reference: "Reference",
    date: "Date",
    customer: "CUSTOMER",
    name: "Name",
    city: "City",
    details: "ORDER DETAILS",
    items: "Items",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    free: "Complimentary",
    tbc: "To be confirmed",
    exclShipping: "(excl. shipping)",
    notes: "NOTES",
    closing:
      "Good day, I would like to place the order above. Kindly confirm availability, shipping and payment details.",
    thanks: "Thank you.",
    concierge: "Good day, I would like some help choosing a Velure fragrance.",
    inquiry: (name: string, details: string) =>
      `Good day, I would like to know more about *${name}*${details ? ` (${details})` : ""}.`,
  },
};

export type Dictionary = typeof en;
