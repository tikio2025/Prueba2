// Carrito de compras con localStorage
class ShoppingCart {
  constructor() {
    this.storageKey = 'vendedor-scz-cart';
    this.items = this.loadFromStorage();
    this.updateUI();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  add(product) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1
      });
    }
    this.saveToStorage();
    this.updateUI();
  }

  remove(productId) {
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

  updateUI() {
    const cartBadge = document.querySelector('.cart-top span');
    if (cartBadge) {
      cartBadge.textContent = this.getTotal();
    }
  }

  getItems() {
    return this.items;
  }
}

// Inicializar carrito global
let cart = null;
document.addEventListener('DOMContentLoaded', () => {
  cart = new ShoppingCart();
});
