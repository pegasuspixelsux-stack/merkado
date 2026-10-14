// The single source of truth for business details. The About section and the footer both read
// from here, so update a phone number, the hours or a link in one place.
//
// PLACEHOLDERS: the address, phone, email, founding year, social links and story below are sample
// values. Replace them with the real business details before launch.

export interface HoursRow {
  days: string;
  times: string;
}

export const storeInfo = {
  name: "Merkado",
  summary: "Fresh, handcrafted artisanal pasta made daily with authentic family recipes.",
  foundedYear: 2018,
  copyrightYear: 2026,

  address: {
    street: "Calle Ejemplo 123",
    area: "Barrio Centro",
    city: "Ciudad",
  },

  phone: { display: "+54 11 5555 0123", tel: "+541155550123" },
  email: "hello@merkado.example",
  // WhatsApp orders use NEXT_PUBLIC_WHATSAPP_NUMBER (digits, with country code). See lib/format.ts.

  hours: [
    { days: "Tuesday to Sunday", times: "11:30 AM to 3:30 PM and 7:00 PM to 11:00 PM" },
    { days: "Monday", times: "Closed" },
  ] satisfies HoursRow[],
  pickup: true,
  delivery: true,

  // Social profiles. These point at each network's home page until you add your own handles.
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },

  about: {
    paragraphs: [
      "Every morning we roll, cut and fill our pasta by hand in a small kitchen, using the same family recipes we grew up with. Eggs from nearby farms, flour milled in the region and cheese made in small batches.",
      "We cook only what we would serve at our own table, so nothing sits on a shelf. Order today and your pasta is made today.",
      "Pick it up at the shop or have it delivered, and ask us anything about cooking times or sauces. We are happy to help.",
    ],
    // Photo: hands feeding fresh tagliatelle through a pasta machine, from Unsplash (Unsplash License).
    imageUrl: "https://images.unsplash.com/photo-1642354571956-d77dfd9596bb?w=1200&q=70&auto=format",
    imageAlt: "Hands guiding fresh tagliatelle out of a pasta machine",
  },
} as const;

export const addressLine = () =>
  `${storeInfo.address.street}, ${storeInfo.address.area}, ${storeInfo.address.city}`;
