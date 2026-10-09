// js/checkout.js
import { Cart } from "./cart.js";

const SHIPPING_FREE_THRESHOLD = 100;
const SHIPPING_COST = 9.99;

const $form = document.getElementById("checkout-form");
const $items = document.getElementById("checkout-items");
const $subtotal = document.getElementById("summary-subtotal");
const $shipping = document.getElementById("summary-shipping");
const $total = document.getElementById("summary-total");
const $placeOrder = document.getElementById("place-order");

function formatPrice(v) {
  return `$${v.toFixed(2)}`;
}

// ---------- Render do resumo ----------
function renderSummary() {
  const items = Cart.getItems();

  if (!items.length) {
    $items.innerHTML = `
      <div class="empty-state">
        <i class='bx bx-cart'></i>
        <p>O carrinho está vazio</p>
      </div>`;
    $subtotal.textContent = formatPrice(0);
    $shipping.textContent = formatPrice(0);
    $total.textContent = formatPrice(0);
    $placeOrder.disabled = true;
    return;
  }

  $items.innerHTML = items
    .map(
      (item) => `
    <div class="checkout-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <small>Tam. ${item.size || "—"} × ${item.qty}</small>
      </div>
      <span>${formatPrice(item.price * item.qty)}</span>
    </div>
  `,
    )
    .join("");

  const subtotal = Cart.getTotal();
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  $subtotal.textContent = formatPrice(subtotal);
  $shipping.textContent = shipping === 0 ? "Grátis" : formatPrice(shipping);
  $total.textContent = formatPrice(total);
  $placeOrder.disabled = false;
}

// ---------- Validação ----------
function validateField(field) {
  const value = field.value.trim();
  const group = field.closest(".form-group");
  const errorEl = group.querySelector(".error-msg");
  let msg = "";

  if (!value) {
    msg = "Campo obrigatório";
  } else if (
    field.type === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  ) {
    msg = "Email inválido";
  } else if (field.type === "tel" && !/^[+\d\s()-]{9,}$/.test(value)) {
    msg = "Telefone inválido";
  }

  group.classList.toggle("has-error", !!msg);
  if (errorEl) errorEl.textContent = msg;
  return !msg;
}

function validateForm() {
  const fields = $form.querySelectorAll("input[required], select[required]");
  let valid = true;
  fields.forEach((f) => {
    if (!validateField(f)) valid = false;
  });
  return valid;
}

// Validação em tempo real
$form.querySelectorAll("input, select").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.closest(".form-group").classList.contains("has-error")) {
      validateField(field);
    }
  });
});

// ---------- Submissão ----------
$placeOrder.addEventListener("click", (e) => {
  e.preventDefault();

  if (!Cart.getItems().length) return;
  if (!validateForm()) {
    // Foca no primeiro campo com erro
    const firstError = $form.querySelector(
      ".has-error input, .has-error select",
    );
    firstError?.focus();
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // Recolhe dados
  const data = Object.fromEntries(new FormData($form).entries());
  const order = {
    id: generateOrderId(),
    date: new Date().toISOString(),
    items: Cart.getItems(),
    subtotal: Cart.getTotal(),
    shipping: Cart.getTotal() >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST,
    total:
      Cart.getTotal() +
      (Cart.getTotal() >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST),
    customer: data,
  };

  // Guarda encomenda em localStorage
  const orders = JSON.parse(localStorage.getItem("loja_orders") || "[]");
  orders.push(order);
  localStorage.setItem("loja_orders", JSON.stringify(orders));
  localStorage.setItem("loja_last_order", JSON.stringify(order));

  // Limpa carrinho
  Cart.clear();

  // Redireciona
  window.location.href = "./thank-you.html";
});

function generateOrderId() {
  const year = new Date().getFullYear();
  const orders = JSON.parse(localStorage.getItem("loja_orders") || "[]");
  const seq = String(orders.length + 1).padStart(4, "0");
  return `#FM-${year}-${seq}`;
}

// ---------- Init ----------
renderSummary();
document.addEventListener("cart:updated", renderSummary);
