'use client';

const STEPS = [
  {
    n: '01',
    title: 'Forge',
    body: 'Name a piece and set the craft target it must reach. The piece opens at zero on the bench, ready for its first draft.',
  },
  {
    n: '02',
    title: 'Temper',
    body: 'Submit a refined draft. The Master Assessor reads it against the target and returns a craftsmanship score, the weakest flaws, and one directive.',
  },
  {
    n: '03',
    title: 'Anchor',
    body: 'Validators independently re-score the same draft. Consensus holds when their scores agree within the tolerance band, so no single assessor decides alone.',
  },
  {
    n: '04',
    title: 'Seal',
    body: 'A draft that clears the seal bar and beats the prior best locks the piece immutable. The amber stamp lands and the lineage closes.',
  },
];

// "How the honing works" rite, placed LOWER than the live bench data.
export function HoningRite() {
  return (
    <section
      id="rite"
      className="border-b border-[var(--hairline)] px-6 py-16"
      aria-label="How the honing works"
    >
      <div className="mx-auto w-full max-w-6xl">
        <span className="eyebrow">The rite</span>
        <h2 className="mt-3 text-3xl text-chalk sm:text-4xl">How the honing works</h2>
        <hr className="rule-machined my-8" />
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[var(--machined)] p-6">
              <span className="numeral text-4xl text-hone">{s.n}</span>
              <h3 className="mt-3 text-xl text-chalk">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ash">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
