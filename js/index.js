// js/index.js
import { getProductById } from "./products.js";
import { Cart } from "./cart.js";
import { openCart } from "./cart-ui.js";

document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = Number(btn.dataset.id);
    const product = getProductById(id);
    if (!product) return;

    Cart.add(product, 1, product.sizes[0]);

    // Feedback visual
    const original = btn.innerHTML;
    btn.innerHTML = `✓ Adicionado <i class='bx bx-check button-icon'></i>`;
    btn.disabled = true;

    // Abre o carrinho para feedback imediato
    setTimeout(() => openCart(), 300);

    setTimeout(() => {
      btn.innerHTML = original;
      btn.disabled = false;
    }, 1500);
  });
});
