"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "../components/GameShell";
import { useGameSession } from "../components/useGameSession";
import { sfx, speak } from "../sound";

/**
 * Espaço de criação livre. Sem pontuação, sem erro possível:
 * atividades abertas sustentam motivação intrínseca, que rewards
 * controladores ("faça isso para ganhar aquilo") tendem a corroer.
 */

const PALETTE = [
  { color: "#fa5252", name: "vermelho" },
  { color: "#ffa726", name: "laranja" },
  { color: "#ffd43b", name: "amarelo" },
  { color: "#82c91e", name: "verde" },
  { color: "#228be6", name: "azul" },
  { color: "#7c4dff", name: "roxo" },
  { color: "#f06595", name: "rosa" },
  { color: "#8d5524", name: "marrom" },
  { color: "#241c3b", name: "preto" },
  { color: "#ffffff", name: "borracha" },
];

const SIZES = [
  { width: 8, label: "fino", dot: "h-3 w-3" },
  { width: 20, label: "médio", dot: "h-5 w-5" },
  { width: 44, label: "grosso", dot: "h-8 w-8" },
];

const STAMPS = ["⭐", "❤️", "🌈", "🦕", "🚀", "🌸", "⚽", "🐙"];

export default function AtelieDePintura() {
  useGameSession("atelie-de-pintura");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const snapshots = useRef<ImageData[]>([]);

  const [color, setColor] = useState(PALETTE[0]!.color);
  const [width, setWidth] = useState(SIZES[1]!.width);
  const [stamp, setStamp] = useState<string | null>(null);

  const fillWhite = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // O canvas usa resolução física (devicePixelRatio) para o traço não sair borrado.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    fillWhite(canvas);
  }, [fillWhite]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const pushSnapshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    snapshots.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // Guarda no máximo 12 passos para não estourar a memória em tablets antigos.
    if (snapshots.current.length > 12) snapshots.current.shift();
  };

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pushSnapshot();
    const point = pointFrom(event);

    if (stamp) {
      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.font = "64px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stamp, point.x, point.y);
      sfx.pop();
      return;
    }

    drawingRef.current = true;
    lastPoint.current = point;
    sfx.tap();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || stamp) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const point = pointFrom(event);
    const previous = lastPoint.current ?? point;

    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPoint.current = point;
  };

  const onPointerUp = () => {
    drawingRef.current = false;
    lastPoint.current = null;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const snapshot = snapshots.current.pop();
    if (!canvas || !ctx || !snapshot) return;
    ctx.putImageData(snapshot, 0, 0);
    sfx.pop();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pushSnapshot();
    fillWhite(canvas);
    sfx.tap();
    speak("Prontinho! Folha limpa pra recomeçar.");
  };

  return (
    <GameShell
      title="Ateliê de Pintura"
      emoji="🖌️"
      color="lime"
      instruction="Escolha uma cor e desenhe o que você quiser!"
    >
      {/* Moldura: o canvas vira "folha de papel" apoiada numa prancheta */}
      <div className="rounded-blob bg-lime-700/25 p-3 soft-shadow">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Área de desenho"
          className="h-[50vh] w-full touch-none rounded-3xl bg-white shadow-inner"
        />
      </div>

      <div className="mt-4 rounded-blob bg-cream p-4 soft-shadow">
        {/* Cores */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PALETTE.map((entry) => {
            const active = color === entry.color && !stamp;
            const isEraser = entry.name === "borracha";
            return (
              <button
                key={entry.color}
                type="button"
                onClick={() => {
                  setColor(entry.color);
                  setStamp(null);
                  sfx.pop();
                  speak(entry.name);
                }}
                aria-label={entry.name}
                aria-pressed={active}
                className={`relative h-14 w-14 rounded-full border-4 transition-transform duration-150 active:scale-90 ${
                  active ? "scale-110 border-ink" : "border-white"
                }`}
                style={{
                  backgroundColor: entry.color,
                  boxShadow: active
                    ? "0 4px 0 0 rgba(43,33,64,0.35)"
                    : "0 3px 0 0 rgba(43,33,64,0.18)",
                }}
              >
                {isEraser ? (
                  <span className="text-xl" aria-hidden>
                    🧼
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Espessura do pincel */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {SIZES.map((size) => {
            const active = width === size.width && !stamp;
            return (
              <button
                key={size.width}
                type="button"
                onClick={() => {
                  setWidth(size.width);
                  setStamp(null);
                  sfx.pop();
                }}
                aria-label={`Pincel ${size.label}`}
                aria-pressed={active}
                className={`tap-target flex items-center justify-center rounded-2xl px-5 transition ${
                  active ? "bg-lime-100 ring-4 ring-lime-500" : "bg-white"
                }`}
              >
                <span className={`${size.dot} rounded-full bg-ink`} />
              </button>
            );
          })}
        </div>

        {/* Carimbos */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {STAMPS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStamp(item);
                sfx.pop();
              }}
              aria-label={`Carimbo ${item}`}
              aria-pressed={stamp === item}
              className={`tap-target rounded-2xl text-4xl transition-transform duration-150 active:scale-90 ${
                stamp === item ? "bg-lime-100 ring-4 ring-lime-500" : ""
              }`}
            >
              <span aria-hidden>{item}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={undo}
            className="chunky tap-target bg-mango-400 px-6 py-3 text-lg font-extrabold text-white"
            style={{ "--chunky-shade": "#9c5203" } as React.CSSProperties}
          >
            Voltar ↩️
          </button>
          <button
            type="button"
            onClick={clear}
            className="chunky tap-target bg-coral-500 px-6 py-3 text-lg font-extrabold text-white"
            style={{ "--chunky-shade": "#9c1d1d" } as React.CSSProperties}
          >
            Limpar 🧽
          </button>
        </div>
      </div>
    </GameShell>
  );
}
