import { useAuth } from '../../context/AuthContext';
import { DEV_CLEAN_HEADER_LAYOUT } from '../../lib/devCleanHeaderLayout';
import { cleanHeaderChip } from '../../lib/cleanHeaderClasses';

function DoorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 4h9a2 2 0 0 1 2 2v1H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h9v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M13 8h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-7V8z"
        fill="currentColor"
      />
      <circle cx="17.5" cy="14" r="1.1" fill="#fecaca" />
      <path d="M11 12h2v2h-2z" fill="#fecaca" />
    </svg>
  );
}

export function LogoutDoorButton() {
  const { logout } = useAuth();
  const clean = DEV_CLEAN_HEADER_LAYOUT;
  const sizeClass = clean ? 'h-11 w-11' : 'h-12 w-12';

  return (
    <button
      type="button"
      onClick={logout}
      title="Cerrar sesión"
      aria-label="Cerrar sesión"
      className={`flex shrink-0 items-center justify-center rounded-full border transition ${sizeClass} ${
        clean
          ? `${cleanHeaderChip(false)} border-rose-500/35 text-rose-400 hover:border-rose-400/55 hover:bg-rose-500/10 hover:text-rose-300`
          : 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:border-rose-400 hover:bg-rose-500/20 hover:text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.15)]'
      }`}
    >
      <DoorIcon />
    </button>
  );
}
