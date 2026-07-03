const ITEMS = [
  'Custom Jerseys', 'Embroidered Kits', 'Match Footballs', 'Pro Boots',
  'Team Orders', 'Football', 'Cricket', 'Basketball', 'Volleyball', 'Kabaddi',
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((t, i) => (
          <span className="marquee-item" key={i}>
            {t}
            <span className="marquee-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
