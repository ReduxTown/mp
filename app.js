const products = [
  { id: 1, name: "Gaming Mouse", price: 49 },
  { id: 2, name: "Mechanical Keyboard", price: 89 },
  { id: 3, name: "Headset", price: 69 },
  { id: 4, name: "Gaming Chair", price: 199 }
];

let cart = [];

const productsContainer = document.getElementById("products");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const totalDisplay = document.getElementById("total");

function renderProducts() {
  products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productsContainer.appendChild(div);
  });
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  updateCart();
}

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price}`;
    cartItems.appendChild(li);
    total += item.price;
  });

  cartCount.textContent = cart.length;
  totalDisplay.textContent = total;
}

renderProducts();
