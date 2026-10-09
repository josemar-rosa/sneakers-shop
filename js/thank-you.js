// js/thank-you.js
const order = JSON.parse(localStorage.getItem("loja_last_order") || "null");

if (!order) {
  // Se não há encomenda, volta à home
  window.location.href = "./index.html";
} else {
  document.getElementById("order-id").textContent = order.id;
  document.getElementById("order-total").textContent =
    `$${order.total.toFixed(2)}`;
  document.getElementById("order-email").textContent = order.customer.email;

  // Limpa para não mostrar de novo se recarregar
  // (mantém em loja_orders para histórico)
  localStorage.removeItem("loja_last_order");
}
