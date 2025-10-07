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

    const sizesContainer = productCard.querySelector('.sizes');
    let size = "N/A";
    if (sizesContainer) {
      const activeSize = productCard.querySelector('.size.active');
      if (!activeSize) {
        alert('Please select a size before adding to cart.');
        return;
      }
      size = activeSize.textContent;
    }

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
    if (!button) return;
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
    alert(`Thank You for Ordering From TrendZ
Your Order has been placed successfully! 
Your Total is ₹${totalAmount.toFixed(2)}`);

    cart = [];
    saveCart();
    closeCartHandler();
  });

  // ======== INITIALIZATION ========
  updateCartCount();

  // ======== CAROUSEL FUNCTIONALITY ========
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentSlide = 0;
  let autoSlideInterval;

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    document.querySelector('.carousel-container').style.transform = `translateX(-${index * 100}%)`;

    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentSlide = index;
  }

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      showSlide(i);
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });

  // Button controls
  nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    resetAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    resetAutoSlide();
  });

  // Auto slide
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 3500);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  startAutoSlide();
  showSlide(0);
});

// ======== Smooth Scrolling ========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});



// ======== News Letter ========
document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('newsletter-email');
  const signupBtn = document.getElementById('signup-btn');

  signupBtn.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(email)) {
      alert('You are signed up for TrendZ!');
      emailInput.value = ''; // clear input after signup
    } else {
      emailInput.reportValidity(); // shows browser's built-in warning
    }
  });
});
