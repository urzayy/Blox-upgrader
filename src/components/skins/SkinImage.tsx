import { motion } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  zoom?: number;
  layoutId?: string;
  className?: string;
}

export function SkinImage({ src, alt, zoom = 1.16, layoutId, className = '' }: Props) {
  const size = `${Math.round(zoom * 100)}%`;

  const img = layoutId ? (
    <motion.img
      layoutId={layoutId}
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      className="pointer-events-none max-h-none max-w-none select-none object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]"
      style={{ width: size, height: size }}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.25'; }}
    />
  ) : (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      className="pointer-events-none max-h-none max-w-none select-none object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]"
      style={{ width: size, height: size }}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.25'; }}
    />
  );

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}>
      {img}
    </div>
  );
}
