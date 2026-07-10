// UI interactiva para la Lista de Consulta

class ConsultationUI {
  constructor() {
    this.panel = document.querySelector('.consultation-panel');
    this.overlay = document.querySelector('.consultation-overlay');
    this.itemsContainer = document.querySelector('.consultation-items');
    this.closeBtn = document.querySelector('.consultation-close');
    this.clearBtn = document.querySelector('.consultation-btn-clear');
    this.sendBtn = document.querySelector('.consultation-btn-send');
    this.cartTopBtn = document.querySelector('.cart-top');

    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    if (this.cartTopBtn) {
      this.cartTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openPanel();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closePanel());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closePanel());
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.confirmClear());
    }

    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.sendViaWhatsApp());
    }

    // Agregar listeners a botones de "Añadir a consulta"
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-add-consultation')) {
        e.preventDefault();
        const card = e.target.closest('.card');
        this.addProductFromCard(card);
      }
    });
  }

  addProductFromCard(card) {
    if (!window.consultationList) return;

    const h3 = card.querySelector('h3');
    const name = h3 ? h3.textContent : 'Producto desconocido';
    const productId = card.dataset.producto || name.toLowerCase().replace(/\s+/g, '-');

    window.consultationList.addProduct({
      id: productId,
      name: name.trim()
    });

    this.render();
    this.openPanel();
  }

  openPanel() {
    if (this.panel) this.panel.classList.add('open');
    if (this.overlay) this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closePanel() {
    if (this.panel) this.panel.classList.remove('open');
    if (this.overlay) this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  confirmClear() {
    if (confirm('¿Vaciar la lista de consulta?')) {
      window.consultationList.clear();
      this.render();
    }
  }

  sendViaWhatsApp() {
    if (!window.consultationList) return;

    const message = window.consultationList.generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/59175103979?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  }

  render() {
    if (!this.itemsContainer || !window.consultationList) return;

    const items = window.consultationList.getItems();

    if (items.length === 0) {
      this.itemsContainer.innerHTML =
        '<div class="consultation-empty">📋 Tu consulta está vacía<br><small>Añade productos para consultarlos por WhatsApp</small></div>';
      return;
    }

    const itemsHTML = items
      .map(
        (item) => `
      <div class="consultation-item">
        <div class="consultation-item-info">
          <div class="consultation-item-name">${item.name}</div>
          <div class="consultation-item-qty">Cantidad: ${item.qty || 1}</div>
        </div>
        <button class="consultation-item-remove" data-id="${item.id}" title="Eliminar">✕</button>
      </div>
    `
      )
      .join('');

    this.itemsContainer.innerHTML = itemsHTML;

    // Agregar listeners a botones de eliminar
    this.itemsContainer.querySelectorAll('.consultation-item-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.dataset.id;
        window.consultationList.removeProduct(productId);
        this.render();
      });
    });
  }
}

// Inicializar UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que consultationList esté disponible
  const checkAndInit = () => {
    if (window.consultationList) {
      new ConsultationUI();
    } else {
      setTimeout(checkAndInit, 100);
    }
  };
  checkAndInit();
});
