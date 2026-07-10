import { useAuth } from '../context/AuthContext';

import { useActivityLog } from '../hooks/useActivityLog';

import { useAdminChatNotifications } from '../lib/adminChatNotifications';

import { requestOpenAdminPanel } from '../lib/uiActions';

import { ADMIN_PROMO_CODES_ENABLED } from '../lib/devAdminPromoCodes';

import { DEV_DEPOSIT_WITHDRAW_HISTORY } from '../lib/devDepositWithdrawHistory';

import { ADMIN_BAN_ENABLED } from '../lib/devAdminBan';

import { AdminBanControl } from '../components/admin/AdminBanControl';

import { AdminPromoCodeControl } from '../components/admin/AdminPromoCodeControl';

import { DevTransactionHistoryControl } from '../components/admin/DevTransactionHistoryControl';

import { navigateApp } from '../lib/appRoute';



interface AdminAction {

  id: Parameters<typeof requestOpenAdminPanel>[0];

  label: string;

  description: string;

  tone?: 'risk' | 'gold' | 'win' | 'default';

}



const CORE_ACTIONS: AdminAction[] = [

  {

    id: 'clear',

    label: 'Clear',

    description: 'Resetear cuenta por correo — borra todo',

    tone: 'risk',

  },

  {

    id: 'see',

    label: 'See',

    description: 'Ver inventario y saldo de un jugador por correo',

  },

  {

    id: 'inbox',

    label: 'Chats',

    description: 'Bandeja de chats en vivo — depósitos y retiros',

  },

  {

    id: 'giftMoney',

    label: 'Gift Money',

    description: 'Regalar saldo a cualquier usuario por email',

    tone: 'gold',

  },

  {

    id: 'gift',

    label: 'Gift User',

    description: 'Regalar skins a cualquier usuario por email',

    tone: 'gold',

  },

  {

    id: 'userDb',

    label: 'Users DB',

    description: 'Base de datos de usuarios y actividad',

    tone: 'gold',

  },

  {

    id: 'skinPicker',

    label: 'Admin',

    description: 'Añadir skins a tu inventario',

    tone: 'win',

  },

];



function actionCardClass(tone?: AdminAction['tone']) {

  if (tone === 'risk') {

    return 'border-risk/35 bg-risk/10 hover:border-risk/55 hover:bg-risk/15';

  }

  if (tone === 'gold') {

    return 'border-gold/30 bg-gold/10 hover:border-gold/45 hover:bg-gold/15';

  }

  if (tone === 'win') {

    return 'border-win/30 bg-win/10 hover:border-win/45 hover:bg-win/15';

  }

  return 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]';

}



function actionLabelClass(tone?: AdminAction['tone']) {

  if (tone === 'risk') return 'text-risk';

  if (tone === 'gold') return 'text-gold';

  if (tone === 'win') return 'text-win';

  return 'text-white';

}



export function AdminPage() {

  const { isAdmin, user } = useAuth();

  const { log } = useActivityLog();

  const { attentionCount } = useAdminChatNotifications({
    enabled: isAdmin,
    activeTicketId: null,
  });



  if (!user || !isAdmin) {

    return (

      <div className="flex min-h-[50vh] items-center justify-center px-4">

        <div className="max-w-md rounded-2xl border border-white/10 bg-panel/80 px-6 py-8 text-center">

          <h1 className="font-display text-lg font-bold uppercase tracking-wide text-white">

            Acceso restringido

          </h1>

          <p className="mt-2 text-sm text-white/50">

            Esta sección solo está disponible para administradores.

          </p>

          <button

            type="button"

            onClick={() => navigateApp('main')}

            className="mt-5 rounded-lg border border-gold/35 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/15"

          >

            Volver al inicio

          </button>

        </div>

      </div>

    );

  }



  const openPanel = (action: AdminAction) => {

    log(`CLICK.open_admin_${action.id}`);

    requestOpenAdminPanel(action.id);

  };



  return (

    <div className="relative w-full overflow-hidden px-2 py-5 pb-12 sm:px-4 lg:px-6 xl:px-8">

      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-600/15 blur-[100px]" />

      <div className="pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full bg-red-600/10 blur-[110px]" />



      <section className="relative mx-auto max-w-[1200px]">

        <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">

          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-rose-400" aria-hidden="true">

            <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />

          </svg>

          <h1 className="font-display text-lg font-black uppercase tracking-wide text-white sm:text-xl lg:text-2xl">

            Admin

          </h1>

          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-rose-400" aria-hidden="true">

            <path d="M6 0 12 6 6 12 0 6Z" fill="currentColor" />

          </svg>

        </div>



        <p className="mb-6 max-w-2xl text-sm text-white/45">

          Herramientas de administración. Los sorteos se gestionan desde la sección Giveaways.

        </p>



        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">

          {CORE_ACTIONS.map(action => (

            <button

              key={action.id}

              type="button"

              onClick={() => openPanel(action)}

              className={`group relative rounded-2xl border p-4 text-left transition ${actionCardClass(action.tone)}`}

            >

              {action.id === 'inbox' && attentionCount > 0 && (

                <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-deep">

                  {attentionCount > 9 ? '9+' : attentionCount}

                </span>

              )}

              <span className={`font-display text-sm font-black uppercase tracking-[0.12em] ${actionLabelClass(action.tone)}`}>

                {action.label}

              </span>

              <p className="mt-2 text-xs leading-relaxed text-white/45 group-hover:text-white/60">

                {action.description}

              </p>

            </button>

          ))}



          {ADMIN_BAN_ENABLED && (

            <div className={`rounded-2xl border p-4 ${actionCardClass('risk')}`}>

              <span className="font-display text-sm font-black uppercase tracking-[0.12em] text-risk">

                Ban

              </span>

              <p className="mt-2 text-xs leading-relaxed text-white/45">

                Bloquear o desbloquear cuentas por correo

              </p>

              <div className="mt-4">

                <AdminBanControl adminEmail={user.email} />

              </div>

            </div>

          )}



          {DEV_DEPOSIT_WITHDRAW_HISTORY && (

            <div className={`rounded-2xl border p-4 ${actionCardClass()}`}>

              <span className="font-display text-sm font-black uppercase tracking-[0.12em] text-white">

                Historial

              </span>

              <p className="mt-2 text-xs leading-relaxed text-white/45">

                Historial de depósitos y retiros

              </p>

              <div className="mt-4">

                <DevTransactionHistoryControl />

              </div>

            </div>

          )}



          {ADMIN_PROMO_CODES_ENABLED && (

            <div className={`rounded-2xl border p-4 ${actionCardClass('gold')}`}>

              <span className="font-display text-sm font-black uppercase tracking-[0.12em] text-gold">

                Promos

              </span>

              <p className="mt-2 text-xs leading-relaxed text-white/45">

                Crear, ver y eliminar códigos promocionales

              </p>

              <div className="mt-4">

                <AdminPromoCodeControl adminEmail={user.email} />

              </div>

            </div>

          )}

        </div>

      </section>

    </div>

  );

}


