// ────────────────────────────────────────────────────────────────
//  JERSEY SPOT CHENNAI — site config
// ────────────────────────────────────────────────────────────────

export const SHOP = {
  name: 'Jersey Spot',
  city: 'Chennai',
  est: '2019',
  tagline: 'Wear Your Pride, Play With Passion',

  // WhatsApp number in international format, digits only (no +, no spaces).
  whatsapp: '917871740302',

  instagram: 'https://www.instagram.com/jersey.spot_chennai/',
  instagramHandle: '@jersey.spot_chennai',

  address: 'No.42A, Chinnamathur Road, Manali, Chennai - 600068',
  mapsUrl: 'https://maps.google.com/?q=No.42A,+Chinnamathur+Road,+Manali,+Chennai+-+600068',

  hours: 'Mon – Sun · 10:00 AM – 9:30 PM',
  phoneDisplay: '+91 78717 40302',
};

// Build a WhatsApp deep link with a prefilled message.
export function waLink(message) {
  const text = encodeURIComponent(message || `Hi ${SHOP.name}! I'd like to order a jersey.`);
  return `https://wa.me/${SHOP.whatsapp}?text=${text}`;
}
