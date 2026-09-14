/**
 * Mascotes do Zuzuhop.
 *
 * Zuzu é uma coelha exploradora — o "hop" da marca é o pulo dela. Hop é o
 * robozinho que ela construiu. Os dois seguem a regra que o estudo do
 * concorrente apontou como acerto: personagem tem PAPEL (explora, inventa),
 * nunca marcação de gênero. É assim que o mesmo conteúdo atrai meninas e
 * meninos.
 *
 * Tudo é SVG inline: nenhuma requisição externa (a CSP bloqueia terceiros),
 * escala sem perder nitidez e as expressões mudam por prop, sem novo asset.
 */

export type Mood = "feliz" | "comemorando" | "sonolento" | "curioso";

interface MascotProps {
  mood?: Mood;
  /** Largura em pixels. A altura acompanha a proporção. */
  size?: number;
  className?: string;
  /** Mascote decorativo não é anunciado por leitor de tela. */
  label?: string;
}

/** Olhos: a piscada é o que separa "desenho" de "personagem vivo". */
function Eyes({ mood, cx1, cx2, cy }: { mood: Mood; cx1: number; cx2: number; cy: number }) {
  if (mood === "sonolento") {
    return (
      <g stroke="#2b2140" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d={`M ${cx1 - 7} ${cy} q 7 6 14 0`} />
        <path d={`M ${cx2 - 7} ${cy} q 7 6 14 0`} />
      </g>
    );
  }

  if (mood === "comemorando") {
    // Olhos em "^^": o sorriso que sobe até os olhos.
    return (
      <g stroke="#2b2140" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d={`M ${cx1 - 8} ${cy + 3} q 8 -11 16 0`} />
        <path d={`M ${cx2 - 8} ${cy + 3} q 8 -11 16 0`} />
      </g>
    );
  }

  const squint = mood === "curioso";

  return (
    <g>
      {[cx1, cx2].map((cx) => (
        <g key={cx} style={{ transformOrigin: `${cx}px ${cy}px` }} className="animate-[blink_5.5s_ease-in-out_infinite]">
          <ellipse cx={cx} cy={cy} rx="6" ry={squint ? 5 : 7.5} fill="#2b2140" />
          <circle cx={cx + 2.2} cy={cy - 2.6} r="2.3" fill="#ffffff" />
          <circle cx={cx - 2.4} cy={cy + 2.4} r="1.1" fill="#ffffff" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

function Mouth({ mood, cx, cy }: { mood: Mood; cx: number; cy: number }) {
  if (mood === "comemorando") {
    return (
      <g>
        <path
          d={`M ${cx - 11} ${cy} a 11 11 0 0 0 22 0 z`}
          fill="#2b2140"
        />
        <path d={`M ${cx - 5} ${cy + 7} a 5 4 0 0 0 10 0 z`} fill="#ff8d8d" />
      </g>
    );
  }

  if (mood === "sonolento") {
    return <ellipse cx={cx} cy={cy + 2} rx="5" ry="6" fill="#2b2140" opacity="0.85" />;
  }

  return (
    <path
      d={`M ${cx - 9} ${cy - 1} q 9 9 18 0`}
      stroke="#2b2140"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
  );
}

/* ---------------------------------------------------------------------------
   Zuzu — a coelha exploradora
   --------------------------------------------------------------------------- */

export function Zuzu({ mood = "feliz", size = 160, className = "", label }: MascotProps) {
  return (
    <svg
      viewBox="0 0 140 196"
      width={size}
      height={(size * 196) / 140}
      className={className}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Orelhas — o traço mais reconhecível da silhueta */}
      <g>
        <ellipse cx="48" cy="42" rx="13" ry="36" fill="#9b73ff" transform="rotate(-11 48 42)" />
        <ellipse cx="48" cy="44" rx="6.5" ry="25" fill="#ffb8c6" transform="rotate(-11 48 44)" />
        <ellipse cx="92" cy="42" rx="13" ry="36" fill="#9b73ff" transform="rotate(11 92 42)" />
        <ellipse cx="92" cy="44" rx="6.5" ry="25" fill="#ffb8c6" transform="rotate(11 92 44)" />
      </g>

      {/* Corpo */}
      <ellipse cx="70" cy="146" rx="40" ry="41" fill="#9b73ff" />
      <ellipse cx="70" cy="152" rx="27" ry="29" fill="#e9e0ff" />

      {/* Braços */}
      <ellipse cx="27" cy="140" rx="11" ry="17" fill="#8a5efc" transform="rotate(-14 27 140)" />
      <ellipse cx="113" cy="140" rx="11" ry="17" fill="#8a5efc" transform="rotate(14 113 140)" />

      {/* Pés */}
      <ellipse cx="50" cy="184" rx="17" ry="10" fill="#e9e0ff" />
      <ellipse cx="90" cy="184" rx="17" ry="10" fill="#e9e0ff" />

      {/* Cabeça */}
      <circle cx="70" cy="94" r="38" fill="#b99cff" />
      <ellipse cx="70" cy="104" rx="26" ry="21" fill="#e9e0ff" />

      {/* Bochechas */}
      <circle cx="40" cy="102" r="8.5" fill="#ff8d8d" opacity="0.5" />
      <circle cx="100" cy="102" r="8.5" fill="#ff8d8d" opacity="0.5" />

      <Eyes mood={mood} cx1={57} cx2={83} cy={90} />

      {/* Focinho */}
      <path d="M 70 100 l -6 -5 h 12 z" fill="#ff6b8a" />
      <Mouth mood={mood} cx={70} cy={108} />

      {/* Bigodes */}
      <g stroke="#2b2140" strokeWidth="2" strokeLinecap="round" opacity="0.45">
        <path d="M 38 106 h -12" />
        <path d="M 38 113 l -11 4" />
        <path d="M 102 106 h 12" />
        <path d="M 102 113 l 11 4" />
      </g>

      {mood === "sonolento" ? (
        <g fill="#7c4dff" fontFamily="var(--font-display)" fontWeight="800">
          <text x="108" y="62" fontSize="17" opacity="0.85">z</text>
          <text x="119" y="46" fontSize="22" opacity="0.6">z</text>
        </g>
      ) : null}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Hop — o robozinho que a Zuzu construiu
   --------------------------------------------------------------------------- */

export function Hop({ mood = "feliz", size = 150, className = "", label }: MascotProps) {
  const eyeGlow = mood === "sonolento" ? "#6b6285" : "#4fe0b2";

  return (
    <svg
      viewBox="0 0 140 190"
      width={size}
      height={(size * 190) / 140}
      className={className}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Antena */}
      <path d="M 70 30 V 14" stroke="#0a8b66" strokeWidth="5" strokeLinecap="round" />
      <circle cx="70" cy="10" r="8" fill="#ffb224" />
      <circle cx="70" cy="10" r="8" fill="#ffb224" opacity="0.45">
        <animate attributeName="r" values="8;13;8" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0;0.45" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Corpo */}
      <rect x="30" y="106" width="80" height="62" rx="24" fill="#23c896" />
      <rect x="42" y="118" width="56" height="34" rx="14" fill="#c5f9e5" />
      {/* Coração no peito — o Hop foi feito com carinho */}
      <path
        d="M 70 146 c -10 -7 -16 -13 -16 -19 a 8 8 0 0 1 16 -4 a 8 8 0 0 1 16 4 c 0 6 -6 12 -16 19 z"
        fill="#ff6363"
      />

      {/* Braços */}
      <rect x="10" y="112" width="18" height="42" rx="9" fill="#0fae7e" />
      <rect x="112" y="112" width="18" height="42" rx="9" fill="#0fae7e" />

      {/* Pés */}
      <rect x="38" y="164" width="26" height="16" rx="8" fill="#0a8b66" />
      <rect x="76" y="164" width="26" height="16" rx="8" fill="#0a8b66" />

      {/* Cabeça */}
      <rect x="24" y="28" width="92" height="76" rx="28" fill="#4fe0b2" />
      <rect x="34" y="40" width="72" height="50" rx="20" fill="#09684d" />

      {/* Olhos luminosos */}
      {mood === "sonolento" ? (
        <g stroke={eyeGlow} strokeWidth="5" strokeLinecap="round">
          <path d="M 50 66 h 14" />
          <path d="M 76 66 h 14" />
        </g>
      ) : mood === "comemorando" ? (
        <g stroke={eyeGlow} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M 49 70 q 8 -12 16 0" />
          <path d="M 75 70 q 8 -12 16 0" />
        </g>
      ) : (
        <g fill={eyeGlow}>
          {[57, 83].map((cx) => (
            <g key={cx} style={{ transformOrigin: `${cx}px 66px` }} className="animate-[blink_6.5s_ease-in-out_infinite]">
              <circle cx={cx} cy="66" r={mood === "curioso" ? 7 : 9} />
              <circle cx={cx + 3} cy="63" r="3" fill="#ffffff" />
            </g>
          ))}
        </g>
      )}

      {/* Sorriso de luz */}
      <path
        d="M 58 84 q 12 9 24 0"
        stroke={eyeGlow}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity={mood === "sonolento" ? 0.4 : 0.9}
      />

      {/* Bochechas */}
      <circle cx="36" cy="76" r="6" fill="#ffb224" opacity="0.7" />
      <circle cx="104" cy="76" r="6" fill="#ffb224" opacity="0.7" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Dupla, para telas de destaque
   --------------------------------------------------------------------------- */

export function ZuzuEHop({
  size = 170,
  mood = "feliz",
  className = "",
}: {
  size?: number;
  mood?: Mood;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-center gap-1 ${className}`}>
      <Zuzu mood={mood} size={size} className="animate-breathe" />
      <Hop
        mood={mood}
        size={size * 0.78}
        className="animate-float-slow"
        label="Zuzu e Hop, os amigos do Zuzuhop"
      />
    </div>
  );
}
