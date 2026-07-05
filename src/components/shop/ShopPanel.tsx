import { SkinCatalogCart, type CatalogCartItem } from './SkinCatalogCart';

export type ShopPurchaseItem = CatalogCartItem;

interface Props {
  balance: number;
  requiresLogin: boolean;
  onLoginRequired: () => void;
  onPurchase: (items: ShopPurchaseItem[]) => boolean;
}

export function ShopPanel({ balance, requiresLogin, onLoginRequired, onPurchase }: Props) {
  return (
    <SkinCatalogCart
      submitIcon="cart"
      emptyError="Selecciona al menos una skin."
      validateSubmit={(_, total) => {
        if (requiresLogin) {
          onLoginRequired();
          return { ok: false };
        }
        if (total <= 0) return { ok: false, error: 'Selecciona al menos una skin.' };
        if (balance < total) return { ok: false, error: 'No tienes suficiente SALDO.' };
        return { ok: true };
      }}
      onSubmit={items => {
        const ok = onPurchase(items);
        if (ok) {
          return true;
        }
        return false;
      }}
    />
  );
}
