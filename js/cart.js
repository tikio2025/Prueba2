// Lista de Consulta - Gestión de productos para consultar por WhatsApp
class ConsultationList {
  constructor() {
    this.storageKey = 'vendedor-scz-consulta';
    this.items = this.loadFromStorage();
    this.updateUI();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading consultation list from localStorage:', error);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving consultation list to localStorage:', error);
    }
  }

  addProduct(product) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        qty: 1
      });
    }
    this.saveToStorage();
    this.updateUI();
  }

  removeProduct(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
    this.updateUI();
  }

  clear() {
    this.items = [];
    this.saveToStorage();
    this.updateUI();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  generateWhatsAppMessage() {
    if (this.items.length === 0) {
      return 'Hola, vengo de Vendedor SCZ. Quiero consultar productos disponibles.';
    }

    const productList = this.items
      .map(item => {
        const qty = item.qty || 1;
        return qty > 1 ? `${item.name} (x${qty})` : item.name;
      })
      .join('\n• ');

    return `Hola, vengo de Vendedor SCZ. Quiero consultar disponibilidad, precio y entrega de estos productos:\n\n• ${productList}`;
  }

  updateUI() {
    const badge = document.querySelector('.cart-top span');
    if (badge) {
      badge.textContent = this.getTotal();
    }
  }

  getItems() {
    return this.items;
  }
}

// Inicializar lista de consulta global
let consultationList = null;
document.addEventListener('DOMContentLoaded', () => {
  consultationList = new ConsultationList();
});
