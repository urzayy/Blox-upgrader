import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTierForPlayerLevel, profileRankIconUrl } from '../../lib/freeCaseTiers';
import { usePlayerLevel } from '../../hooks/usePlayerLevel';
import { resolveAvatarId } from '../../lib/profileAvatars';
import { notifyProfilePhotoUpdated } from '../../lib/profilePhotoEvents';
import { resizeImageFile, uploadProfilePhoto } from '../../lib/profilePhotoApi';
import { requestOpenDeposit } from '../../lib/uiActions';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { ProfilePhotoImage } from '../ui/ProfilePhotoImage';
import { CoinPrice } from '../ui/CoinPrice';
import { ProfilePaymentHistoryModal } from './ProfilePaymentHistoryModal';
import { ProfileHeaderSparkles } from './ProfileHeaderSparkles';

interface Props {
  balance: number;
}

function RankBadge({ level }: { level: number }) {
  const tier = getTierForPlayerLevel(level);

  return (
    <img
      src={profileRankIconUrl(tier)}
      alt=""
      className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.55)] lg:h-[4.5rem] lg:w-[4.5rem]"
      draggable={false}
    />
  );
}

export function ProfileHeaderCard({ balance }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const { photoUrl, refresh: refreshProfilePhoto } = useProfilePhoto(user?.userId);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);

  const level = usePlayerLevel();

  if (!user) return null;

  const avatarId = resolveAvatarId(user.avatarId, user.email);
  const displayName = user.nickname?.trim() || user.email.split('@')[0];
  const xpPercent = level.xpToNext > 0
    ? Math.min(100, (level.xp / level.xpToNext) * 100)
    : 100;

  const handleFileChange = async (file: File | undefined) => {
    if (!file || !user) return;
    if (!/^image\/(jpeg|jpg|png)$/i.test(file.type)) {
      setUploadError('Solo JPG o PNG.');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const dataUrl = await resizeImageFile(file);
      const result = await uploadProfilePhoto(user.userId, user.email, dataUrl);
      if (!result.ok) {
        setUploadError(result.error ?? 'No se pudo subir la foto.');
        return;
      }
      notifyProfilePhotoUpdated();
      void refreshProfilePhoto();
    } catch {
      setUploadError('No se pudo procesar la imagen.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141024]/95 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
        <ProfileHeaderSparkles />
        <div className="relative z-10 grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8 xl:gap-10 xl:p-9">
          {/* Level — left */}
          <div className="min-w-0 w-full lg:w-full lg:max-w-lg xl:max-w-xl lg:justify-self-start">
            <div className="flex items-start gap-4">
              <RankBadge level={level.level} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-xl font-bold text-white lg:text-2xl">{displayName}</p>
                  <span className="text-sky-400" title="Verificado">✓</span>
                </div>
                <p className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[#A855F7] lg:text-lg">
                  {level.rankLabel} | {level.level} LEVEL
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10 lg:h-2.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#A855F7] to-[#C084FC]"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-white/45">
                  {level.xp.toLocaleString('es-ES')} / {level.xpToNext.toLocaleString('es-ES')} XP
                </p>
              </div>
            </div>
          </div>

          {/* Avatar — center */}
          <div className="order-first flex justify-center lg:order-none lg:justify-self-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              title="Subir foto de perfil (JPG/PNG)"
              className="group relative"
            >
              <div
                className="relative rounded-full p-1"
                style={{
                  background: `conic-gradient(#A855F7 ${xpPercent}%, rgba(255,255,255,0.08) 0)`,
                }}
              >
                <div className="rounded-full bg-[#100d1a] p-1">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#1a1530] sm:h-36 sm:w-36 lg:h-44 lg:w-44 xl:h-48 xl:w-48">
                    <ProfilePhotoImage
                      photoUrl={photoUrl}
                      avatarId={avatarId}
                      size={120}
                      alt={displayName}
                      fill
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 rounded-full border border-[#A855F7]/60 bg-[#1a0a2e] px-2.5 py-1 font-display text-xs font-bold text-[#A855F7] lg:text-sm">
                {level.level}
              </span>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition group-hover:opacity-100">
                <span className="text-[10px] font-bold uppercase tracking-wide text-white">
                  {uploading ? 'Subiendo…' : 'Cambiar foto'}
                </span>
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={e => {
                void handleFileChange(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          {/* Wallet — right */}
          <div className="w-full min-w-0 lg:w-full lg:max-w-lg xl:max-w-xl lg:justify-self-end">
            <div className="w-full rounded-xl border border-win/25 bg-[#0f1a14]/90 px-6 py-5 sm:px-7 sm:py-5 lg:px-8 lg:py-6">
              <div className="flex items-center justify-between gap-5">
                <CoinPrice
                  value={balance}
                  iconClassName="h-6 w-6 sm:h-7 sm:w-7"
                  textClassName="font-display text-2xl font-black text-white sm:text-[1.65rem] lg:text-3xl"
                />
                <button
                  type="button"
                  onClick={requestOpenDeposit}
                  className="shrink-0 rounded-lg bg-gradient-to-r from-[#9333ea] to-[#b56bff] px-6 py-3.5 font-display text-xs font-black uppercase tracking-wide text-white transition hover:brightness-110 sm:px-8 sm:py-4 sm:text-sm"
                >
                  + Deposit
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAffiliateOpen(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#1a1530] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white/65 transition hover:border-white/20 hover:text-white lg:text-xs"
              >
                <span aria-hidden="true">👥</span>
                Affiliate
              </button>
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-[#1a1530] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-white/65 transition hover:border-white/20 hover:text-white lg:text-xs"
              >
                <span aria-hidden="true">🕘</span>
                History
              </button>
            </div>
            {uploadError && (
              <p className="mt-2 text-[11px] text-risk">{uploadError}</p>
            )}
          </div>
        </div>
      </section>

      <ProfilePaymentHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        userId={user.userId}
      />

      {affiliateOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setAffiliateOpen(false)}
          />
          <div className="relative max-w-md rounded-2xl border border-white/10 bg-[#151820] p-6 text-center shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Affiliate</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Send a message to <span className="font-semibold text-[#7b9cff]">@urzayy</span> in Discord to get more information.
            </p>
            <button
              type="button"
              onClick={() => setAffiliateOpen(false)}
              className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
