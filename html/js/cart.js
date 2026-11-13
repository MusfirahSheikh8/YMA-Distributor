/**
 * Main Street Pet Shop - Client-Side Cart & Store Interaction
 * 100% Frontend - Vercel Ready
 */

(function () {
  'use strict';

  // 1. Cart State Management
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('msp_cart')) || [];
  } catch (e) {
    cart = [];
  }

  function saveCart() {
    try {
      localStorage.setItem('msp_cart', JSON.stringify(cart));
    } catch (e) {}
    updateCartUI();
  }

  function getCartCount() {
    return cart.reduce((total, item) => total + (item.qty || 1), 0);
  }

  function getCartTotal() {
    return cart.reduce((total, item) => {
      const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
      return total + price * (item.qty || 1);
    }, 0).toFixed(2);
  }

  window.addToCart = function (product) {
    if (!product || !product.id) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title || 'Product',
        price: product.price || '$0.00',
        img: product.img || '',
        qty: 1
      });
    }
    saveCart();
    showToast(`"${product.title || 'Product'}" added to cart!`);
    openCartDrawer();
  };

  window.removeFromCart = function (id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
  };

  window.changeQty = function (id, delta) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
    }
  };

  // 2. UI Updates
  function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();

    // Update badges
    document.querySelectorAll('.cart-count-badge, .tt-badge-cart').forEach(el => {
      el.textContent = count;
      if (count > 0) {
        el.style.display = 'inline-block';
        el.classList.remove('hide');
      } else {
        el.style.display = 'none';
        el.classList.add('hide');
      }
    });

    // Update subtotal in header if present
    document.querySelectorAll('.tt-cart-total-price, .header-cart-total').forEach(el => {
      el.textContent = `$${total}`;
    });

    // Update drawer items
    const drawerList = document.getElementById('cartDrawerItems') || document.getElementById('drawerCartList');
    const drawerSubtotal = document.getElementById('cartDrawerSubtotal') || document.getElementById('drawerTotalPrice');
    const drawerEmpty = document.getElementById('drawerCartEmpty');
    const drawerFooter = document.getElementById('drawerCartFooter');

    if (drawerSubtotal) {
      drawerSubtotal.textContent = `$${total}`;
    }

    if (drawerList) {
      if (cart.length === 0) {
        drawerList.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: #888;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px;">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p style="font-size: 15px; margin: 0 0 8px; font-weight: 500; color: #555;">Your cart is empty</p>
            <p style="font-size: 13px; margin: 0;">Add your favorite pet supplies to start shopping!</p>
          </div>
        `;
        if (drawerEmpty) drawerEmpty.style.display = 'block';
        if (drawerFooter) drawerFooter.style.display = 'none';
      } else {
        if (drawerEmpty) drawerEmpty.style.display = 'none';
        if (drawerFooter) drawerFooter.style.display = 'block';

        drawerList.innerHTML = cart.map(item => `
          <div class="cart-drawer-item" style="display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; align-items: center;">
            <img src="${item.img}" alt="${item.title}" style="width: 65px; height: 65px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; background: #fff; padding: 4px; flex-shrink: 0;">
            <div style="flex: 1; min-width: 0;">
              <h4 style="font-size: 13px; margin: 0 0 6px; line-height: 1.35; font-weight: 600; color: #191919; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${item.title}">${item.title}</h4>
              <div style="font-size: 14px; font-weight: 700; color: #176B70; margin-bottom: 6px;">${item.price}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" onclick="changeQty('${item.id}', -1)" style="width: 26px; height: 26px; border: 1px solid #ddd; background: #f8f8f8; cursor: pointer; border-radius: 4px; font-weight: 700; line-height: 1;">-</button>
                <span style="font-size: 13px; font-weight: 600; min-width: 20px; text-align: center;">${item.qty}</span>
                <button type="button" onclick="changeQty('${item.id}', 1)" style="width: 26px; height: 26px; border: 1px solid #ddd; background: #f8f8f8; cursor: pointer; border-radius: 4px; font-weight: 700; line-height: 1;">+</button>
              </div>
            </div>
            <button type="button" onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 22px; padding: 4px; line-height: 1; transition: color 0.2s;" title="Remove" onmouseover="this.style.color='#f8353e'" onmouseout="this.style.color='#aaa'">&times;</button>
          </div>
        `).join('');
      }
    }

    // Update cartPageItems if on /cart page
    const pageItems = document.getElementById('cartPageItems');
    const pageSubtotal = document.getElementById('cartPageSubtotal');
    if (pageSubtotal) pageSubtotal.textContent = `$${total}`;
    if (pageItems) {
      if (cart.length === 0) {
        pageItems.innerHTML = `
          <div style="text-align: center; padding: 50px 20px; color: #888;">
            <p style="font-size: 16px; margin: 0 0 10px; font-weight: 500; color: #555;">Your cart is currently empty.</p>
            <a href="/collections/all" class="hero-btn" style="display: inline-block; margin-top: 10px; background: #176B70; color: #fff; padding: 10px 25px; border-radius: 20px;">START SHOPPING</a>
          </div>
        `;
      } else {
        pageItems.innerHTML = cart.map(item => `
          <div style="display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; align-items: center;">
            <img src="${item.img}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #eee; border-radius: 8px; padding: 4px; background: #fff;">
            <div style="flex: 1;">
              <h4 style="font-size: 15px; margin: 0 0 6px; font-weight: 600; color: #191919;">${item.title}</h4>
              <div style="font-size: 15px; font-weight: 700; color: #176B70; margin-bottom: 8px;">${item.price}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" onclick="changeQty('${item.id}', -1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: #f8f8f8; cursor: pointer; border-radius: 4px; font-weight: 700;">-</button>
                <span style="font-size: 14px; font-weight: 600; min-width: 24px; text-align: center;">${item.qty}</span>
                <button type="button" onclick="changeQty('${item.id}', 1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: #f8f8f8; cursor: pointer; border-radius: 4px; font-weight: 700;">+</button>
              </div>
            </div>
            <button type="button" onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 24px; padding: 8px;" title="Remove">&times;</button>
          </div>
        `).join('');
      }
    }
  }

  // 3. Drawer Controls
  window.openCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay') || document.getElementById('cartOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeCartDrawer = function () {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay') || document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // 4. Region Shipping Notice Modal (Checkout Block)
  window.openCheckoutNotice = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    closeCartDrawer();
    const modal = document.getElementById('regionNoticeModal') || document.getElementById('regionUnavailableModal');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    } else {
      alert('Shipping Notice: Shipping is currently not available in your region. Please check back later.');
    }
  };

  window.closeCheckoutNotice = function () {
    const modal = document.getElementById('regionNoticeModal') || document.getElementById('regionUnavailableModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  };

  // 5. Toast Notification
  window.showToast = function (message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    const textEl = document.getElementById('cartToastText') || toast;
    textEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  // 6. Hero Slider Controller
  let currentSlide = 0;
  window.nextHeroSlide = function () {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  };

  window.prevHeroSlide = function () {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  };

  // 7. Auto-Bind Product Cards and Checkout buttons
  function bindPageEvents() {
    // Intercept all "ADD TO CART" buttons across any page template
    document.addEventListener('click', function (e) {
      const addBtn = e.target.closest('.tt-btn-addtocart, .addtocart-item-js, .btn-custom-addtocart, button[name="add"], .thumbprod-button-bg');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();

        const card = addBtn.closest('.tt-product, .custom-prod-card, .tt-col-item, .product-item, [data-product-id]') || addBtn.parentElement;
        let title = 'Premium Pet Product';
        let price = '$24.99';
        let img = '';
        let id = 'prod_' + Math.floor(Math.random() * 100000);

        if (card) {
          const titleEl = card.querySelector('.tt-title a, .tt-title, .custom-prod-title, h2 a, h2');
          if (titleEl) title = titleEl.textContent.trim();

          const priceEl = card.querySelector('.tt-price span:not(.old-price), .custom-prod-price span:not(.old-price), .tt-price');
          if (priceEl) price = priceEl.textContent.trim().split(' ')[0];

          const imgEl = card.querySelector('img');
          if (imgEl) img = imgEl.getAttribute('data-lazyload') || imgEl.getAttribute('data-src') || imgEl.src;

          const linkEl = card.querySelector('a[href*="/products/"]');
          if (linkEl) {
            const href = linkEl.getAttribute('href');
            id = href.split('/').pop().replace(/[^a-zA-Z0-9_-]/g, '');
          }
        }

        addToCart({ id, title, price, img });
        return;
      }

      // Header Cart triggers
      const cartTrigger = e.target.closest('.header-cart-pill, .tt-cart, [data-tooltip="Cart"], .tt-dropdown-toggle[data-tooltip="Cart"]');
      if (cartTrigger) {
        e.preventDefault();
        openCartDrawer();
        return;
      }

      // Checkout triggers
      const checkoutTrigger = e.target.closest('a[href*="/checkout"], .btn-checkout, .cart-drawer-checkout-btn, button[name="checkout"]');
      if (checkoutTrigger) {
        e.preventDefault();
        openCheckoutNotice(e);
        return;
      }
    });

    // Auto rotate hero slides every 5.5 seconds
    if (document.querySelectorAll('.hero-slide').length > 1) {
      setInterval(window.nextHeroSlide, 5500);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateCartUI();
      bindPageEvents();
    });
  } else {
    updateCartUI();
    bindPageEvents();
  }

})();
