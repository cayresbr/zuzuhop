"use client";

import { useRouter } from "next/navigation";

export function SairButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/sair", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-full bg-grape-50 px-4 py-2 text-sm font-bold text-grape-700 transition hover:bg-grape-100"
    >
      Sair
    </button>
  );
}
