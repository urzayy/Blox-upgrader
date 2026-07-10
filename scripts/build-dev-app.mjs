import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
let source = execFileSync('git', ['show', '3cf6567:src/App.tsx'], { cwd: root }).toString('utf8');

source = source.replace('export default function App()', 'export default function DevApp()');
source = source.replace("import { AdminLivePresenceFooter } from './components/admin/AdminLivePresenceFooter';\n", '');
source = source.replace("import { usePresenceHeartbeat } from './hooks/usePresenceHeartbeat';\n", '');
source = source.replace('  usePresenceHeartbeat(user?.userId);\n', '');
source = source.replace('        {userIsAdmin && user && <AdminLivePresenceFooter adminEmail={user.email} />}\n', '');
source = source.replace(
  'const { user, logout: authLogout, openLogin, isAdmin: userIsAdmin } = useAuth();',
  'const { user, logout: authLogout, openLogin } = useAuth();',
);

writeFileSync(path.join(root, 'src/DevApp.tsx'), source, 'utf8');
console.log('DevApp.tsx written', source.length, 'chars');

const prodMobile = execFileSync('git', ['show', '86f6497:src/components/layout/MobileHeaderBar.tsx'], { cwd: root }).toString('utf8');
writeFileSync(path.join(root, 'src/components/prod/ProdMobileHeaderBar.tsx'), prodMobile, 'utf8');
console.log('ProdMobileHeaderBar.tsx written');

for (const [ref, out] of [
  ['86f6497:src/lib/upgradePendingStorage.ts', 'src/lib/prodUpgradePendingStorage.ts'],
  ['86f6497:src/components/layout/Header.tsx', 'src/components/prod/ProdHeader.tsx'],
  ['86f6497:src/components/skins/TargetPanel.tsx', 'src/components/prod/ProdTargetPanel.tsx'],
]) {
  let content = execFileSync('git', ['show', ref], { cwd: root }).toString('utf8');
  if (out.endsWith('ProdHeader.tsx')) {
    content = content.replace(
      "import { MobileHeaderBar } from './MobileHeaderBar';",
      "import { MobileHeaderBar } from './ProdMobileHeaderBar';",
    );
  }
  if (out.endsWith('ProdTargetPanel.tsx')) {
    content = content.replace(
      "import { SkinImage } from './SkinImage';",
      "import { SkinImage } from '../skins/SkinImage';",
    );
  }
  writeFileSync(path.join(root, out), content, 'utf8');
  console.log('wrote', out);
}
