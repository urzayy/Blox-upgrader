import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminPromoCodePanel } from './AdminPromoCodePanel';

type PanelMode = 'create' | 'delete' | 'view';

interface Props {
  adminEmail: string;
}

export function AdminPromoCodeControl({ adminEmail }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode | null>(null);

  const openPanel = (mode: PanelMode) => {
    setMenuOpen(false);
    setPanelMode(mode);
  };

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-gold transition hover:border-gold/55 hover:bg-gold/15"
        >
          Promos
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close promo menu"
                className="fixed inset-0 z-[115]"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="absolute bottom-full right-0 z-[116] mb-2 w-[min(92vw,240px)] overflow-hidden rounded-xl border border-gold/25 bg-[#100d1a] shadow-[0_12px_40px_rgba(0,0,0,0.75),0_0_20px_rgba(176,108,255,0.08)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openPanel('create')}
                  className="block w-full border-b border-white/5 px-3 py-2.5 text-left font-display text-[10px] font-bold uppercase tracking-wide text-gold transition hover:bg-gold/10"
                >
                  1. Create promo code
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openPanel('delete')}
                  className="block w-full border-b border-white/5 px-3 py-2.5 text-left font-display text-[10px] font-bold uppercase tracking-wide text-white/80 transition hover:bg-white/5"
                >
                  2. Delete promo code
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openPanel('view')}
                  className="block w-full px-3 py-2.5 text-left font-display text-[10px] font-bold uppercase tracking-wide text-white/80 transition hover:bg-white/5"
                >
                  3. View promo codes
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {panelMode && (
        <AdminPromoCodePanel
          open
          mode={panelMode}
          adminEmail={adminEmail}
          onClose={() => setPanelMode(null)}
        />
      )}
    </>
  );
}
