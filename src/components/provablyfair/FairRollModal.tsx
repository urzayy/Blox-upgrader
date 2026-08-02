import type { FairRollProof } from '../../lib/provablyFair';
import { navigateToFairVerify } from '../../lib/fairVerifyNavigation';

interface ButtonProps {
  proof: FairRollProof;
  label?: string;
  compact?: boolean;
}

export function CheckRollButton({ proof, label = 'Check roll', compact }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={() => navigateToFairVerify(proof)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-[#1a1530] font-display font-black uppercase tracking-[0.08em] text-white/80 transition hover:border-win/35 hover:text-win ${
        compact ? 'px-3 py-2 text-[10px]' : 'px-4 py-2.5 text-xs'
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path
          d="M8 1.5 9.6 5.8 14.2 6.2 10.8 9.1 11.8 13.6 8 11.4 4.2 13.6 5.2 9.1 1.8 6.2 6.4 5.8 8 1.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
