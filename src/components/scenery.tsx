/**
 * Cenários decorativos.
 *
 * Todos os valores de posição e atraso são CONSTANTES, não aleatórios: valor
 * sorteado em render quebra a hidratação do Next (servidor e cliente sorteiam
 * diferente). Constantes bem escolhidas parecem igualmente orgânicas.
 *
 * Nada aqui é anunciado por leitor de tela — é cenário, não conteúdo.
 */

const CLOUDS = [
  { top: "6%", scale: 1, duration: 58, delay: 0, opacity: 0.95 },
  { top: "16%", scale: 0.62, duration: 76, delay: -22, opacity: 0.8 },
  { top: "30%", scale: 0.82, duration: 64, delay: -44, opacity: 0.7 },
  { top: "46%", scale: 0.5, duration: 88, delay: -12, opacity: 0.55 },
];

function Cloud({ scale }: { scale: number }) {
  return (
    <svg
      viewBox="0 0 180 80"
      width={180 * scale}
      height={80 * scale}
      fill="#ffffff"
      aria-hidden="true"
    >
      <ellipse cx="52" cy="52" rx="42" ry="26" />
      <ellipse cx="94" cy="38" rx="36" ry="30" />
      <ellipse cx="132" cy="54" rx="34" ry="22" />
      <rect x="44" y="52" width="98" height="24" rx="12" />
    </svg>
  );
}

/** Céu com nuvens navegando e morros ao fundo. Fundo padrão do modo criança. */
export function SkyScene({
  children,
  className = "",
  tone = "dia",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "dia" | "tarde";
}) {
  const gradient =
    tone === "tarde"
      ? "from-mango-200 via-coral-100 to-grape-100"
      : "from-sky-200 via-sky-100 to-grape-50";

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${gradient} ${className}`}>
      {/* Sol */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mango-300 opacity-60 blur-2xl" />

      {/* Nuvens */}
      <div className="pointer-events-none absolute inset-0">
        {CLOUDS.map((cloud, index) => (
          <div
            key={index}
            className="animate-drift absolute"
            style={{
              top: cloud.top,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
              opacity: cloud.opacity,
            }}
          >
            <Cloud scale={cloud.scale} />
          </div>
        ))}
      </div>

      {/* Morros */}
      <svg
        viewBox="0 0 1440 260"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full sm:h-56"
        aria-hidden="true"
      >
        <path
          d="M0 150 C 180 90 300 190 460 150 C 640 104 760 200 940 158 C 1120 116 1280 186 1440 140 L1440 260 L0 260 Z"
          fill="#b0e75b"
          opacity="0.55"
        />
        <path
          d="M0 190 C 200 140 340 230 520 192 C 700 154 860 232 1040 196 C 1220 160 1330 214 1440 186 L1440 260 L0 260 Z"
          fill="#94d532"
          opacity="0.7"
        />
      </svg>

      <div className="relative">{children}</div>
    </div>
  );
}

const STARS = [
  { left: "8%", top: "12%", size: 10, delay: 0 },
  { left: "22%", top: "28%", size: 6, delay: 1.4 },
  { left: "37%", top: "9%", size: 8, delay: 0.7 },
  { left: "54%", top: "22%", size: 5, delay: 2.1 },
  { left: "68%", top: "14%", size: 11, delay: 1 },
  { left: "81%", top: "32%", size: 7, delay: 2.6 },
  { left: "91%", top: "18%", size: 6, delay: 0.4 },
  { left: "15%", top: "44%", size: 5, delay: 1.8 },
  { left: "74%", top: "48%", size: 8, delay: 0.2 },
];

/** Céu noturno. Usado na despedida quando o tempo de tela acaba. */
export function NightScene({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-[#241b45] via-grape-700 to-grape-500 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0">
        {STARS.map((star, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-mango-100"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animation: `breathe ${2.4 + star.delay}s ease-in-out ${star.delay}s infinite`,
              boxShadow: "0 0 12px rgba(255,238,194,0.9)",
            }}
          />
        ))}
        {/* Lua */}
        <div className="absolute right-10 top-12 h-24 w-24 rounded-full bg-mango-100 shadow-[0_0_60px_rgba(255,238,194,0.55)]">
          <div className="absolute right-1 top-1 h-20 w-20 rounded-full bg-gradient-to-b from-[#2a2050] to-grape-700" />
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

const CONFETTI = [
  { left: "4%", color: "#ff6363", delay: 0, duration: 2.8, size: 12 },
  { left: "12%", color: "#ffb224", delay: 0.3, duration: 3.4, size: 9 },
  { left: "21%", color: "#4fe0b2", delay: 0.1, duration: 3, size: 14 },
  { left: "29%", color: "#7c4dff", delay: 0.6, duration: 2.6, size: 10 },
  { left: "38%", color: "#3a9ef7", delay: 0.2, duration: 3.6, size: 12 },
  { left: "46%", color: "#ff8d8d", delay: 0.8, duration: 2.9, size: 8 },
  { left: "55%", color: "#94d532", delay: 0.05, duration: 3.2, size: 13 },
  { left: "63%", color: "#ffca52", delay: 0.5, duration: 2.7, size: 11 },
  { left: "71%", color: "#9b73ff", delay: 0.35, duration: 3.5, size: 9 },
  { left: "80%", color: "#23c896", delay: 0.15, duration: 3.1, size: 12 },
  { left: "88%", color: "#ff6363", delay: 0.7, duration: 2.8, size: 10 },
  { left: "95%", color: "#3a9ef7", delay: 0.45, duration: 3.3, size: 13 },
];

/** Chuva de confete. Aparece na vitória e some sozinha. */
export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="absolute top-0"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.5,
            backgroundColor: piece.color,
            borderRadius: index % 3 === 0 ? "999px" : "3px",
            animation: `confetti-fall ${piece.duration}s linear ${piece.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const BUBBLES = [
  { left: "10%", size: 42, duration: 13, delay: 0 },
  { left: "26%", size: 22, duration: 17, delay: 3 },
  { left: "48%", size: 34, duration: 15, delay: 6 },
  { left: "67%", size: 18, duration: 19, delay: 1.5 },
  { left: "84%", size: 48, duration: 14, delay: 8 },
];

/** Bolhas subindo devagar. Dá vida a fundos chapados sem roubar atenção. */
export function Bubbles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {BUBBLES.map((bubble, index) => (
        <span
          key={index}
          className="animate-rise absolute bottom-0 rounded-full border-2 border-white/50 bg-white/25"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

const SPARKS = [
  { x: "50%", y: "10%", delay: 0 },
  { x: "82%", y: "32%", delay: 0.08 },
  { x: "86%", y: "72%", delay: 0.16 },
  { x: "50%", y: "92%", delay: 0.06 },
  { x: "14%", y: "70%", delay: 0.14 },
  { x: "12%", y: "30%", delay: 0.1 },
];

/** Estrelinhas que estouram sobre um acerto. Dura menos de 1 segundo. */
export function Sparkles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {SPARKS.map((spark, index) => (
        <span
          key={index}
          className="animate-sparkle absolute text-2xl"
          style={{ left: spark.x, top: spark.y, animationDelay: `${spark.delay}s` }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}
