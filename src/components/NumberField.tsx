import { useEffect, useId, useRef, useState } from "react";

interface Props {
  id: string;
  label: string;
  value: number | null;
  onCommit: (value: number | null) => void;
  /** Return an error message, or null when the value is acceptable. */
  validate?: (value: number) => string | null;
  allowEmpty?: boolean;
  placeholder?: string;
  suffix?: string;
  hint?: string;
  step?: number;
  format?: (value: number) => string;
  className?: string;
  hideLabel?: boolean;
}

/** A text-entry number field that keeps the user's draft and only commits valid numbers. */
export function NumberField({
  id, label, value, onCommit, validate, allowEmpty = false, placeholder, suffix, hint, step = 1,
  format = String, className = "", hideLabel = false,
}: Props) {
  const [draft, setDraft] = useState(value === null ? "" : format(value));
  const [error, setError] = useState<string | null>(null);
  const focused = useRef(false);
  const hintId = useId();

  useEffect(() => {
    if (!focused.current) {
      setDraft(value === null ? "" : format(value));
      setError(null);
    }
  }, [value, format]);

  function parse(text: string): { ok: true; value: number | null } | { ok: false; message: string } {
    const clean = text.replace(/,/g, "").trim();
    if (clean === "") return allowEmpty ? { ok: true, value: null } : { ok: false, message: "Enter a number." };
    const n = Number(clean);
    if (!Number.isFinite(n)) return { ok: false, message: "Enter a number." };
    const message = validate?.(n);
    return message ? { ok: false, message } : { ok: true, value: n };
  }

  function update(text: string) {
    setDraft(text);
    const result = parse(text);
    if (result.ok) {
      setError(null);
      onCommit(result.value);
    } else {
      setError(result.message);
    }
  }

  function nudge(direction: 1 | -1, big: boolean) {
    const current = parse(draft);
    const base = current.ok && current.value !== null ? current.value : value ?? 0;
    const next = Math.round((base + direction * step * (big ? 10 : 1)) * 1e6) / 1e6;
    update(String(next));
  }

  const describedBy = [error ? `${hintId}-err` : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field ${error ? "field--error" : ""} ${className}`}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "field__label"}>{label}</label>
      <div className="field__control">
        <input
          id={id}
          className="field__input"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onFocus={() => (focused.current = true)}
          onBlur={() => {
            focused.current = false;
            const result = parse(draft);
            if (result.ok) setDraft(result.value === null ? "" : format(result.value));
          }}
          onChange={(e) => update(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              nudge(e.key === "ArrowUp" ? 1 : -1, e.shiftKey);
            }
          }}
        />
        {suffix && <span className="field__suffix" aria-hidden="true">{suffix}</span>}
      </div>
      {error && <p id={`${hintId}-err`} className="field__error" role="alert">{error}</p>}
      {hint && !error && <p id={hintId} className="field__hint">{hint}</p>}
    </div>
  );
}
