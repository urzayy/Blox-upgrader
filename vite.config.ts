import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { withdrawChatPlugin } from './vite-withdraw-chat-plugin';
import { inventoryGrantsPlugin } from './vite-inventory-grants-plugin';
import { balanceGrantsPlugin } from './vite-balance-grants-plugin';
import { siteStatePlugin } from './vite-site-state-plugin';
import { userDbPlugin } from './vite-user-db-plugin';
import { promoCodesPlugin } from './vite-promo-codes-plugin';
import { giveawaysPlugin } from './vite-giveaways-plugin';
import { presencePlugin } from './vite-presence-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDbDir = path.resolve(__dirname, 'user-db');
const withdrawChatsDir = path.resolve(__dirname, 'withdraw-chats');
const inventoryGrantsDir = path.resolve(__dirname, 'inventory-grants');
const balanceGrantsDir = path.resolve(__dirname, 'balance-grants');
const siteStateDir = path.resolve(__dirname, 'site-state');
const promoCodesDir = path.resolve(__dirname, 'promo-codes');
const giveawaysDir = path.resolve(__dirname, 'giveaways');

export default defineConfig({
  appType: 'spa',
  plugins: [
    react(),
    userDbPlugin(userDbDir),
    promoCodesPlugin(promoCodesDir, userDbDir),
    giveawaysPlugin(giveawaysDir, userDbDir, inventoryGrantsDir),
    withdrawChatPlugin(withdrawChatsDir),
    inventoryGrantsPlugin(inventoryGrantsDir),
    balanceGrantsPlugin(balanceGrantsDir),
    siteStatePlugin(siteStateDir),
    presencePlugin(),
  ],
  server: {
    port: 5173,
    open: true,
    watch: {
      ignored: [
        '**/public/images/free-cases/iron-case-base.png',
        '**/public/images/free-cases/m4a1s-orchids.png',
        '**/public/images/free-cases/iron-chest-original.png',
        '**/public/images/free-cases/iron-chest.jpg',
        '**/public/images/free-cases/iron-vault.png',
        '**/public/images/free-cases/copper-chest.png',
        '**/public/images/free-cases/copper-treasure.png',
        '**/public/images/free-cases/silver-case.png',
        '**/public/images/free-cases/gold-treasure.png',
        '**/public/images/free-cases/gold-chest-v2.png',
        '**/public/images/free-cases/platinum-treasure.png',
        '**/public/images/free-cases/emerald-treasure.png',
        '**/public/images/free-cases/ruby-treasure.png',
        '**/public/images/free-cases/sapphire-treasure.png',
        '**/public/images/free-cases/diamond-treasure.png',
        '**/public/images/free-cases/master-treasure.png',
        '**/public/images/free-cases/challenger-treasure.png',
      ],
    },
  },
});
