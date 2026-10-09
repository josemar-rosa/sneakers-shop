// js/cart.js
const CART_KEY = "loja_cart";

export const Cart = {
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent("cart:updated", { detail: items }));
  },

  add(product, qty = 1, size = null) {
    const items = this.getItems();
    const key = `${product.id}-${size}`;
    const existing = items.find((i) => i.key === key);

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        key,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size,
        qty,
      });
    }
    this.saveItems(items);
  },

  remove(key) {
    const items = this.getItems().filter((i) => i.key !== key);
    this.saveItems(items);
  },

  updateQty(key, qty) {
    const items = this.getItems();
    const item = items.find((i) => i.key === key);
    if (item) {
      item.qty = Math.max(1, qty);
      this.saveItems(items);
    }
  },

  clear() {
    this.saveItems([]);
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },
};
