// js/shop.js
import { PRODUCTS } from "./products.js";
import { Cart } from "./cart.js";

const state = {
  page: 1,
  perPage: 6,
  category: "all",
  gender: "all",
  sort: "default",
  maxPrice: 500,
  search: "",
};

const $grid = document.getElementById("products-grid");
const $pagination = document.getElementById("pagination");
const $count = document.getElementById("products-count");

function formatPrice(v) {
  return `$${v.toFixed(2)}`;
}

function getFiltered() {
  let list = PRODUCTS.filter((p) => {
    if (state.category !== "all" && p.category !== state.category) return false;
    if (state.gender !== "all" && p.gender !== state.gender) return false;
    if (p.price > state.maxPrice) return false;
    if (
      state.search &&
      !p.name.toLowerCase().includes(state.search.toLowerCase())
    )
      return false;
    return true;
  });

  switch (state.sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating);
      break;
  }
  return list;
}

function renderProducts() {
  const all = getFiltered();
  const total = all.length;
  const pages = Math.ceil(total / state.perPage);
  const start = (state.page - 1) * state.perPage;
  const items = all.slice(start, start + state.perPage);

  if ($count) $count.textContent = `${total} produto${total !== 1 ? "s" : ""}`;

  if (!items.length) {
    $grid.innerHTML = `
      <div class="empty-state">
        <i class='bx bx-search-alt'></i>
        <p>Nenhum produto encontrado</p>
        <button class="button" id="clear-filters">Limpar filtros</button>
      </div>`;
    document
      .getElementById("clear-filters")
      ?.addEventListener("click", resetFilters);
    $pagination.innerHTML = "";
    return;
  }

  $grid.innerHTML = items
    .map(
      (p) => `
    <article class="sneaker" data-id="${p.id}">
      ${p.badge ? `<div class="sneaker__sale">${p.badge}</div>` : ""}
      <a href="./product.html?id=${p.id}" class="sneaker__link">
        <img src="${p.images[0]}" alt="${p.name}" class="sneaker__img" loading="lazy">
      </a>
      <span class="sneaker__name">${p.name}</span>
      <div class="sneaker__rating">
        ${"★".repeat(Math.round(p.rating))}${"☆".repeat(5 - Math.round(p.rating))}
        <span>(${p.rating})</span>
      </div>
      <span class="sneaker__preci">${formatPrice(p.price)}</span>
      <button class="button-light add-to-cart" data-id="${p.id}">
        Adicionar ao Carrinho <i class='bx bx-right-arrow-alt button-icon'></i>
      </button>
    </article>
  `,
    )
    .join("");

  renderPagination(pages);
  bindAddToCart();
}

function renderPagination(pages) {
  if (pages <= 1) {
    $pagination.innerHTML = "";
    return;
  }
  let html = "";
  if (state.page > 1)
    html += `<button class="sneaker__pag" data-page="${state.page - 1}">&#8592;</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="sneaker__pag ${i === state.page ? "is-active" : ""}" data-page="${i}">${i}</button>`;
  }
  if (state.page < pages)
    html += `<button class="sneaker__pag" data-page="${state.page + 1}">&#8594;</button>`;
  $pagination.innerHTML = html;

  $pagination.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.page = +btn.dataset.page;
      renderProducts();
      window.scrollTo({ top: $grid.offsetTop - 100, behavior: "smooth" });
    });
  });
}

function bindAddToCart() {
  $grid.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = +btn.dataset.id;
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      Cart.add(product, 1, product.sizes[0]);
      btn.classList.add("is-added");
      btn.innerHTML = `Adicionado <i class='bx bx-check button-icon'></i>`;
      setTimeout(() => {
        btn.classList.remove("is-added");
        btn.innerHTML = `Adicionar ao Carrinho <i class='bx bx-right-arrow-alt button-icon'></i>`;
      }, 1500);
    });
  });
}

function resetFilters() {
  state.category = "all";
  state.gender = "all";
  state.sort = "default";
  state.maxPrice = 500;
  state.search = "";
  state.page = 1;
  document
    .querySelectorAll(".filter-cat")
    .forEach((b) => b.classList.remove("is-active"));
  document
    .querySelector('.filter-cat[data-cat="all"]')
    ?.classList.add("is-active");
  document.getElementById("sort-select").value = "default";
  document.getElementById("search-input").value = "";
  document.getElementById("price-range").value = 500;
  document.getElementById("price-label").textContent = "$500";
  renderProducts();
}

// Bind filtros
document.querySelectorAll(".filter-cat").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-cat")
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    state.category = btn.dataset.cat;
    state.page = 1;
    renderProducts();
  });
});

document.getElementById("sort-select")?.addEventListener("change", (e) => {
  state.sort = e.target.value;
  state.page = 1;
  renderProducts();
});

document.getElementById("search-input")?.addEventListener("input", (e) => {
  state.search = e.target.value;
  state.page = 1;
  renderProducts();
});

document.getElementById("price-range")?.addEventListener("input", (e) => {
  state.maxPrice = +e.target.value;
  document.getElementById("price-label").textContent = `$${state.maxPrice}`;
  state.page = 1;
  renderProducts();
});

// Render inicial
renderProducts();
