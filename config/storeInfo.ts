// The single source of truth for business details. The About section and the footer both read
// from here, so update a phone number, the hours or a link in one place.
//
// PLACEHOLDERS: the address, phone, email, founding year, social links and story below are sample
// values (a Montevideo address and a +598 number). Replace them with the real business details.

export interface HoursRow {
  days: string;
  times: string;
}

export const storeInfo = {
  name: "Merkado",
  summary: "Pasta artesanal fresca, hecha todos los días con recetas familiares de siempre.",
  foundedYear: 2018,
  copyrightYear: 2026,

  address: {
    street: "Calle Ejemplo 1234",
    area: "Cordón",
    city: "Montevideo",
  },

  phone: { display: "+598 2 123 4567", tel: "+59821234567" },
  email: "hola@merkado.example",
  // WhatsApp orders use NEXT_PUBLIC_WHATSAPP_NUMBER (digits, with country code). See lib/format.ts.

  hours: [
    { days: "Martes a domingo", times: "11:30 a 15:30 y 19:00 a 23:00" },
    { days: "Lunes", times: "Cerrado" },
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
      "Todas las mañanas estiramos, cortamos y rellenamos la pasta a mano en una cocina chica, con las mismas recetas de familia con las que crecimos. Huevos de chacras cercanas, harina molida en la región y quesos hechos en pequeñas tandas.",
      "Cocinamos solo lo que serviríamos en nuestra propia mesa, así que nada queda guardado en una estantería. Pedí hoy y tu pasta se hace hoy.",
      "Retirala en el local o pedí que te la llevemos, y consultanos lo que quieras sobre tiempos de cocción o salsas. Con gusto te ayudamos.",
    ],
    // Photo: hands feeding fresh tagliatelle through a pasta machine, from Unsplash (Unsplash License).
    imageUrl: "https://images.unsplash.com/photo-1642354571956-d77dfd9596bb?w=1200&q=70&auto=format",
    imageAlt: "Manos guiando tagliatelle fresco al salir de una máquina de pasta",
  },
} as const;

export const addressLine = () =>
  `${storeInfo.address.street}, ${storeInfo.address.area}, ${storeInfo.address.city}`;
