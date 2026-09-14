"use client";

import { useActionState } from "react";
import { Alert, Button, Field, inputClass } from "@/components/ui";
import { AVATAR_EMOJI, THEME_BG } from "@/lib/avatars";
import { AVATARS, CATEGORIES, THEME_COLORS } from "@/lib/validation";
import { CATEGORY_LABELS } from "@/games/catalog";
import type { ActionState } from "../actions";

export interface ProfileFormValues {
  id?: string;
  nickname: string;
  birthYear: number;
  avatar: string;
  themeColor: string;
  dailyLimitMinutes: number;
  allowedCategories: string[] | null;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 9 }, (_, index) => currentYear - index);

// Faixas alinhadas às recomendações da Sociedade Brasileira de Pediatria.
const LIMIT_OPTIONS = [15, 20, 30, 45, 60, 90];

export function ProfileForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: ProfileFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {initial.id ? <input type="hidden" name="childId" value={initial.id} /> : null}
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field
        label="Apelido da criança"
        hint="Use só o apelido. Nunca peça nome completo, escola ou endereço."
        error={state.fields?.nickname}
      >
        <input
          name="nickname"
          defaultValue={initial.nickname}
          required
          maxLength={20}
          className={inputClass}
          placeholder="Ex.: Tetê"
        />
      </Field>

      <Field
        label="Ano de nascimento"
        hint="Só o ano — é o suficiente para escolher o conteúdo adequado à idade."
        error={state.fields?.birthYear}
      >
        <select name="birthYear" defaultValue={initial.birthYear} className={inputClass}>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year} ({currentYear - year} anos)
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink">Avatar</legend>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((avatar) => (
            <label key={avatar} className="cursor-pointer">
              <input
                type="radio"
                name="avatar"
                value={avatar}
                defaultChecked={initial.avatar === avatar}
                className="peer sr-only"
              />
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-grape-50 text-3xl transition peer-checked:bg-grape-100 peer-checked:ring-4 peer-checked:ring-grape-500">
                {AVATAR_EMOJI[avatar]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink">Cor favorita</legend>
        <div className="flex flex-wrap gap-2">
          {THEME_COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="themeColor"
                value={color}
                defaultChecked={initial.themeColor === color}
                className="peer sr-only"
              />
              <span
                className={`block h-12 w-12 rounded-full ${THEME_BG[color]} transition peer-checked:ring-4 peer-checked:ring-ink`}
                aria-label={color}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Tempo de tela por dia"
        hint="Quando o tempo acaba, o app se despede e só volta no dia seguinte."
        error={state.fields?.dailyLimitMinutes}
      >
        <select
          name="dailyLimitMinutes"
          defaultValue={initial.dailyLimitMinutes}
          className={inputClass}
        >
          {LIMIT_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutos
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="mb-1 text-sm font-bold text-ink">
          Categorias liberadas
        </legend>
        <p className="mb-3 text-xs text-ink-soft">
          Não marque nenhuma para liberar todas.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center gap-3 rounded-2xl bg-grape-50 px-4 py-3 text-sm font-bold text-ink-soft"
            >
              <input
                type="checkbox"
                name="allowedCategories"
                value={category}
                defaultChecked={initial.allowedCategories?.includes(category) ?? false}
                className="h-5 w-5 accent-grape-500"
              />
              <span>
                <span aria-hidden>{CATEGORY_LABELS[category].emoji}</span>{" "}
                {CATEGORY_LABELS[category].label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-3 text-sm font-bold text-ink-soft">
          <input
            type="checkbox"
            name="soundEnabled"
            defaultChecked={initial.soundEnabled}
            className="h-5 w-5 accent-grape-500"
          />
          Efeitos sonoros e narração
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-ink-soft">
          <input
            type="checkbox"
            name="musicEnabled"
            defaultChecked={initial.musicEnabled}
            className="h-5 w-5 accent-grape-500"
          />
          Música de fundo
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
