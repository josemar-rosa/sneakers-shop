// js/cart-ui.js

import { Cart } from "./cart.js";

/* ============================================================
   ELEMENTOS
   ============================================================ */
const els = {
  sidebar: document.getElementById("cart-sidebar"),
  overlay: document.getElementById("cart-overlay"),
  close: document.getElementById("cart-close"),
  toggle: document.getElementById("cart-toggle"),
  items: document.getElementById("cart-items"),
  total: document.getElementById("cart-total"),
  checkout: document.getElementById("cart-checkout"),
  badge: document.getElementById("cart-badge"),
};

/* ============================================================
   HELPERS
   ============================================================ */
function formatPrice(v) {
  return `$${v.toFixed(2)}`;
}

/* ============================================================
   ABRIR / FECHAR
   ============================================================ */
function open() {
  els.sidebar?.classList.add("is-open");
  els.overlay?.classList.add("is-open");
  document.body.style.overflow = "hidden";
  render();
}

function close() {
  els.sidebar?.classList.remove("is-open");
  els.overlay?.classList.remove("is-open");
  document.body.style.overflow = "";
}

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  if (!els.items) return;

  const items = Cart.getItems();

  // Estado vazio
  if (!items.length) {
    els.items.innerHTML = `
      <div class="cart-empty">
        <i class='bx bx-cart'></i>
        <p>O teu carrinho está vazio</p>
        <a href="./shop.html" class="button">Ver produtos</a>
      </div>`;
    if (els.total) els.total.textContent = formatPrice(0);
    return;
  }

  // Lista de itens
  els.items.innerHTML = items
    .map(
      (item) => `
    <div class="cart-item" data-key="${item.key}">
      <img src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="cart-item__info">
        <h4>${item.name}</h4>
        ${item.size ? `<small>Tamanho: ${item.size}</small>` : ""}
        <span class="cart-item__price">${formatPrice(item.price)}</span>
        <div class="cart-item__qty">
          <button class="qty-minus" aria-label="Diminuir quantidade">−</button>
          <span>${item.qty}</span>
          <button class="qty-plus" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button class="cart-item__remove" aria-label="Remover item">
        <i class='bx bx-trash'></i>
      </button>
    </div>
  `,
    )
    .join("");

  if (els.total) els.total.textContent = formatPrice(Cart.getTotal());

  // Eventos dos itens
  els.items.querySelectorAll(".cart-item").forEach((el) => {
    const key = el.dataset.key;

    el.querySelector(".qty-plus")?.addEventListener("click", () => {
      const item = Cart.getItems().find((i) => i.key === key);
      if (item) Cart.updateQty(key, item.qty + 1);
      render();
    });

    el.querySelector(".qty-minus")?.addEventListener("click", () => {
      const item = Cart.getItems().find((i) => i.key === key);
      if (!item) return;
      if (item.qty <= 1) Cart.remove(key);
      else Cart.updateQty(key, item.qty - 1);
      render();
    });

    el.querySelector(".cart-item__remove")?.addEventListener("click", () => {
      Cart.remove(key);
      render();
    });
  });
}

/* ============================================================
   BADGE
   ============================================================ */
function updateBadge() {
  if (!els.badge) return;
  const count = Cart.getCount();
  els.badge.textContent = count;
  els.badge.style.display = count > 0 ? "flex" : "none";
}

/* ============================================================
   EVENTOS GLOBAIS
   ============================================================ */
els.toggle?.addEventListener("click", open);
els.close?.addEventListener("click", close);
els.overlay?.addEventListener("click", close);

els.checkout?.addEventListener("click", () => {
  if (!Cart.getItems().length) return;
  window.location.href = "./checkout.html";
});

// Sincronização automática
document.addEventListener("cart:updated", () => {
  updateBadge();
  if (els.sidebar?.classList.contains("is-open")) render();
});

document.addEventListener("DOMContentLoaded", updateBadge);

// Fecha com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && els.sidebar?.classList.contains("is-open")) close();
});

/* ============================================================
   EXPORTS (para outros ficheiros usarem)
   ============================================================ */
export { open as openCart, close as closeCart, updateBadge };
