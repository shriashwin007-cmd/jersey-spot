// ────────────────────────────────────────────────────────────────
//  JERSEY SPOT CHENNAI — site config
//  ⚠️ REPLACE the placeholder values below with the real shop details.
// ────────────────────────────────────────────────────────────────

export const SHOP = {
  name: 'Jersey Spot',
  city: 'Chennai',
  est: '2019',
  tagline: 'Wear Your Pride, Play With Passion',

  // WhatsApp number in international format, digits only (no +, no spaces).
  // e.g. India number 98765 43210  ->  '919876543210'
  whatsapp: '919876543210', // ← REPLACE with the shop's real WhatsApp number

  instagram: 'https://www.instagram.com/jersey.spot_chennai/',
  instagramHandle: '@jersey.spot_chennai',

  // Store address / map — REPLACE with the real address.
  address: 'Your Store Address, Chennai, Tamil Nadu',
  mapsUrl: 'https://maps.google.com/?q=Jersey+Spot+Chennai',

  hours: 'Mon – Sun · 10:00 AM – 9:30 PM',
  phoneDisplay: '+91 98765 43210', // ← REPLACE
};

// Build a WhatsApp deep link with a prefilled message.
export function waLink(message) {
  const text = encodeURIComponent(message || `Hi ${SHOP.name}! I'd like to order a jersey.`);
  return `https://wa.me/${SHOP.whatsapp}?text=${text}`;
}
