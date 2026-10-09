// js/product.js
import { getProductById, getRelated } from "./products.js";
import { Cart } from "./cart.js";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const product = getProductById(productId);

const $root = document.getElementById("product-root");

if (!product) {
  $root.innerHTML = `
    <div class="empty-state">
      <i class='bx bx-error-circle'></i>
      <h2>Produto não encontrado</h2>
      <a href="./shop.html" class="button">Voltar à loja</a>
    </div>`;
} else {
  document.title = `${product.name} | Loja`;
  renderProduct(product);
}

function formatPrice(v) {
  return `$${v.toFixed(2)}`;
}

function renderStars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function renderProduct(p) {
  const discount = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0;

  $root.innerHTML = `
    <nav class="breadcrumb">
      <a href="./index.html">Home</a>
      <i class='bx bx-chevron-right'></i>
      <a href="./shop.html">Shop</a>
      <i class='bx bx-chevron-right'></i>
      <span>${p.name}</span>
    </nav>

    <div class="product">
      <div class="product__gallery">
        <div class="product__thumbs">
          ${p.images
            .map(
              (img, i) => `
            <button class="product__thumb ${i === 0 ? "is-active" : ""}" data-img="${img}">
              <img src="${img}" alt="${p.name} ${i + 1}">
            </button>
          `,
            )
            .join("")}
        </div>
        <div class="product__main">
          ${p.badge ? `<span class="product__badge">${p.badge}</span>` : ""}
          <img src="${p.images[0]}" alt="${p.name}" id="main-image">
        </div>
      </div>

      <div class="product__info">
        <h1 class="product__title">${p.name}</h1>
        
        <div class="product__rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span>${p.rating} (${p.reviews} avaliações)</span>
        </div>

        <div class="product__price">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${
            p.oldPrice
              ? `
            <span class="price-old">${formatPrice(p.oldPrice)}</span>
            <span class="price-discount">-${discount}%</span>
          `
              : ""
          }
        </div>

        <p class="product__description">${p.description}</p>

        <div class="product__section">
          <h3>Cores</h3>
          <div class="color-options">
            ${p.colors
              .map(
                (c, i) => `
              <button class="color-option ${i === 0 ? "is-active" : ""}" 
                      data-color="${c.name}"
                      style="background:${c.hex}"
                      aria-label="${c.name}">
              </button>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="product__section">
          <div class="size-header">
            <h3>Tamanho</h3>
            <button class="size-guide">Guia de tamanhos</button>
          </div>
          <div class="size-options">
            ${p.sizes
              .map(
                (s) => `
              <button class="size-option" data-size="${s}">${s}</button>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="product__actions">
          <div class="qty-selector">
            <button class="qty-btn" id="qty-minus">−</button>
            <input type="number" id="qty-input" value="1" min="1" max="${p.stock}">
            <button class="qty-btn" id="qty-plus">+</button>
          </div>
          <button class="button button--primary" id="add-to-cart">
            Adicionar ao Carrinho
          </button>
        </div>

        <div class="product__meta">
          <p><i class='bx bx-check'></i> ${p.stock > 0 ? `Em stock (${p.stock})` : "Esgotado"}</p>
          <p><i class='bx bx-truck'></i> Envio grátis acima de $100</p>
          <p><i class='bx bx-refresh'></i> Devolução grátis em 30 dias</p>
        </div>

        <div class="product__features">
          <h3>Características</h3>
          <ul>
            ${p.features.map((f) => `<li><i class='bx bx-check-circle'></i> ${f}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>

    <section class="related section">
      <h2 class="section-title">Produtos Relacionados</h2>
      <div class="featured__container bd-grid" id="related-grid"></div>
    </section>
  `;

  bindGallery();
  bindOptions();
  bindAddToCart(p);
  renderRelated(p);
}

function bindGallery() {
  const main = document.getElementById("main-image");
  document.querySelectorAll(".product__thumb").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".product__thumb")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      main.src = btn.dataset.img;
    });
  });
}

function bindOptions() {
  document.querySelectorAll(".color-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".color-option")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  document.querySelectorAll(".size-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".size-option")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  const $qty = document.getElementById("qty-input");
  const max = Number($qty.max);
  document.getElementById("qty-plus")?.addEventListener("click", () => {
    $qty.value = Math.min(max, Number($qty.value) + 1);
  });
  document.getElementById("qty-minus")?.addEventListener("click", () => {
    $qty.value = Math.max(1, Number($qty.value) - 1);
  });
}

function bindAddToCart(product) {
  document.getElementById("add-to-cart")?.addEventListener("click", (e) => {
    const size = document.querySelector(".size-option.is-active")?.dataset.size;
    const color = document.querySelector(".color-option.is-active")?.dataset
      .color;
    const qty = Number(document.getElementById("qty-input").value);

    if (!size) {
      alert("Escolhe um tamanho");
      return;
    }

    Cart.add(product, qty, size);

    const btn = e.currentTarget;
    btn.textContent = "✓ Adicionado";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = "Adicionar ao Carrinho";
      btn.disabled = false;
    }, 1500);
  });
}

function renderRelated(product) {
  const grid = document.getElementById("related-grid");
  const related = getRelated(product);
  if (!related.length) {
    grid.closest(".related")?.remove();
    return;
  }

  grid.innerHTML = related
    .map(
      (p) => `
    <article class="sneaker">
      ${p.badge ? `<div class="sneaker__sale">${p.badge}</div>` : ""}
      <a href="./product.html?id=${p.id}" class="sneaker__link">
        <img src="${p.images[0]}" alt="${p.name}" class="sneaker__img" loading="lazy">
      </a>
      <span class="sneaker__name">${p.name}</span>
      <div class="sneaker__rating">
        ${renderStars(p.rating)} <span>(${p.rating})</span>
      </div>
      <span class="sneaker__preci">${formatPrice(p.price)}</span>
      <a href="./product.html?id=${p.id}" class="button-light">
        Ver detalhes <i class='bx bx-right-arrow-alt button-icon'></i>
      </a>
    </article>
  `,
    )
    .join("");
}
