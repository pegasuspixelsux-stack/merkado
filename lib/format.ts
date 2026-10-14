const priceFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatPrice = (n: number) => priceFormat.format(n);

// Lowercase and strip accents so "noquis" finds "Ñoquis" and "jamon" finds "Jamón".
export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Set NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, with country code) to open a specific chat.
// Without it, WhatsApp opens its chat picker with the message prefilled.
export const whatsappLink = (message: string) => {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
