import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { withdrawChatPlugin } from './vite-withdraw-chat-plugin';
import { inventoryGrantsPlugin } from './vite-inventory-grants-plugin';
import { balanceGrantsPlugin } from './vite-balance-grants-plugin';
import { siteStatePlugin } from './vite-site-state-plugin';
import { userDbPlugin } from './vite-user-db-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDbDir = path.resolve(__dirname, 'user-db');
const withdrawChatsDir = path.resolve(__dirname, 'withdraw-chats');
const inventoryGrantsDir = path.resolve(__dirname, 'inventory-grants');
const balanceGrantsDir = path.resolve(__dirname, 'balance-grants');
const siteStateDir = path.resolve(__dirname, 'site-state');

export default defineConfig({
  plugins: [
    react(),
    userDbPlugin(userDbDir),
    withdrawChatPlugin(withdrawChatsDir),
    inventoryGrantsPlugin(inventoryGrantsDir),
    balanceGrantsPlugin(balanceGrantsDir),
    siteStatePlugin(siteStateDir),
  ],
  server: { port: 5173, open: true },
});
