import { useCallback, useEffect, useState } from 'react';
import { inventoryTotal } from '../../lib/inventory';
import { CoinPrice } from '../ui/CoinPrice';
import { useAuth } from '../../context/AuthContext';
import { AdminSkinPicker } from '../admin/AdminSkinPicker';
import { AdminGiftPanel } from '../admin/AdminGiftPanel';
import { AdminGiftMoneyPanel } from '../admin/AdminGiftMoneyPanel';
import { AdminWithdrawInbox } from '../admin/AdminWithdrawInbox';
import { AdminChatNotificationStack } from '../admin/AdminChatNotificationStack';
import { AdminUserDbPanel } from '../admin/AdminUserDbPanel';
import { AdminSeePanel } from '../admin/AdminSeePanel';
import { AdminClearPanel } from '../admin/AdminClearPanel';
import { AdminAnnouncementPanel } from '../admin/AdminAnnouncementPanel';
import { WithdrawModal } from '../withdraw/WithdrawModal';
import { WithdrawChatModal } from '../withdraw/WithdrawChatModal';
import { DepositModal, type DepositItem } from '../deposit/DepositModal';
import { DepositMethodModal } from '../deposit/DepositMethodModal';
import { RobuxDepositModal } from '../deposit/RobuxDepositModal';
import type { AppliedDepositBonus } from '../../lib/depositBonusCode';
import { LiveChatsInbox } from '../support/LiveChatsInbox';
import { LiveChatsFloatingButton } from '../support/LiveChatsFloatingButton';
import { fetchUserWithdrawTickets, type WithdrawTicket } from '../../lib/withdrawChat';
import { useAdminChatNotifications } from '../../lib/adminChatNotifications';
import { useActivityLog } from '../../hooks/useActivityLog';
import { DEV_MOBILE_LAYOUT } from '../../lib/devMobileLayout';
import { DEV_CLEAN_HEADER_LAYOUT } from '../../lib/devCleanHeaderLayout';
import { cleanHeaderShell, cleanHeaderChip } from '../../lib/cleanHeaderClasses';
import { navigateApp } from '../../lib/appRoute';
import { registerOpenDepositHandler, registerOpenWithdrawHandler, registerAdminPanelHandler } from '../../lib/uiActions';
import { useAppRoute } from '../../hooks/useAppRoute';
import { MobileHeaderBar } from './MobileHeaderBar';
import { HeaderNavMenu } from './HeaderNavMenu';
import { ProfileMenu } from './ProfileMenu';
import { LogoutDoorButton } from './LogoutDoorButton';
import type { Skin } from '../../data/skins';

interface Props {
  inventory: Skin[];
  balance: number;
  lockedSkinIds: ReadonlySet<string>;
  totalUpgrades: number;
  playersOnline: number;
  onAdminGrantSkin: (skin: Skin) => void;
  onWithdrawRequest: (skins: Skin[]) => Promise<string | null>;
  onDepositRequest: (items: DepositItem[], bonus?: AppliedDepositBonus) => Promise<string | null>;
  onRobuxDepositRequest?: (robuxAmount: number, bonus?: AppliedDepositBonus) => Promise<string | null>;
  onSupportTicketCompleted: (ticket: WithdrawTicket) => void;
  onRegisterOpenSupportChat?: (openChat: (ticketId: string) => void) => void;
  onAdminGiftSent?: (targetEmail: string, skin: Skin, quantity: number) => void;
  onAccountCleared?: (email: string) => void;
}

export function Header({
  inventory,
  balance,
  lockedSkinIds,
  totalUpgrades,
  playersOnline,
  onAdminGrantSkin,
  onWithdrawRequest,
  onDepositRequest,
  onRobuxDepositRequest,
  onSupportTicketCompleted,
  onRegisterOpenSupportChat,
  onAdminGiftSent,
  onAccountCleared,
}: Props) {
  const { user, openLogin, isAdmin } = useAuth();
  const { log } = useActivityLog();
  const isProfilePage = useAppRoute() === 'profile';
  const isMainPage = useAppRoute() === 'main';
  const isUpgradePage = useAppRoute() === 'upgrade';
  const isFreeCasesPage = useAppRoute() === 'free-cases';
  const isGiveawaysPage = useAppRoute() === 'giveaways';
  const isCaseBattlesPage = useAppRoute() === 'case-battles';
  const isAdminPage = useAppRoute() === 'admin';
  const isScrollableHeader = isMainPage || isProfilePage || isUpgradePage || isFreeCasesPage || isGiveawaysPage || isCaseBattlesPage || isAdminPage;
  const [adminOpen, setAdminOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftMoneyOpen, setGiftMoneyOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawPreselectedIds, setWithdrawPreselectedIds] = useState<string[]>([]);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositMethodOpen, setDepositMethodOpen] = useState(false);
  const [robuxDepositOpen, setRobuxDepositOpen] = useState(false);
  const [liveChatsOpen, setLiveChatsOpen] = useState(false);
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const [supportChatTicketId, setSupportChatTicketId] = useState<string | null>(null);
  const [adminInboxOpen, setAdminInboxOpen] = useState(false);
  const [userDbOpen, setUserDbOpen] = useState(false);
  const [seeOpen, setSeeOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [openLiveChatCount, setOpenLiveChatCount] = useState(0);

  const activeAdminTicketId = isAdmin && supportChatOpen ? supportChatTicketId : null;
  const {
    toasts: adminChatToasts,
    dismissToast: dismissAdminChatToast,
  } = useAdminChatNotifications({
    enabled: isAdmin,
    activeTicketId: activeAdminTicketId,
  });

  const openSupportChat = useCallback((ticketId: string) => {
    setSupportChatTicketId(ticketId);
    setSupportChatOpen(true);
  }, []);

  const openDepositFlow = useCallback(() => {
    log('CLICK.open_deposit');
    setDepositMethodOpen(true);
  }, [log]);

  const openWithdrawFlow = useCallback((skinIds?: string[]) => {
    log('CLICK.open_withdraw', { preselected: skinIds?.length ?? 0 });
    setWithdrawPreselectedIds(skinIds ?? []);
    setWithdrawOpen(true);
  }, [log]);

  useEffect(() => {
    registerOpenDepositHandler(openDepositFlow);
    return () => registerOpenDepositHandler(null);
  }, [openDepositFlow]);

  useEffect(() => {
    registerOpenWithdrawHandler(openWithdrawFlow);
    return () => registerOpenWithdrawHandler(null);
  }, [openWithdrawFlow]);

  useEffect(() => {
    if (!isAdmin) return;
    registerAdminPanelHandler('clear', () => {
      log('CLICK.open_admin_clear');
      setClearOpen(true);
    });
    registerAdminPanelHandler('see', () => {
      log('CLICK.open_admin_see');
      setSeeOpen(true);
    });
    registerAdminPanelHandler('inbox', () => {
      log('CLICK.open_withdraw_inbox');
      setAdminInboxOpen(true);
    });
    registerAdminPanelHandler('giftMoney', () => {
      log('CLICK.open_admin_gift_money');
      setGiftMoneyOpen(true);
    });
    registerAdminPanelHandler('gift', () => {
      log('CLICK.open_admin_gift');
      setGiftOpen(true);
    });
    registerAdminPanelHandler('userDb', () => {
      log('CLICK.open_user_db');
      setUserDbOpen(true);
    });
    registerAdminPanelHandler('skinPicker', () => {
      log('CLICK.open_admin');
      setAdminOpen(true);
    });
    registerAdminPanelHandler('announcement', () => {
      log('CLICK.open_admin_announcement');
      setAnnouncementOpen(true);
    });
    return () => {
      registerAdminPanelHandler('clear', null);
      registerAdminPanelHandler('see', null);
      registerAdminPanelHandler('inbox', null);
      registerAdminPanelHandler('giftMoney', null);
      registerAdminPanelHandler('gift', null);
      registerAdminPanelHandler('userDb', null);
      registerAdminPanelHandler('skinPicker', null);
      registerAdminPanelHandler('announcement', null);
    };
  }, [isAdmin, log]);

  useEffect(() => {
    onRegisterOpenSupportChat?.(openSupportChat);
  }, [onRegisterOpenSupportChat, openSupportChat]);

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

  return (
    <>
      {user && isAdmin && (
        <AdminChatNotificationStack
          toasts={adminChatToasts}
          onDismiss={dismissAdminChatToast}
          onOpenTicket={ticketId => {
            setAdminInboxOpen(false);
            openSupportChat(ticketId);
          }}
        />
      )}
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
        initialSelectedIds={withdrawPreselectedIds}
        onClose={() => {
          setWithdrawOpen(false);
          setWithdrawPreselectedIds([]);
        }}
        onRequestWithdraw={async skins => {
          const ticketId = await onWithdrawRequest(skins);
          if (ticketId) openSupportChat(ticketId);
          return ticketId;
        }}
      />
      <DepositMethodModal
        open={depositMethodOpen}
        onClose={() => setDepositMethodOpen(false)}
        onSelectRobux={() => setRobuxDepositOpen(true)}
        onSelectSkins={() => setDepositOpen(true)}
      />
      {onRobuxDepositRequest && (
        <RobuxDepositModal
          open={robuxDepositOpen}
          onClose={() => setRobuxDepositOpen(false)}
          onSubmit={async (amount, bonus) => {
            const ticketId = await onRobuxDepositRequest(amount, bonus);
            if (ticketId) openSupportChat(ticketId);
            return ticketId;
          }}
        />
      )}
      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onRequestDeposit={async (items, bonus) => {
          const ticketId = await onDepositRequest(items, bonus);
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
        <LiveChatsFloatingButton
          open={liveChatsOpen}
          openCount={openLiveChatCount}
          onOpen={() => {
            log('CLICK.open_live_chats_fab');
            setLiveChatsOpen(true);
          }}
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
      {user && isAdmin && (
        <AdminClearPanel
          open={clearOpen}
          adminEmail={user.email}
          onClose={() => setClearOpen(false)}
          onAccountCleared={onAccountCleared}
        />
      )}
      {user && isAdmin && (
        <AdminAnnouncementPanel
          open={announcementOpen}
          adminEmail={user.email}
          onClose={() => setAnnouncementOpen(false)}
        />
      )}
      {user && isAdmin && (
        <AdminSeePanel
          open={seeOpen}
          adminEmail={user.email}
          localSession={{
            userId: user.userId,
            email: user.email,
            balance,
            inventory,
          }}
          onClose={() => setSeeOpen(false)}
        />
      )}
      {user && isAdmin && (
        <AdminUserDbPanel
          open={userDbOpen}
          adminEmail={user.email}
          onClose={() => setUserDbOpen(false)}
        />
      )}

      <header className={
        DEV_MOBILE_LAYOUT
          ? `${isScrollableHeader ? 'relative' : 'sticky top-0'} z-50 border-b backdrop-blur-xl max-lg:border-white/5 max-lg:bg-[#0a0812]/90 lg:px-4 ${
            DEV_CLEAN_HEADER_LAYOUT
              ? cleanHeaderShell('lg:px-10')
              : 'border-white/5 bg-deep/90 lg:py-3'
          }`
          : `${isScrollableHeader ? 'relative' : 'sticky top-0'} z-50 grid grid-cols-[1fr_auto_1fr] items-center backdrop-blur-xl ${
            DEV_CLEAN_HEADER_LAYOUT
              ? `${cleanHeaderShell()} gap-6 lg:gap-8`
              : 'gap-4 border-b border-white/5 bg-deep/90 px-4 py-3'
          }`
      }
      >
      {DEV_MOBILE_LAYOUT && (
        <MobileHeaderBar
          balance={balance}
          inventory={inventory}
          playersOnline={playersOnline}
          user={user}
          withdrawOpen={withdrawOpen}
          onOpenLogin={openLogin}
          onOpenDeposit={openDepositFlow}
          onOpenWithdraw={() => openWithdrawFlow()}
        />
      )}

      <div className={DEV_MOBILE_LAYOUT ? `hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center ${
        DEV_CLEAN_HEADER_LAYOUT ? 'lg:gap-8' : 'lg:gap-4'
      }` : 'contents'}>
      <div className={`flex min-w-0 justify-self-start ${
        DEV_CLEAN_HEADER_LAYOUT ? 'items-center gap-6 lg:gap-10' : 'items-center gap-4'
      }`}
      >
        <div className={`flex shrink-0 ${
          DEV_CLEAN_HEADER_LAYOUT ? 'flex-col items-start gap-1' : 'items-center gap-3'
        }`}
        >
        <button
          type="button"
          onClick={() => navigateApp('main')}
          className={`text-left transition hover:opacity-90 ${
            DEV_CLEAN_HEADER_LAYOUT ? '' : ''
          }`}
        >
        <h1 className={`font-display font-bold tracking-[0.12em] uppercase ${
          DEV_CLEAN_HEADER_LAYOUT ? 'text-xl leading-tight' : 'text-lg'
        }`}
        >
          Blox<span className="text-gold">Upgrader</span>
          {!DEV_CLEAN_HEADER_LAYOUT && (
          <span className="text-[11px] font-semibold tracking-normal text-white/40">.com</span>
          )}
        </h1>
        </button>

        {DEV_CLEAN_HEADER_LAYOUT ? (
          <div className="flex items-center gap-1.5 pl-0.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-win shadow-[0_0_8px_rgba(0,230,118,0.65)]" />
            <span className="font-display text-[11px] font-semibold tabular-nums text-white/75">
              {playersOnline.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">online</span>
          </div>
        ) : (
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-panel/80 px-2.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win" />
            <span className="font-display text-[11px] font-semibold tabular-nums text-white/80">
              {playersOnline.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-white/40">online</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-panel/80 px-2.5 py-1">
            <span className="font-display text-[11px] font-semibold tabular-nums text-gold">
              {totalUpgrades.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-white/40">upgrades</span>
          </div>
        </div>
        )}
        </div>

        <HeaderNavMenu />
      </div>

      <div className={`flex min-w-0 items-center justify-self-center overflow-x-auto ${
        DEV_CLEAN_HEADER_LAYOUT ? 'gap-3' : 'gap-2'
      }`}
      >
        {!DEV_CLEAN_HEADER_LAYOUT && (
        <div className="flex items-center gap-1.5">
          <Stat label="Inventory value" value={inventoryTotal(inventory)} />
          <Stat label="BALANCE" value={balance} />
        </div>
        )}
      </div>

      <div className={`flex items-center justify-self-end ${
        DEV_CLEAN_HEADER_LAYOUT ? 'gap-2' : 'gap-2.5'
      }`}
      >
        {user ? (
          <>
            <div className={`flex items-center ${DEV_CLEAN_HEADER_LAYOUT ? 'gap-1 -translate-x-1' : 'gap-1.5 -translate-x-0.5'}`}>
              <button
                type="button"
                onClick={() => {
                  log('CLICK.open_live_chats');
                  setLiveChatsOpen(true);
                }}
                className={`relative hidden rounded-md border font-display font-bold uppercase transition lg:inline-flex ${
                  DEV_CLEAN_HEADER_LAYOUT
                    ? 'px-4 py-2.5 text-xs tracking-[0.1em]'
                    : 'px-3 py-1.5 text-[10px] tracking-[0.12em] backdrop-blur-xl'
                } ${
                  openLiveChatCount > 0 ? (DEV_CLEAN_HEADER_LAYOUT ? 'pr-6' : 'pr-7') : ''
                } ${
                  liveChatsOpen
                    ? DEV_CLEAN_HEADER_LAYOUT
                      ? cleanHeaderChip(true)
                      : 'border-win/40 bg-win/15 text-win shadow-[0_0_20px_rgba(0,230,118,0.2)]'
                    : DEV_CLEAN_HEADER_LAYOUT
                      ? cleanHeaderChip(false)
                      : 'border-win/25 bg-win/10 text-win hover:border-win/40 hover:bg-win/15'
                }`}
              >
                Live Chats
                {openLiveChatCount > 0 && (
                  <span className={`absolute right-1 top-1 flex items-center justify-center rounded-full bg-gold font-black leading-none text-deep shadow-[0_0_6px_rgba(176,108,255,0.5)] ${
                    DEV_CLEAN_HEADER_LAYOUT ? 'h-3.5 min-w-3.5 px-0.5 text-[8px]' : 'h-4 min-w-4 px-1 text-[9px]'
                  }`}
                  >
                    {openLiveChatCount}
                  </span>
                )}
              </button>
              {DEV_CLEAN_HEADER_LAYOUT && (
                <Stat label="BALANCE" value={balance} slim cleanChip />
              )}
            <button
              type="button"
              onClick={openDepositFlow}
              className={`group relative overflow-hidden rounded-md border border-gold/45 font-display font-bold uppercase text-[#f5f0ff] shadow-[0_0_20px_rgba(176,108,255,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl transition hover:border-gold hover:shadow-[0_0_32px_rgba(176,108,255,0.5),inset_0_1px_0_rgba(255,255,255,0.45)] ${
                DEV_CLEAN_HEADER_LAYOUT
                  ? 'px-5 py-2.5 text-xs tracking-[0.1em]'
                  : 'px-3.5 py-1.5 text-[11px] tracking-[0.14em]'
              }`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#d8b4fe] via-[#c084fc] to-[#a855f7] opacity-95"
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
                onClick={() => openWithdrawFlow()}
                className={`group relative overflow-hidden rounded-md border font-display font-bold uppercase text-white shadow-[0_0_16px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl transition hover:border-white/35 hover:shadow-[0_0_24px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.28)] ${
                  DEV_CLEAN_HEADER_LAYOUT
                    ? 'px-5 py-2.5 text-xs tracking-[0.1em]'
                    : 'px-3.5 py-1.5 text-[11px] tracking-[0.14em]'
                } ${
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
            <ProfileMenu />
            <LogoutDoorButton />
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
      </div>
    </header>
    </>
  );
}

function Stat({
  label,
  value,
  compact = false,
  comfortable = false,
  slim = false,
  cleanChip = false,
}: {
  label: string;
  value: number;
  compact?: boolean;
  comfortable?: boolean;
  slim?: boolean;
  cleanChip?: boolean;
}) {
  return (
    <div className={`flex items-center rounded-md border ${
      cleanChip
        ? `gap-1.5 px-3 py-2.5 ${cleanHeaderChip(false)}`
        : `bg-[#1a1e28]/90 ${
          slim
            ? 'gap-1 border-white/[0.08] px-2 py-1.5'
            : comfortable
              ? 'gap-1.5 border-white/[0.08] px-3.5 py-2'
              : compact
                ? 'gap-1 border-white/5 px-1.5 py-0.5'
                : 'gap-1.5 border-white/5 px-2 py-1'
        }`
    }`}
    >
      <span className={`font-semibold tracking-wide uppercase ${
        cleanChip ? 'text-[10px] text-white/45' : 'text-white/40'
      } ${
        slim && !cleanChip ? 'text-[8px]' : comfortable ? 'text-[10px]' : compact ? 'text-[7px]' : 'text-[8px]'
      }`}
      >
        {label}
      </span>
      <CoinPrice
        value={value}
        iconClassName={cleanChip ? 'h-4 w-4' : slim ? 'h-3 w-3' : comfortable ? 'h-3.5 w-3.5' : compact ? 'h-2.5 w-2.5' : 'h-3 w-3'}
        textClassName={`font-display font-bold text-gold ${
          cleanChip ? 'text-sm' : slim ? 'text-[10px]' : comfortable ? 'text-xs' : compact ? 'text-[10px]' : 'text-[11px]'
        }`}
      />
    </div>
  );
}
