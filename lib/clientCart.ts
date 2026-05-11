export type CartEntry = {
  id: string;
  qty: number;
};

const STORAGE_KEY = "airlytics_client_cart";

export function readCart(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function writeCart(cart: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("airlytics-cart-change"));
}

export function addItemToCart(id: string, qty = 1) {
  const current = readCart();
  const next = { ...current, [id]: (current[id] ?? 0) + qty };
  writeCart(next);
}

export function removeItemFromCart(id: string) {
  const current = readCart();
  const next = { ...current };
  delete next[id];
  writeCart(next);
}

export function clearCart() {
  writeCart({});
}
