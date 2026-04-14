import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

type ConfettiPiece = {
  id: number;
  left: string;
  delayMs: number;
  durationMs: number;
  color: string;
  sizePx: number;
  shape: 'square' | 'circle' | 'diamond';
};

const CAT_EMOJIS = ['=^.^=', '=^o^=', '=^.^=~', '=^..^=', '=^_^='];
const CAT_ANIMATIONS = ['party-cats-dance-a', 'party-cats-dance-b', 'party-cats-dance-c'];
const CONFETTI_COLORS = ['#ff5a5f', '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#f78c6b'];
const BURST_SIZE = 32;
const BURST_INTERVAL_MS = 9000;
const PIECE_LIFETIME_MS = 3600;

export default function PartyCats() {
  const { darkMode } = useTheme();
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const burstSeedRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const cleanupTimersRef = useRef<number[]>([]);

  const stageCardClass = useMemo(
    () =>
      darkMode
        ? 'bg-gray-900/70 border-primary/40 text-light'
        : 'bg-white/75 border-amber-300/70 text-gray-900',
    [darkMode],
  );

  const createBurst = useCallback(() => {
    const seed = burstSeedRef.current;
    burstSeedRef.current += BURST_SIZE;

    const pieces = Array.from({ length: BURST_SIZE }, (_, idx): ConfettiPiece => {
      const base = seed + idx;
      return {
        id: base,
        left: `${(base * 37) % 100}%`,
        delayMs: (base * 23) % 420,
        durationMs: 2300 + ((base * 41) % 1400),
        color: CONFETTI_COLORS[base % CONFETTI_COLORS.length],
        sizePx: 7 + (base % 6),
        shape: (['square', 'circle', 'diamond'] as const)[base % 3],
      };
    });

    setConfettiPieces((prev) => [...prev, ...pieces]);

    const timer = window.setTimeout(() => {
      setConfettiPieces((prev) => prev.filter((piece) => !pieces.some((added) => added.id === piece.id)));
    }, PIECE_LIFETIME_MS + 450);

    cleanupTimersRef.current.push(timer);
  }, []);

  useEffect(() => {
    createBurst();
    intervalRef.current = window.setInterval(createBurst, BURST_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      cleanupTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      cleanupTimersRef.current = [];
    };
  }, [createBurst]);

  return (
    <section
      className={`party-cats-page relative overflow-hidden min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 ${darkMode ? 'bg-dark text-light' : 'bg-amber-50 text-gray-900'} transition-colors duration-300`}
    >
      <div className="party-cats-aurora" aria-hidden="true" />
      <div className="party-cats-grid" aria-hidden="true" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className={`${stageCardClass} party-cats-stage border rounded-3xl shadow-2xl p-6 sm:p-10`}>
          <p className="party-cats-kicker tracking-[0.18em] uppercase text-sm">Welcome To The</p>
          <h1 className="party-cats-title text-4xl sm:text-6xl leading-tight mt-3">Dancing Cat Parade</h1>
          <p className={`mt-5 text-base sm:text-lg max-w-2xl ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Neon paws, glitter tails, and non-stop groove mode. This corner of OctoCAT exists for
            pure feline joy and celebratory chaos.
          </p>
        </header>

        <div
          className={`mt-8 ${stageCardClass} border rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold">Main Stage</h2>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Every cat has a signature move. Watch them bounce, shimmy, and spin through confetti.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CAT_EMOJIS.map((cat, index) => (
              <article
                key={`${cat}-${index}`}
                className={`party-cats-cat-card ${darkMode ? 'bg-gray-800/80 border-primary/25' : 'bg-white/80 border-amber-300/60'} border rounded-2xl p-4 sm:p-5 text-center shadow-lg`}
              >
                <div
                  className={`party-cats-cat ${CAT_ANIMATIONS[index % CAT_ANIMATIONS.length]}`}
                  aria-label={`Dancing cat ${index + 1}`}
                >
                  {cat}
                </div>
                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-primary">
                  Groove #{index + 1}
                </p>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={createBurst}
            className="mt-8 bg-primary hover:bg-accent text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Throw Extra Confetti
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            data-testid="confetti-piece"
            className={`party-cats-confetti ${piece.shape}`}
            style={{
              left: piece.left,
              width: `${piece.sizePx}px`,
              height: `${piece.sizePx}px`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delayMs}ms`,
              animationDuration: `${piece.durationMs}ms`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
