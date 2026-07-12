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
      emptyError="Select at least one skin."
      validateSubmit={(_, total) => {
        if (requiresLogin) {
          onLoginRequired();
          return { ok: false };
        }
        if (total <= 0) return { ok: false, error: 'Select at least one skin.' };
        if (balance < total) return { ok: false, error: 'You don\'t have enough BALANCE.' };
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
