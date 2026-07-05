import { useEffect, useState } from 'react';
import { inventoryTotal } from '../../lib/inventory';
import { CoinPrice } from '../ui/CoinPrice';
import { useAuth } from '../../context/AuthContext';
import { NicknameModal } from '../auth/NicknameModal';
import { AdminSkinPicker } from '../admin/AdminSkinPicker';
import { AdminGiftPanel } from '../admin/AdminGiftPanel';
import { AdminGiftMoneyPanel } from '../admin/AdminGiftMoneyPanel';
import { AdminWithdrawInbox } from '../admin/AdminWithdrawInbox';
import { WithdrawModal } from '../withdraw/WithdrawModal';
import { WithdrawChatModal } from '../withdraw/WithdrawChatModal';
import { DepositModal, type DepositItem } from '../deposit/DepositModal';
import { LiveChatsInbox } from '../support/LiveChatsInbox';
import { fetchAdminWithdrawTickets, fetchUserWithdrawTickets, type WithdrawTicket } from '../../lib/withdrawChat';
import { useActivityLog } from '../../hooks/useActivityLog';
import type { Skin } from '../../data/skins';

interface Props {
  inventory: Skin[];
  balance: number;
  lockedSkinIds: ReadonlySet<string>;
  totalUpgrades: number;
  playersOnline: number;
  turbo: boolean;
  onTurboToggle: () => void;
  onLogout: () => void;
  onAdminGrantSkin: (skin: Skin) => void;
  onWithdrawRequest: (skins: Skin[]) => Promise<string | null>;
  onDepositRequest: (items: DepositItem[]) => Promise<string | null>;
  onSupportTicketCompleted: (ticket: WithdrawTicket) => void;
  onAdminGiftSent?: (targetEmail: string, skin: Skin, quantity: number) => void;
}

export function Header({
  inventory,
  balance,
  lockedSkinIds,
  totalUpgrades,
  playersOnline,
  turbo,
  onTurboToggle,
  onLogout,
  onAdminGrantSkin,
  onWithdrawRequest,
  onDepositRequest,
  onSupportTicketCompleted,
  onAdminGiftSent,
}: Props) {
  const { user, profileLabel, openLogin, isAdmin } = useAuth();
  const { log } = useActivityLog();
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftMoneyOpen, setGiftMoneyOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [liveChatsOpen, setLiveChatsOpen] = useState(false);
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const [supportChatTicketId, setSupportChatTicketId] = useState<string | null>(null);
  const [adminInboxOpen, setAdminInboxOpen] = useState(false);
  const [openLiveChatCount, setOpenLiveChatCount] = useState(0);
  const [adminOpenChatCount, setAdminOpenChatCount] = useState(0);

  const openSupportChat = (ticketId: string) => {
    setSupportChatTicketId(ticketId);
    setSupportChatOpen(true);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const tickets = await fetchUserWithdrawTickets(user.userId);
        setOpenLiveChatCount(tickets.filter(t => t.status === 'open').length);
      } catch {
        setOpenLiveChatCount(0);
      }
    };
    void load();
    const id = setInterval(() => { void load(); }, 8000);
    return () => clearInterval(id);
  }, [user, liveChatsOpen, supportChatOpen, withdrawOpen, depositOpen]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        setAdminOpenChatCount((await fetchAdminWithdrawTickets(true)).length);
      } catch {
        setAdminOpenChatCount(0);
      }
    };
    void load();
    const id = setInterval(() => { void load(); }, 8000);
    return () => clearInterval(id);
  }, [isAdmin, adminInboxOpen, supportChatOpen]);

  return (
    <>
      <NicknameModal open={nicknameOpen} onClose={() => setNicknameOpen(false)} />
      <AdminSkinPicker
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        onGrant={skin => {
          onAdminGrantSkin(skin);
          setAdminOpen(false);
        }}
      />
      {user && isAdmin && (
        <AdminGiftMoneyPanel
          open={giftMoneyOpen}
          adminEmail={user.email}
          onClose={() => setGiftMoneyOpen(false)}
          onGiftSent={(targetEmail, amount) => {
            log('DEPOSIT.admin_gift_money', {
              target: targetEmail,
              amount,
            });
          }}
        />
      )}
      {user && isAdmin && (
        <AdminGiftPanel
          open={giftOpen}
          adminEmail={user.email}
          onClose={() => setGiftOpen(false)}
          onGiftSent={(targetEmail, skin, quantity) => {
            log('DEPOSIT.admin_gift', {
              target: targetEmail,
              skin: skin.name,
              quantity,
              price: skin.price,
              weapon: skin.weapon,
            });
            onAdminGiftSent?.(targetEmail, skin, quantity);
          }}
        />
      )}
      <WithdrawModal
        open={withdrawOpen}
        inventory={inventory}
        lockedSkinIds={lockedSkinIds}
        onClose={() => setWithdrawOpen(false)}
        onRequestWithdraw={async skins => {
          const ticketId = await onWithdrawRequest(skins);
          if (ticketId) openSupportChat(ticketId);
          return ticketId;
        }}
      />
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onRequestDeposit={async items => {
          const ticketId = await onDepositRequest(items);
          if (ticketId) openSupportChat(ticketId);
          return ticketId;
        }}
      />
      {user && (
        <LiveChatsInbox
          open={liveChatsOpen}
          userId={user.userId}
          onClose={() => setLiveChatsOpen(false)}
          onOpenTicket={openSupportChat}
        />
      )}
      {user && (
        <WithdrawChatModal
          open={supportChatOpen}
          ticketId={supportChatTicketId}
          session={user}
          isAdmin={isAdmin}
          onClose={() => setSupportChatOpen(false)}
          onTicketCompleted={onSupportTicketCompleted}
        />
      )}
      <AdminWithdrawInbox
        open={adminInboxOpen}
        onClose={() => setAdminInboxOpen(false)}
        onOpenTicket={openSupportChat}
      />

      <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-white/5 bg-deep/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3 justify-self-start">
        <img
          src="/logo.png"
          alt="BloxUpgrader.com"
          className="h-12 w-auto shrink-0 object-contain"
          width={48}
          height={40}
        />

        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-panel/80 px-2.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win" />
            <span className="font-display text-[11px] font-semibold tabular-nums text-white/80">
              {playersOnline.toLocaleString('es-ES')}
            </span>
            <span className="text-[10px] text-white/40">online</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-panel/80 px-2.5 py-1">
            <span className="font-display text-[11px] font-semibold tabular-nums text-gold">
              {totalUpgrades.toLocaleString('es-ES')}
            </span>
            <span className="text-[10px] text-white/40">upgrades</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-self-center">
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => {
                log('CLICK.open_withdraw_inbox');
                setAdminInboxOpen(true);
              }}
              title="Chats en vivo — deposit y withdraw"
              className={`relative rounded-lg border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider transition ${
                adminInboxOpen || supportChatOpen
                  ? 'border-white/40 bg-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                  : 'border-white/25 bg-white/10 text-white/90 hover:border-white/40 hover:bg-white/15'
              }`}
            >
              CHATS
              {adminOpenChatCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-black text-deep">
                  {adminOpenChatCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                log('CLICK.open_admin_gift_money');
                setGiftMoneyOpen(true);
              }}
              title="Regalar SALDO a cualquier usuario por email"
              className={`rounded-lg border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider transition ${
                giftMoneyOpen
                  ? 'border-gold bg-gold/20 text-gold shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                  : 'border-gold/40 bg-gold/10 text-gold hover:border-gold hover:bg-gold/15'
              }`}
            >
              Gift Money
            </button>
            <button
              type="button"
              onClick={() => {
                log('CLICK.open_admin_gift');
                setGiftOpen(true);
              }}
              title="Regalar skins a cualquier usuario por email"
              className={`rounded-lg border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider transition ${
                giftOpen
                  ? 'border-gold bg-gold/20 text-gold shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                  : 'border-gold/40 bg-gold/10 text-gold hover:border-gold hover:bg-gold/15'
              }`}
            >
              Gift User
            </button>
            <button
            type="button"
            onClick={() => {
              log('CLICK.open_admin');
              setAdminOpen(true);
            }}
            title="Admin Mode — añadir skins a tu inventario"
            className={`rounded-lg border px-3 py-2 font-display text-[10px] font-bold uppercase tracking-wider transition ${
              adminOpen
                ? 'border-win bg-win/20 text-win shadow-[0_0_20px_rgba(0,230,118,0.25)]'
                : 'border-win/40 bg-win/10 text-win hover:border-win hover:bg-win/15'
            }`}
            >
              Admin
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onTurboToggle}
          title={turbo ? 'Turbo activado' : 'Turbo desactivado'}
          aria-pressed={turbo}
          aria-label={turbo ? 'Desactivar turbo' : 'Activar turbo'}
          className={`flex h-[42px] w-[42px] items-center justify-center rounded-lg border transition ${
            turbo
              ? 'border-gold bg-gold/15 shadow-gold'
              : 'border-white/10 bg-panel hover:border-gold/40'
          }`}
        >
          <LightningIcon active={turbo} />
        </button>
        <div className="flex items-center gap-1.5">
          <Stat label="Inventory value" value={inventoryTotal(inventory)} />
          <Stat label="SALDO" value={balance} />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-self-end">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  log('CLICK.open_live_chats');
                  setLiveChatsOpen(true);
                }}
                className={`relative rounded-lg border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur-xl transition ${
                  openLiveChatCount > 0 ? 'pr-7' : ''
                } ${
                  liveChatsOpen
                    ? 'border-win/40 bg-win/15 text-win shadow-[0_0_20px_rgba(0,230,118,0.2)]'
                    : 'border-win/25 bg-win/10 text-win hover:border-win/40 hover:bg-win/15'
                }`}
              >
                Live Chats
                {openLiveChatCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-black leading-none text-deep shadow-[0_0_6px_rgba(255,215,0,0.5)]">
                    {openLiveChatCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  log('CLICK.open_deposit');
                  setDepositOpen(true);
                }}
                className="group relative overflow-hidden rounded-lg border border-gold/45 px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1400] shadow-[0_0_28px_rgba(255,215,0,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl transition hover:border-gold hover:shadow-[0_0_40px_rgba(255,215,0,0.55),inset_0_1px_0_rgba(255,255,255,0.45)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#ffe566] via-[#ffcc00] to-[#ffb800] opacity-95"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 bg-gold/40 blur-xl transition group-hover:bg-gold/55"
                />
                <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]">
                  Deposit
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  log('CLICK.open_withdraw');
                  setWithdrawOpen(true);
                }}
                className={`group relative overflow-hidden rounded-lg border px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition hover:border-white/35 hover:shadow-[0_0_32px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.28)] ${
                  withdrawOpen ? 'border-white/40' : 'border-white/20'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-90"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 bg-white/15 blur-xl transition group-hover:bg-white/25"
                />
                <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.25)]">
                  Withdraw
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                log('CLICK.open_nickname');
                setNicknameOpen(true);
              }}
              title="Clic para cambiar tu apodo"
              className="hidden max-w-[180px] truncate rounded-lg border border-white/10 bg-panel/80 px-2.5 py-1.5 text-[11px] text-white/70 transition hover:border-gold/30 hover:text-gold sm:inline"
            >
              {profileLabel}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-white/10 bg-panel px-3 py-1.5 text-[11px] font-semibold text-white/60 transition hover:border-white/25 hover:text-white"
            >
              Salir
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={openLogin}
            className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:border-gold hover:bg-gold/15"
          >
            Login
          </button>
        )}
      </div>
    </header>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/5 bg-panel/90 px-2 py-1">
      <span className="text-[8px] font-semibold tracking-wide text-white/40 uppercase">{label}</span>
      <CoinPrice value={value} iconClassName="h-3 w-3" textClassName="font-display text-[11px] font-bold text-gold" />
    </div>
  );
}

function LightningIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition ${active ? 'drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]' : 'opacity-50'}`}
      aria-hidden="true"
    >
      <path
        d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
        fill={active ? '#FFD700' : '#B8960F'}
        stroke="#0a0a0a"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}
