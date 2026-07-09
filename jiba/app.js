const WHATSAPP_NUMBER = "59175103979";
const nav = document.querySelector(".nav");
const menuButton = document.querySelector("[data-menu]");
const links = document.querySelector("[data-links]");
const filterButtons = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll("[data-category]");
const orderButtons = document.querySelectorAll("[data-order]");
const form = document.querySelector("[data-form]");
const status = document.querySelector("[data-status]");

menuButton?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

links?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    cards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.hidden = filter !== "todos" && !categories.includes(filter);
    });
  });
});

orderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const textarea = form?.elements.pedido;
    if (!textarea) return;
    const value = textarea.value.trim();
    textarea.value = value ? `${value}\n1 x ${button.dataset.order}` : `1 x ${button.dataset.order}`;
    document.querySelector("#pedido")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => textarea.focus(), 300);
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const details = data.get("detalles");
  const lines = [
    "Hola, quiero hacer un pedido en Pacumuto de Jiba.",
    "",
    `Nombre: ${data.get("nombre")}`,
    `Telefono: ${data.get("telefono") || "No indicado"}`,
    `Entrega: ${data.get("entrega")}`,
    "",
    "Pedido:",
    data.get("pedido"),
  ];

  if (details) lines.push("", `Detalles: ${details}`);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  if (status) status.textContent = "Abriendo WhatsApp con tu pedido...";
  window.open(url, "_blank", "noopener,noreferrer");
});
