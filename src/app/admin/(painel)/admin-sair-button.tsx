"use client";

import { useRouter } from "next/navigation";

export function AdminSairButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/sair", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
    >
      Sair
    </button>
  );
}
