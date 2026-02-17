// =========== PRODUCTS ===========
const products = [
  { id: 1, name: "Minimalist Desk Lamp",     price: 39.99,  image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500" },
  { id: 2, name: "Ceramic Plant Pot",         price: 24.50,  image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500" },
  { id: 3, name: "Wireless Mechanical Keyboard", price: 89.00, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500" },
  { id: 4, name: "Scented Soy Candle",        price: 18.75,  image: "https://images.unsplash.com/photo-1603006905003-291a9a0e2467?w=500" },
  { id: 5, name: "Linen Throw Blanket",       price: 49.00,  image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500" },
  { id: 6, name: "Acoustic Guitar Wall Mount", price: 29.99, image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=500" },
];

let cart = [];

// DOM elements
const productsGrid   = document.getElementById("products-grid");
const cartSidebar    = document.getElementById("cart-sidebar");
const overlay        = document.getElementById("overlay");
const cartCount      = document.querySelector(".cart-count");
const cartItemsDiv   = document.getElementById("cart-items");
const cartTotal      = document.getElementById("cart-total");
const closeCartBtn   = document.getElementById("close-cart");
const cartIcon       = document.querySelector(".cart-icon");

// Render products
function renderProducts() {
  productsGrid.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img class="product-img" src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button class="add-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
}

// Save & load cart (localStorage)
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem("cart");
  if (saved) cart = JSON.parse(saved);
  updateCartDisplay();
}

// Update cart UI
function updateCartDisplay() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartItemsDiv.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const prod = products.find(p => p.id === item.id);
    if (!prod) return;

    total += prod.price * item.quantity;

    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img class="cart-item-img" src="${prod.image}" alt="${prod.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${prod.name}</div>
        <div>$${prod.price.toFixed(2)} × ${item.quantity}</div>
        <div class="cart-item-price">$${(prod.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
    cartItemsDiv.appendChild(el);
  });

  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Add to cart
function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart();
  updateCartDisplay();
  openCart(); // optional: open cart after adding
}

// Open / close cart
function openCart() {
  cartSidebar.classList.add("open");
  overlay.classList.add("active");
}

function closeCart() {
  cartSidebar.classList.remove("open");
  overlay.classList.remove("active");
}

// Event listeners
document.addEventListener("click", e => {
  if (e.target.closest(".add-btn")) {
    const id = Number(e.target.dataset.id);
    addToCart(id);
  }
  if (e.target.closest(".cart-icon") || e.target.closest(".cart-count")) {
    openCart();
  }
  if (e.target.id === "close-cart" || e.target.id === "overlay") {
    closeCart();
  }
});

// Init
renderProducts();
loadCart();
