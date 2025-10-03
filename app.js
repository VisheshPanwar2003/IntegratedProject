document.addEventListener('DOMContentLoaded', () => {
  const cartIcon = document.getElementById('cart-icon');
  const cartSidebar = document.getElementById('cart-sidebar');
  const closeCart = document.getElementById('close-cart');
  const overlay = document.getElementById('overlay');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const checkoutBtn = document.querySelector('.checkout-btn');

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // ======== CART HELPERS ========
  const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
  };

  const updateCartCount = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ======== CART SIDEBAR ========
  const openCart = () => {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
    renderCartItems();
  };

  const closeCartHandler = () => {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
  };

  cartIcon.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartHandler);
  overlay.addEventListener('click', closeCartHandler);

  // ======== SIZE SELECTION ========
  document.querySelectorAll('.sizes .size').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = e.target.closest('.sizes');
      parent.querySelectorAll('.size').forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // ======== ADD TO CART ========
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      addProductToCart(productCard);
    });
  });

  function addProductToCart(productCard) {
    const brand = productCard.querySelector('.brand').textContent;
    const name = productCard.querySelector('.product-name').textContent;
    const priceText = productCard.querySelector('.price').textContent.replace(/[^\d.]/g, '');
    const price = parseFloat(priceText);
    const image = productCard.querySelector('.product-image').src;
    const activeSize = productCard.querySelector('.size.active');

    if (!activeSize) {
      alert('Please select a size before adding to cart.');
      return;
    }

    const size = activeSize.textContent;
    const productId = `${brand}-${name}-${size}`.replace(/\s+/g, '-');

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: productId,
        brand,
        name,
        price,
        image,
        size,
        quantity: 1
      });
    }

    saveCart();
    showAddToCartFeedback(productCard);
  }

  function showAddToCartFeedback(productCard) {
    const button = productCard.querySelector('.add-to-cart');
    const originalText = button.textContent;

    button.textContent = 'Added!';
    button.style.background = '#28a745';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '#088178';
    }, 1000);
  }

  // ======== RENDER CART ========
  function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
    }

    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.brand}</h4>
          <p>${item.name}</p>
          <p>Size: ${item.size}</p>
          <p>₹${item.price.toFixed(2)}</p>
          <div class="cart-item-actions">
            <button class="qty-btn decrease" data-id="${item.id}">-</button>
            <span class="item-quantity">${item.quantity}</span>
            <button class="qty-btn increase" data-id="${item.id}">+</button>
            <button class="remove-btn" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });

    updateCartTotal();
    attachCartItemEvents();
  }

  function updateCartTotal() {
    let totalElement = document.querySelector('.cart-total');
    if (!totalElement) {
      totalElement = document.createElement('div');
      totalElement.className = 'cart-total';
      document.querySelector('.cart-footer').prepend(totalElement);
    }
    totalElement.innerHTML = `<h3>Total: ₹${calculateTotal().toFixed(2)}</h3>`;
  }

  // ======== CART ITEM EVENTS ========
  function attachCartItemEvents() {
    // Increase quantity
    document.querySelectorAll('.qty-btn.increase').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.closest('.qty-btn').dataset.id;
        const item = cart.find(i => i.id === id);
        if (item) {
          item.quantity++;
          saveCart();
        }
      };
    });

    // Decrease quantity
    document.querySelectorAll('.qty-btn.decrease').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.closest('.qty-btn').dataset.id;
        const item = cart.find(i => i.id === id);
        if (item) {
          item.quantity--;
          if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
          }
          saveCart();
        }
      };
    });

    // Remove item
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.closest('.remove-btn').dataset.id;
        cart = cart.filter(i => i.id !== id);
        saveCart();
      };
    });
  }

  // ======== CHECKOUT ========
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const totalAmount = calculateTotal();
    alert(`Order placed successfully! Total: ₹${totalAmount.toFixed(2)}`);

    cart = [];
    saveCart();
    closeCartHandler();
  });

  // ======== INITIALIZATION ========
  updateCartCount();
});
