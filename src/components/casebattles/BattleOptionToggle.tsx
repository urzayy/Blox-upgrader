interface Props<T extends string> {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  activeClassName?: string;
}

export function BattleOptionToggle<T extends string>({
  label,
  value,
  options,
  onChange,
  activeClassName = 'bg-lime-400 text-[#10140f]',
}: Props<T>) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>
      <div className="inline-flex rounded-lg border border-white/10 bg-[#171a22] p-1">
        {options.map(option => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-md px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.1em] transition sm:text-[11px] ${
                active
                  ? activeClassName
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
