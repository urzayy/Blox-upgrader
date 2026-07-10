import { useAuth } from '../context/AuthContext';
import { loadArchivedInventory } from '../lib/inventoryArchiveStorage';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { ProfileInventorySection } from '../components/profile/ProfileInventorySection';
import type { Skin } from '../data/skins';

interface Props {
  inventory: Skin[];
  balance: number;
  lockedSkinIds: ReadonlySet<string>;
  onSellSkin: (skin: Skin) => void;
}

export function ProfilePage({ inventory, balance, lockedSkinIds, onSellSkin }: Props) {
  const { user } = useAuth();

  const archivedSkins = user ? loadArchivedInventory(user.userId) : [];

  if (!user) return null;

  return (
    <div className="w-full px-2 py-5 pb-10 sm:px-4 lg:px-6 xl:px-8">

      <div className="space-y-5 lg:space-y-6">
        <ProfileHeaderCard balance={balance} />
        <ProfileInventorySection
          activeSkins={inventory}
          archivedSkins={archivedSkins}
          lockedSkinIds={lockedSkinIds}
          onSellSkin={onSellSkin}
        />
      </div>
    </div>
  );
}
