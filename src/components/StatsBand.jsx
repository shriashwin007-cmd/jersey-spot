import { Counter } from './anim';

const STATS = [
  { v: 12000, suffix: '+', l: 'Kits Delivered' },
  { v: 6, suffix: ' yrs', l: 'Serving Chennai' },
  { v: 4.9, suffix: '★', l: 'Avg. Rating' },
  { v: 48, suffix: 'h', l: 'Turnaround' },
];

export default function StatsBand() {
  return (
    <section className="stats-band" aria-label="Jersey Spot in numbers">
      <div className="container stats-band-grid">
        {STATS.map((s, i) => (
          <div className="stat-cell" key={s.l}>
            <Counter className="stat-num" value={s.v} suffix={s.suffix} />
            <div className="stat-cap">{s.l}</div>
            {i < STATS.length - 1 && <span className="stat-div" aria-hidden />}
          </div>
        ))}
      </div>
    </section>
  );
}
