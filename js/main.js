// js/main.js
// Responsabilidade: UI global da página (menu, scroll, header)
// NÃO contém lógica de carrinho — isso está em cart-ui.js

/*===== MENU SHOW =====*/
const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if (!toggle || !nav) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.toggle("show");
  });

  // Fecha menu ao clicar fora
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("show");
    }
  });
};
showMenu("nav-toggle", "nav-menu");

/*===== FECHAR MENU AO CLICAR LINK =====*/
const navLinks = document.querySelectorAll(".nav__link");
const navMenu = document.getElementById("nav-menu");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu?.classList.remove("show");
  });
});

/*===== SCROLL ACTIVE LINK =====*/
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 100;
    const sectionId = current.getAttribute("id");

    const link = document.querySelector(`.nav__menu a[href*="${sectionId}"]`);
    if (!link) return;

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
window.addEventListener("scroll", scrollActive);

/*===== CHANGE COLOR HEADER =====*/
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  if (window.scrollY >= 200) {
    header?.classList.add("scroll-header");
  } else {
    header?.classList.remove("scroll-header");
  }
});

/*===== FECHAR MENU COM ESC =====*/
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    navMenu?.classList.remove("show");
  }
});
