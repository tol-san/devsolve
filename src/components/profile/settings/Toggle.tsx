interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        checked
          ? "bg-primary"
          : "bg-slate-200 dark:bg-neutral-700"
      }`}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform duration-200"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}