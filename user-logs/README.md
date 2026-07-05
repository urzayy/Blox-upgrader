# Registros de usuarios — Blox Upgrader

Cada usuario registrado tiene un archivo `.txt` con **todas sus acciones**: logins, clics, upgrades, depósitos (skins admin), etc.

## Dónde se guardan

| Entorno | Ubicación |
|---------|-----------|
| **Desarrollo** (`npm run dev`) | Esta carpeta: `user-logs/{email}.txt` |
| **Navegador** | `localStorage` (clave `blox-upgrader/user-log/{userId}`) |

En dev, cada acción se escribe en **localStorage** y se sincroniza aquí vía el servidor de Vite.

## Formato de línea

```
[05/07/2026, 0:15:32] UPGRADE.WIN | input=AK-47 | Redline | target=AWP | Dragon Lore | probability=12.5% | roll=22341 | winMax=12500
[05/07/2026, 0:14:10] CLICK.select_input | skin=AK-47 | Redline | price=$42.50
[05/07/2026, 0:13:00] DEPOSIT.admin | skin=AWP | Gungnir | price=$8,900.00
[05/07/2026, 0:12:00] AUTH.login | email=usuario@gmail.com
```

## Descargar log (desde consola del navegador)

```js
// Con sesión iniciada — exporta el .txt del usuario actual
import { downloadUserLog } from './src/lib/userActivityLog';
// O desde la app: el log se acumula automáticamente al usar el sitio.
```

Los archivos de esta carpeta **no se suben a git** (ver `.gitignore`).
