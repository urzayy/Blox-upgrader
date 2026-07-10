import { COIN_ICON_URL, formatPrice } from '../../lib/currency';

interface Props {
  value: number;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function CoinPrice({
  value,
  className = '',
  iconClassName = 'h-3.5 w-3.5',
  textClassName = '',
}: Props) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 ${className}`}>
      <img
        src={COIN_ICON_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`shrink-0 object-contain drop-shadow-[0_0_4px_rgba(176,108,255,0.35)] ${iconClassName}`}
      />
      <span className={`truncate tabular-nums ${textClassName}`}>{formatPrice(value)}</span>
    </span>
  );
}
