// Single source of truth for product categories — used by the admin panel,
// the gallery filters, the "What We Sell" cards, the footer and the contact
// form, so the list can't drift apart between them.
//
// `value` is the slug stored in the DB. 'printed' and 'embroidered' are kept
// as the original slugs on purpose: products already in the catalog use them,
// so relabelling (rather than renaming) means nothing already uploaded breaks.
// ('printed' was always described as sublimation/heat-press on this site.)
export const CATEGORIES = [
  {
    value: 'printed', label: 'Sublimation Jersey', tag: 'Everyday', from: 899,
    desc: 'Crisp sublimation & heat-press printing. Lightweight, breathable and ready for match day.',
  },
  {
    value: 'embroidered', label: 'Embroidery Jersey', tag: 'Signature', from: 1499,
    desc: 'Names, numbers and club crests stitched in-house for a premium, pro-club finish that lasts.',
  },
  {
    value: 'set', label: 'Set Jersey', tag: 'Full Kit', from: null,
    desc: 'Jersey and shorts as a matching set — kit out the whole squad in one go.',
  },
  {
    value: 'football', label: 'Football', tag: 'Match Grade', from: 499,
    desc: 'Training to match-quality footballs for turf and ground — sizes 3, 4 and 5 in stock.',
  },
  {
    value: 'boots', label: 'Boots', tag: 'On Foot', from: 1299,
    desc: 'Studs and turf boots built for real play — grip, comfort and control for every surface.',
  },
  {
    value: 'socks', label: 'Socks', tag: 'Match Day', from: null,
    desc: 'Grip and club socks that stay up through a full ninety minutes.',
  },
  {
    value: 'kitbags', label: 'Kitbags', tag: 'Carry', from: null,
    desc: 'Duffels and backpacks built to haul boots, balls and a full kit.',
  },
  {
    value: 'trackpants', label: 'Track Pants', tag: 'Training', from: null,
    desc: 'Warm-ups and training pants for the sideline and every session.',
  },
  {
    value: 'shorts', label: 'Shorts', tag: 'Match Day', from: null,
    desc: 'Match and training shorts, cut for movement and built to last.',
  },
  {
    value: 'polo', label: 'Polo T-Shirt', tag: 'Off Pitch', from: null,
    desc: 'Club polos for coaches, staff and off-pitch team wear.',
  },
];

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label || value;
