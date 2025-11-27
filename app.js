const menu = [
  { name: "Pizza", price: 10, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80", desc: "Classic cheesy pizza with tangy tomato sauce and fresh basil." },
  { name: "Burger", price: 7, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80", desc: "Juicy grilled beef patty with lettuce, tomato, and cheese." },
  { name: "Sushi", price: 12, img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80", desc: "Fresh salmon, tuna, and avocado rolls, served with soy sauce." },
  { name: "Salad", price: 5, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80", desc: "Green garden salad with crispy veggies and vinaigrette." },
  { name: "Taco", price: 8, img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80", desc: "Spicy beef taco with salsa, avocado, and fresh cilantro." }
];

let cart = [];

function saveCart() {
  localStorage.setItem('foodie_cart', JSON.stringify(cart));
}
function loadCart() {
  const stored = localStorage.getItem('foodie_cart');
  cart = stored ? JSON.parse(stored) : [];
}

function renderMenu() {
  const menuDiv = document.getElementById('menu');
  menuDiv.innerHTML = '';
  menu.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'menu-item interactive-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <img src="${item.img}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p class="menu-price"><b>$${item.price}</b></p>
        </div>
        <div class="card-back">
          <div class="desc">${item.desc}</div>
          <button onclick="addToCart(${idx})" class="add-btn">Add to Cart</button>
        </div>
      </div>
    `;
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.classList.toggle('flipped');
      }
    });
    card.addEventListener('click', function (e) {
      if (!e.target.classList.contains('add-btn')) {
        card.classList.toggle('flipped');
      }
    });
    card.addEventListener('mouseleave', () => card.classList.remove('flipped'));
    card.addEventListener('blur', () => card.classList.remove('flipped'));
    menuDiv.appendChild(card);
  });
}

function renderCart() {
  const cartUl = document.getElementById('cart');
  cartUl.innerHTML = '';
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} - $${item.price} <button class="remove-btn" onclick="removeFromCart(${i})">Remove</button>`;
    cartUl.appendChild(li);
  });
  document.getElementById('cart-total').textContent = total ? `Total: $${total}` : '';
  saveCart();
}

function addToCart(idx) {
  cart.push(menu[idx]);
  renderCart();
  showToast("Added to cart!");
}

function removeFromCart(i) {
  cart.splice(i, 1);
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to clear the cart?")) {
    cart = [];
    renderCart();
  }
}

// Checkout Modal Logic
function checkout() {
  if (!cart.length) {
    showToast("Your cart is empty!");
    return;
  }
  document.getElementById('checkout-modal').style.display = "block";
  document.getElementById('modal-overlay').style.display = "block";
  showPayPalButton();
  showToast("Pay with PayPal below.");
}
function closeCheckout() {
  document.getElementById('checkout-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('paypal-button-container').innerHTML = '';
}

// PayPal button, thank you step after payment
function showPayPalButton() {
  document.getElementById('paypal-button-container').innerHTML = '';
  if (!window.paypal) {
    showToast("PayPal SDK not loaded.");
    return;
  }
  paypal.Buttons({
    createOrder: function(data, actions) {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      return actions.order.create({
        purchase_units: [{
          amount: { value: total.toFixed(2) }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        document.getElementById('paypal-button-container').innerHTML = `
          <div style="padding:22px;text-align:center">
            <h4 style="color:#3cc055; margin-bottom:7px;">Thank you, ${details.payer.name.given_name}!</h4>
            <div style="color:#333; font-size:1.13em; margin-bottom:8px;">
              Your payment was successful.<br>
              Your food is on its way 🍕🍔🍣!
            </div>
          </div>
        `;
        cart = [];
        renderCart();
        showToast("Payment successful! Thank you.");
        setTimeout(closeCheckout, 2500);
      });
    },
    onError: function(err) {
      showToast("Payment failed. Please try again.");
    }
  }).render('#paypal-button-container');
}

// Toast feedback
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "show";
  setTimeout(() => { toast.className = ""; }, 2500);
}

// On page load
window.onload = function() {
  loadCart();
  renderMenu();
  renderCart();
}

// Contact Form with Formspree (set your real form id!)
document.getElementById('contact-form').addEventListener('submit', async function(event) {
  event.preventDefault();
  const status = document.getElementById('contact-form-status');
  status.textContent = '';
  const form = event.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };
  const endpoint = 'https://formspree.io/f/https://formspree.io/f/xnnkpzda';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      status.style.color = '#28a745';
      status.textContent = "Message sent successfully!";
      form.reset();
    } else {
      status.style.color = '#c82333';
      status.textContent = "There was a problem sending your message. Please try again.";
    }
  } catch (error) {
    status.style.color = '#c82333';
    status.textContent = "Network error. Please try again.";
  }
});