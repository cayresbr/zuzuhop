"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ciclo de vida de uma partida:
 *  - conta o tempo de tela enquanto a aba está visível (pausa em background);
 *  - envia batidas (heartbeat) a cada 30s para o servidor debitar o limite diário;
 *  - envia o resultado final (pontos e estrelas) ao terminar.
 *
 * O limite de tempo é sempre validado no servidor. O cliente apenas reflete.
 */
export interface ScreenTimeState {
  remainingSeconds: number;
  blocked: boolean;
}

export function useGameSession(gameSlug: string) {
  const [screenTime, setScreenTime] = useState<ScreenTimeState | null>(null);
  const elapsedRef = useRef(0);
  const unsentRef = useRef(0);

  const flush = useCallback(
    async (payload?: { score: number; stars: number }) => {
      const seconds = unsentRef.current;
      if (seconds === 0 && !payload) return;
      unsentRef.current = 0;

      try {
        const response = await fetch("/api/kids/progresso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameSlug,
            seconds,
            score: payload?.score ?? 0,
            stars: payload?.stars ?? 0,
          }),
        });
        const data = (await response.json()) as {
          ok: boolean;
          screenTime?: ScreenTimeState;
        };
        if (data.screenTime) setScreenTime(data.screenTime);
      } catch {
        // Offline: devolve os segundos para a próxima tentativa.
        unsentRef.current += seconds;
      }
    },
    [gameSlug],
  );

  useEffect(() => {
    const ticker = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      elapsedRef.current += 1;
      unsentRef.current += 1;
      if (unsentRef.current >= 30) void flush();
    }, 1000);

    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.clearInterval(ticker);
      document.removeEventListener("visibilitychange", onHide);
      void flush();
    };
  }, [flush]);

  const finish = useCallback(
    (score: number, stars: number) => flush({ score, stars }),
    [flush],
  );

  return { screenTime, finish, elapsedSeconds: () => elapsedRef.current };
}
