const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
let imageMap = {};
if (fs.existsSync(path.join(baseDir, 'clean_image_map.json'))) {
  try {
    let raw = fs.readFileSync(path.join(baseDir, 'clean_image_map.json'), 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    imageMap = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse clean_image_map.json', e.message);
  }
}

// Read products data
let productsData = { Favorites: [], BestSellers: [] };
if (fs.existsSync(path.join(baseDir, 'products_full.json'))) {
  try {
    let raw = fs.readFileSync(path.join(baseDir, 'products_full.json'), 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    productsData = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not parse products_full.json', e.message);
  }
}

const allProducts = [...(productsData.Favorites || []), ...(productsData.BestSellers || [])];

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Sidebar HTML for desktop categories
const categoriesSidebarHtml = `
<div class="categories-sidebar-box">
  <ul>
    <li>
      <a href="/collections/dog-treats">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22.9999 6.59382C22.2363 5.2436 21.1634 3.959 20.4388 3.28493C18.8456 1.80221 17.5132 1.84092 16.8608 1.99589C16.5984 2.05825 16.3569 2.15967 16.1419 2.29335C15.0164 1.42531 13.6499 1 12 1C10.35 1 8.98357 1.42531 7.858 2.29335C7.64299 2.15967 7.40149 2.05825 7.13913 1.99589C6.48677 1.84092 5.15434 1.80216 3.56116 3.28488C2.83656 3.959 1.76364 5.2436 1.00009 6.59387C-0.0410031 8.43488 -0.270644 9.92844 0.317638 11.0332C1.01115 12.3354 2.08037 12.699 2.93392 12.7979C2.72983 13.6492 2.60467 14.5626 2.60467 15.6946C2.60467 17.2358 2.93917 18.5626 3.59889 19.638C4.17888 20.5835 5.01316 21.3403 6.07867 21.8873C7.74105 22.7408 9.68726 22.9546 11.2176 23V17.8474C10.2699 17.3755 9.34676 16.1941 9.34676 15.2527C9.34676 13.6669 11.0077 13.6669 12.0001 13.6669C12.9924 13.6669 14.6534 13.6669 14.6534 15.2527C14.6534 16.1942 13.7302 17.3755 12.7825 17.8474V22.9999C14.3129 22.9546 16.2592 22.7407 17.9215 21.8873C18.9869 21.3402 19.8213 20.5835 20.4012 19.638C21.0609 18.5625 21.3955 17.2358 21.3955 15.6945C21.3955 14.5625 21.2704 13.6491 21.0662 12.7978C21.9198 12.6989 22.989 12.3353 23.6825 11.0331C24.2706 9.92839 24.041 8.43488 22.9999 6.59382Z" fill="#176B70"/></svg>
        <span>Dog Treats</span>
      </a>
    </li>
    <li>
      <a href="/collections/cat-treats">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.7368 22C10.0757 21.9638 8.41447 21.529 6.93421 20.6953C5.56908 19.9343 4.35197 18.847 3.46382 17.488C2.52632 16.0383 2 14.2988 2 12.5048V3.24526C2 2.3936 2.77303 1.81374 3.48026 2.13991L7.23026 3.80682C7.47697 3.91554 7.75658 3.93366 8.00329 3.82494C9.22039 3.31756 10.5691 3.02764 12 3.02764C13.4309 3.02764 14.7796 3.29944 15.9967 3.82494C16.2434 3.93366 16.523 3.91554 16.7697 3.80682L20.5197 2.08537C21.2271 1.77732 22 2.33906 22 3.19072V12.2691C22 14.2082 21.4572 16.0744 20.4048 17.633C19.4836 18.992 18.2334 20.0792 16.852 20.804C15.3388 21.6013 13.6776 22 12 22H11.7368Z" fill="#176B70"/></svg>
        <span>Cat Treats</span>
      </a>
    </li>
    <li>
      <a href="/collections/dog-food-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.3249 10.2349C21.7532 10.8358 21.0646 11.2354 20.3668 11.5C21.0646 11.7646 21.7532 12.1642 22.3248 12.7651C24.2779 14.8181 23.9911 18.3366 23.9779 18.4853L23.9379 18.936L23.5093 18.978C23.4962 18.9792 23.277 19 22.9305 19C21.7393 18.9999 19.5236 18.7713 18.0672 17.2405C17.2568 16.3885 16.8329 15.2846 16.6142 14.2736C14.8042 15.802 12.1026 17.502 9.04042 17.502C3.55034 17.502 0.303171 12.0681 0.167621 11.8368L0 11.5507L0.167621 11.2647C0.271099 11.0879 2.19018 7.87639 5.5373 6.36897C5.68261 6.15568 5.84535 5.95123 6.02771 5.75955C7.48409 4.22867 9.69969 4 10.8909 4C11.2372 4 11.456 4.02075 11.4693 4.02201L11.8983 4.06404L11.9382 4.51473C11.9437 4.57604 11.9954 5.21242 11.9173 6.08215C13.769 6.69321 15.3816 7.78977 16.5961 8.81268C16.8091 7.77853 17.2338 6.63572 18.0673 5.75955C19.5238 4.22867 21.7394 4 22.9306 4C23.277 4 23.4958 4.02075 23.509 4.02201L23.938 4.06404L23.978 4.51473C23.9912 4.66354 24.2779 8.18198 22.3249 10.2349Z" fill="#176B70"/></svg>
        <span>Dog Food</span>
      </a>
    </li>
    <li>
      <a href="/collections/cat-food">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 5.46875C1 7.60074 2.50072 9.3888 4.50128 9.83204C4.3474 10.4396 4.26562 11.0756 4.26562 11.7304C4.26562 14.4365 6.29272 17.1383 7.16425 18.1742C8.02314 19.1952 9.21532 20.3302 10.361 20.9742C10.3369 21.0871 10.3242 21.2042 10.3242 21.3242C10.3242 22.2482 11.076 23 12 23C12.8085 23 13.4852 22.4244 13.6417 21.6615C13.664 21.5525 13.6758 21.4397 13.6758 21.3242C13.6758 21.2042 13.6631 21.0871 13.639 20.9742C14.7847 20.3302 15.9768 19.1952 16.8357 18.1743C17.7073 17.1383 19.7344 14.4365 19.7344 11.7304C19.7344 11.0756 19.6526 10.4396 19.4987 9.83204C21.4993 9.3888 23 7.60074 23 5.46875C23 3.00466 20.9953 1 18.5312 1C16.4647 1 14.7214 2.40996 14.2126 4.3184C13.5113 4.10868 12.7686 3.996 12 3.996C11.2314 3.996 10.4887 4.10868 9.78743 4.3184C9.27864 2.40996 7.53526 1 5.46875 1C3.00466 1 1 3.00466 1 5.46875Z" fill="#176B70"/></svg>
        <span>Cat Food</span>
      </a>
    </li>
    <li>
      <a href="/collections/all">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#176B70" stroke-width="2"/></svg>
        <span>All Products</span>
      </a>
    </li>
    <li>
      <a href="/collections/beef-rice-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#176B70" stroke-width="2"/></svg>
        <span>Beef &amp; Rice</span>
      </a>
    </li>
    <li>
      <a href="/collections/bone-health">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="#176B70" stroke-width="2.5"/></svg>
        <span>Bone Health</span>
      </a>
    </li>
    <li>
      <a href="/collections/chicken">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8" fill="#176B70"/></svg>
        <span>Chicken</span>
      </a>
    </li>
  </ul>
</div>
`;

function getHeroSliderHtml(prefix) {
  return `
<div class="hero-slider-standalone">
  <div class="hero-slide active" style="background-image: url('${prefix}images/img_2.jpg');"></div>
  <div class="hero-slide" style="background-image: url('${prefix}images/img_3.jpg');">
    <div class="hero-caption">
      <div class="hero-caption-title">$30 OFF $100+</div>
      <a href="/collections/all" class="hero-btn">SHOP NOW!</a>
    </div>
  </div>
  <div class="hero-arrows">
    <button class="hero-arrow-btn" onclick="prevHeroSlide()" aria-label="Previous">❮</button>
    <button class="hero-arrow-btn" onclick="nextHeroSlide()" aria-label="Next">❯</button>
  </div>
</div>
`;
}

function processHtmlContent(rawHtml, depth = 0, isHome = false) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);

  let html = rawHtml;

  // Replace Logo with YMA Distributors Logo
  html = html.replace(/<a[^>]*class="[^"]*tt-logo[^"]*"[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    return `<a class="tt-logo tt-logo-alignment" href="/"><img src="${prefix}images/yma-logo.png" alt="YMA Distributors" class="tt-retina" style="max-height: 52px; width: auto; object-fit: contain;"></a>`;
  });

  // Rebrand all text and domains
  html = html.replaceAll('YMA Distributors', 'YMA Distributors');
  html = html.replaceAll('Main Street Pet', 'YMA Distributors');
  html = html.replaceAll('ymadistributor.com', 'ymadistributor.com');
  html = html.replaceAll('ymadistributor', 'ymadistributor');
  html = html.replaceAll('ymadistributor.com', 'ymadistributor.com');
  html = html.replaceAll('ymadistributor', 'ymadistributor');
  html = html.replaceAll('MainStreetPetShop', 'YMADistributor');
  html = html.replaceAll('MainStreetPet', 'YMADistributor');


  // 1. Fix protocol-relative URLs
  html = html.replace(/(src|href|srcset|data-src|data-lazyload|data-thumb)=["']\/\/([a-zA-Z0-9_\-\.]+)/g, (match, attr, host) => {
    return `${attr}="https://${host}`;
  });

  // 2. Map local images if found in clean_image_map.json
  for (const [remoteUrl, localPath] of Object.entries(imageMap)) {
    if (!localPath || !remoteUrl) continue;
    const target = prefix + localPath;
    html = html.replaceAll(remoteUrl, target);
    const bare = remoteUrl.replace(/^https?:/, '');
    html = html.replaceAll(bare, target);
  }

  // 3. Inject CSS stylesheets into <head>
  const cssInjections = `
  <link rel="stylesheet" href="${prefix}css/theme.css">
  <link rel="stylesheet" href="${prefix}css/pagefly-animation.css">
  <link rel="stylesheet" href="${prefix}css/custom.css">
  `;
  html = html.replace(/<link[^>]+href="[^"]*theme\.css[^"]*"[^>]*>/i, cssInjections);
  html = html.replace(/<link[^>]+href="[^"]*pagefly-animation\.css[^"]*"[^>]*>/i, '');

  // 4. Remove missing Shopify internal preload script (causing 404 in console)
  html = html.replace(/<script[^>]*\/checkouts\/internal\/preloads\.js[^>]*><\/script>/gi, '');

  // 5. Point vendor scripts to local js/ folder
  html = html.replace(/https:\/\/www\.ymadistributor\.com\/cdn\/shop\/t\/8\/assets\/jquery\.min\.js[^\"]*/g, `${prefix}js/jquery.min.js`);
  html = html.replace(/https:\/\/www\.ymadistributor\.com\/cdn\/shop\/t\/8\/assets\/vendor\.min\.js[^\"]*/g, `${prefix}js/vendor.min.js`);
  html = html.replace(/https:\/\/www\.ymadistributor\.com\/cdn\/shop\/t\/8\/assets\/theme\.min\.js[^\"]*/g, `${prefix}js/theme.min.js`);
  html = html.replace(/https:\/\/cdn\.shopify\.com\/s\/javascripts\/currencies\.js/g, `${prefix}js/currencies.js`);
  html = html.replace(/https:\/\/www\.ymadistributor\.com\/cdn\/shop\/t\/8\/assets\/jquery\.currencies\.min\.js[^\"]*/g, `${prefix}js/jquery.currencies.min.js`);
  html = html.replace(/https:\/\/www\.ymadistributor\.com\/cdn\/shop\/t\/8\/compiled_assets\/scripts\.js[^\"]*/g, `${prefix}js/compiled_scripts.js`);

  // 6. Remove Shopify telemetry / tracking scripts that produce console spam
  html = html.replace(/<script[^>]*trekkie[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*loader\.init-shop-cart-sync[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*storefront[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*perf-kit[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<script[^>]*shopify-monorail[^>]*>[\s\S]*?<\/script>/gi, '');

  // 7. Replace Hero Revolution slider on homepage with standalone slider & populated categories menu
  if (isHome) {
    // Populate categories menu column
    html = html.replace(
      /<div class="col-md-3 for-categories-menu tt-hidden-mobile"><\/div>/i,
      `<div class="col-md-3 for-categories-menu tt-hidden-mobile">${categoriesSidebarHtml}</div>`
    );

    // Replace the revolution slider wrapper with our standalone responsive slider
    const revStart = html.indexOf('<div class="col-12 col-md-12 col-lg-9">');
    if (revStart !== -1) {
      const revEnd = html.indexOf('</div>\n</div>\n  </div>\n</div><style>', revStart);
      if (revEnd !== -1) {
        const replacement = `<div class="col-12 col-md-12 col-lg-9 hero-slider-col">\n${getHeroSliderHtml(prefix)}\n</div>`;
        html = html.substring(0, revStart) + replacement + html.substring(revEnd + '</div>\n</div>\n  </div>\n</div>'.length);
      }
    }
  }

  // 8. Injected Cart Overlay, Cart Drawer, Region Notice Modal, Toast & cart.js
  const cartMarkup = `
  <!-- Cart Drawer Overlay -->
  <div id="cartDrawerOverlay" class="cart-drawer-overlay" onclick="closeCartDrawer()"></div>

  <!-- Cart Drawer -->
  <div id="cartDrawer" class="cart-drawer">
    <div class="cart-drawer-header">
      <div class="cart-drawer-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F29B50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Shopping Cart</span>
      </div>
      <button class="cart-drawer-close" onclick="closeCartDrawer()" aria-label="Close">&times;</button>
    </div>
    <div id="cartDrawerItems" class="cart-drawer-items"></div>
    <div id="drawerCartFooter" class="cart-drawer-footer">
      <div class="cart-drawer-subtotal">
        <span>Subtotal:</span>
        <span id="cartDrawerSubtotal" style="color: #176B70; font-size: 18px;">$0.00</span>
      </div>
      <p style="font-size: 12px; color: #888; margin: 4px 0 14px;">Taxes and shipping calculated at checkout</p>
      <button class="cart-drawer-checkout-btn" onclick="openCheckoutNotice(event)">
        PROCEED TO CHECKOUT
      </button>
    </div>
  </div>

  <!-- Region Shipping Notice Modal -->
  <div id="regionNoticeModal" class="region-modal-overlay">
    <div class="region-modal">
      <div class="region-modal-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F29B50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>Shipping Notice</h3>
      <p>Shipping is currently not available in your region. We apologize for any inconvenience. Please check back later or contact customer support for updates.</p>
      <button onclick="closeCheckoutNotice()">OK, UNDERSTOOD</button>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="cartToast" class="cart-toast">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span id="cartToastText">Item added to cart!</span>
  </div>

  <!-- Client-side Cart & Interaction Script -->
  <script src="${prefix}cart.js"></script>
  `;

  html = html.replace('</body>', `${cartMarkup}\n</body>`);

  return html;
}

// Generate Dedicated Product Detail Page
function generateProductHtml(prod, depth = 0) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  const slug = prod.Url.split('/').pop();
  let prodImg = prod.Img;
  if (imageMap[prodImg]) {
    prodImg = prefix + imageMap[prodImg];
  }

  const rawSample = fs.readFileSync(path.join(baseDir, 'raw_routes', 'collections_dog-treats.html'), 'utf8');
  const headEndIdx = rawSample.indexOf('</header>') + '</header>'.length;
  const headerPart = rawSample.substring(0, headEndIdx);

  const footStartIdx = rawSample.indexOf('<footer');
  const footerPart = rawSample.substring(footStartIdx);

  const productMainHtml = `
  <div class="tt-breadcrumb" style="padding: 15px 0; background: #fbfbfb; border-bottom: 1px solid #eee;">
    <div class="container">
      <ul style="list-style: none; display: flex; gap: 8px; margin: 0; padding: 0; font-size: 13px; color: #777;">
        <li><a href="/" style="color: #176B70;">Home</a></li>
        <li>/</li>
        <li><a href="/collections/all" style="color: #176B70;">Shop</a></li>
        <li>/</li>
        <li style="color: #333; font-weight: 500;">${escapeHtml(prod.Title)}</li>
      </ul>
    </div>
  </div>

  <div id="tt-pageContent">
    <div class="container-indent">
      <div class="container">
        <div class="row product-single-row">
          <div class="col-12 col-md-6 text-center">
            <div class="product-single-image-box">
              <img src="${prodImg}" alt="${escapeHtml(prod.FullTitle || prod.Title)}" class="product-single-main-img">
            </div>
          </div>
          <div class="col-12 col-md-6 product-single-info-col">
            <h1 class="product-single-title">${escapeHtml(prod.FullTitle || prod.Title)}</h1>
            <div class="product-single-rating">
              ★★★★★ <span class="rating-count">(4.9/5 based on customer reviews)</span>
            </div>
            <div class="product-single-price-box">
              <span class="product-single-price">${prod.Price}</span>
              ${prod.OldPrice ? `<span class="product-single-old-price">${prod.OldPrice}</span>` : ''}
              <span class="stock-badge">In Stock</span>
            </div>
            <p class="product-single-short-desc">
              Premium quality formula designed specifically for your pet's wellness, nutritional balance, and vitality. Made with high quality ingredients and tested for superior standard and taste.
            </p>
            <div class="product-single-actions">
              <div class="product-single-qty-wrapper">
                <button type="button" class="qty-btn" onclick="let q=document.getElementById('productSingleQty'); q.value = Math.max(1, parseInt(q.value)-1);">-</button>
                <input type="number" id="productSingleQty" value="1" min="1" class="qty-input">
                <button type="button" class="qty-btn" onclick="let q=document.getElementById('productSingleQty'); q.value = parseInt(q.value)+1;">+</button>
              </div>
              <button class="btn product-single-addtocart-btn" onclick="for(let i=0; i<parseInt(document.getElementById('productSingleQty').value); i++) { addToCart({ id: '${slug}', title: '${escapeJs(prod.FullTitle || prod.Title)}', price: '${prod.Price}', img: '${prodImg}' }); }">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                ADD TO CART
              </button>
            </div>
            <button class="product-single-buynow-btn" onclick="openCheckoutNotice(event)">
              BUY NOW
            </button>
            <div class="product-guarantee-box">
              <div class="guarantee-item">🚚 <span>Free Shipping On Orders Over $49</span></div>
              <div class="guarantee-item">🛡️ <span>30-Day Money Back Guarantee</span></div>
              <div class="guarantee-item">🔒 <span>Secure 256-Bit SSL Checkout</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  const fullHtml = headerPart + productMainHtml + footerPart;
  return processHtmlContent(fullHtml, depth, false);
}

// Generate Dedicated Cart & Checkout Pages
function generateCartPageHtml(depth = 0) {
  const rawSample = fs.readFileSync(path.join(baseDir, 'raw_routes', 'collections_dog-treats.html'), 'utf8');
  const headEndIdx = rawSample.indexOf('</header>') + '</header>'.length;
  const headerPart = rawSample.substring(0, headEndIdx);
  const footStartIdx = rawSample.indexOf('<footer');
  const footerPart = rawSample.substring(footStartIdx);

  const cartBody = `
  <div class="tt-breadcrumb" style="padding: 15px 0; background: #fbfbfb; border-bottom: 1px solid #eee;">
    <div class="container">
      <ul style="list-style: none; display: flex; gap: 8px; margin: 0; padding: 0; font-size: 13px; color: #777;">
        <li><a href="/" style="color: #176B70;">Home</a></li>
        <li>/</li>
        <li style="color: #333; font-weight: 500;">Shopping Cart</li>
      </ul>
    </div>
  </div>

  <div id="tt-pageContent" style="padding: 40px 0 80px;">
    <div class="container">
      <h1 style="font-size: 28px; font-weight: 700; color: #191919; margin-bottom: 25px; border-bottom: 2px solid #E7F1F2; padding-bottom: 15px;">Your Shopping Cart</h1>
      
      <div class="row">
        <div class="col-12 col-lg-8">
          <div id="cartPageItems" style="border: 1px solid #ebebeb; border-radius: 8px; padding: 20px; background: #fff;">
            <!-- Dynamically populated by cart.js -->
          </div>
        </div>
        
        <div class="col-12 col-lg-4 mt-4 mt-lg-0">
          <div style="border: 1px solid #ebebeb; border-radius: 8px; padding: 24px; background: #fcfcfc;">
            <h3 style="font-size: 18px; font-weight: 700; margin: 0 0 18px;">Order Summary</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
              <span>Subtotal:</span>
              <span id="cartPageSubtotal" style="font-weight: 700; color: #176B70;">$0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #777;">
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #777;">
              <span>Taxes:</span>
              <span>$0.00</span>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
            <button class="cart-drawer-checkout-btn" onclick="openCheckoutNotice(event)" style="margin-bottom: 12px;">
              PROCEED TO CHECKOUT
            </button>
            <a href="/collections/all" style="display: block; text-align: center; font-size: 13px; color: #176B70; font-weight: 600; text-decoration: underline;">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  return processHtmlContent(headerPart + cartBody + footerPart, depth, false);
}

function generateCheckoutPageHtml(depth = 0) {
  const rawSample = fs.readFileSync(path.join(baseDir, 'raw_routes', 'collections_dog-treats.html'), 'utf8');
  const headEndIdx = rawSample.indexOf('</header>') + '</header>'.length;
  const headerPart = rawSample.substring(0, headEndIdx);
  const footStartIdx = rawSample.indexOf('<footer');
  const footerPart = rawSample.substring(footStartIdx);

  const checkoutBody = `
  <div class="tt-breadcrumb" style="padding: 15px 0; background: #fbfbfb; border-bottom: 1px solid #eee;">
    <div class="container">
      <ul style="list-style: none; display: flex; gap: 8px; margin: 0; padding: 0; font-size: 13px; color: #777;">
        <li><a href="/" style="color: #176B70;">Home</a></li>
        <li>/</li>
        <li><a href="/cart" style="color: #176B70;">Cart</a></li>
        <li>/</li>
        <li style="color: #333; font-weight: 500;">Checkout</li>
      </ul>
    </div>
  </div>

  <div id="tt-pageContent" style="padding: 60px 0 100px;">
    <div class="container" style="max-width: 600px !important;">
      <div style="border: 1px solid #e5e5e5; border-radius: 12px; padding: 40px 30px; text-align: center; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: #FEF0E6; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#F29B50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 style="font-size: 24px; font-weight: 700; color: #191919; margin-bottom: 14px;">Shipping Notice</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 28px;">
          Shipping is currently not available in your region. We apologize for any inconvenience. Please check back later or contact customer support for updates.
        </p>
        <a href="/collections/all" class="hero-btn" style="display: inline-block; padding: 12px 35px; border-radius: 25px; text-decoration: none;">
          RETURN TO STORE
        </a>
      </div>
    </div>
  </div>
  `;

  return processHtmlContent(headerPart + checkoutBody + footerPart, depth, false);
}

// Ensure target directories exist
const dirsToEnsure = [
  path.join(baseDir, 'collections'),
  path.join(baseDir, 'collections', 'all', 'products'),
  path.join(baseDir, 'collections', 'chicken', 'products'),
  path.join(baseDir, 'products'),
  path.join(baseDir, 'pages'),
  path.join(baseDir, 'html'),
  path.join(baseDir, 'html', 'collections'),
  path.join(baseDir, 'html', 'collections', 'all', 'products'),
  path.join(baseDir, 'html', 'collections', 'chicken', 'products'),
  path.join(baseDir, 'html', 'products'),
  path.join(baseDir, 'html', 'pages'),
  path.join(baseDir, 'html', 'css'),
  path.join(baseDir, 'html', 'js'),
  path.join(baseDir, 'html', 'images')
];
for (const d of dirsToEnsure) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

console.log('Generating index.html (Homepage)...');
const rawIndex = fs.readFileSync(path.join(baseDir, 'original_index.html'), 'utf8');

// 1. Root index.html (depth = 0)
const indexRoot = processHtmlContent(rawIndex, 0, true);
fs.writeFileSync(path.join(baseDir, 'index.html'), indexRoot, 'utf8');

// 2. html/index.html (depth = 1)
const indexHtmlFolder = processHtmlContent(rawIndex, 1, true);
fs.writeFileSync(path.join(baseDir, 'html', 'index.html'), indexHtmlFolder, 'utf8');

console.log('Processed Homepage -> index.html and html/index.html');

// Process all raw_routes
const rawRoutesDir = path.join(baseDir, 'raw_routes');
if (fs.existsSync(rawRoutesDir)) {
  const files = fs.readdirSync(rawRoutesDir);
  console.log(`Processing ${files.length} route files from raw_routes/...`);

  for (const f of files) {
    const rawContent = fs.readFileSync(path.join(rawRoutesDir, f), 'utf8');
    if (rawContent.length < 500) {
      console.warn(`Skipping small file: ${f}`);
      continue;
    }

    if (f.startsWith('collections_')) {
      const routeName = f.replace(/^collections_/, '').replace(/\.html$/, '');
      const processedRoot = processHtmlContent(rawContent, 1, false);
      fs.writeFileSync(path.join(baseDir, 'collections', `${routeName}.html`), processedRoot, 'utf8');

      const processedHtmlFolder = processHtmlContent(rawContent, 2, false);
      fs.writeFileSync(path.join(baseDir, 'html', 'collections', `${routeName}.html`), processedHtmlFolder, 'utf8');

      console.log(`Saved collection: /collections/${routeName}`);
    } else if (f.startsWith('pages_')) {
      const pageName = f.replace(/^pages_/, '').replace(/\.html$/, '');
      const processedRoot = processHtmlContent(rawContent, 1, false);
      fs.writeFileSync(path.join(baseDir, 'pages', `${pageName}.html`), processedRoot, 'utf8');

      const processedHtmlFolder = processHtmlContent(rawContent, 2, false);
      fs.writeFileSync(path.join(baseDir, 'html', 'pages', `${pageName}.html`), processedHtmlFolder, 'utf8');

      console.log(`Saved page: /pages/${pageName}`);
    }
  }
}

// Generate all Product Detail Pages
console.log(`Generating ${allProducts.length} Product Detail Pages...`);
for (const prod of allProducts) {
  if (!prod.Url) continue;
  const slug = prod.Url.split('/').pop();

  if (prod.Url.includes('/collections/chicken/products/')) {
    const prodHtmlDepth3 = generateProductHtml(prod, 3);
    fs.writeFileSync(path.join(baseDir, 'collections', 'chicken', 'products', `${slug}.html`), prodHtmlDepth3, 'utf8');

    const prodHtmlDepth4 = generateProductHtml(prod, 4);
    fs.writeFileSync(path.join(baseDir, 'html', 'collections', 'chicken', 'products', `${slug}.html`), prodHtmlDepth4, 'utf8');
  } else if (prod.Url.includes('/collections/all/products/')) {
    const prodHtmlDepth3 = generateProductHtml(prod, 3);
    fs.writeFileSync(path.join(baseDir, 'collections', 'all', 'products', `${slug}.html`), prodHtmlDepth3, 'utf8');

    const prodHtmlDepth4 = generateProductHtml(prod, 4);
    fs.writeFileSync(path.join(baseDir, 'html', 'collections', 'all', 'products', `${slug}.html`), prodHtmlDepth4, 'utf8');
  }

  // Also write to /products/<slug>.html (depth = 1) and /html/products/<slug>.html (depth = 2)
  const prodHtmlDepth1 = generateProductHtml(prod, 1);
  fs.writeFileSync(path.join(baseDir, 'products', `${slug}.html`), prodHtmlDepth1, 'utf8');

  const prodHtmlDepth2 = generateProductHtml(prod, 2);
  fs.writeFileSync(path.join(baseDir, 'html', 'products', `${slug}.html`), prodHtmlDepth2, 'utf8');
}
console.log(`Saved all ${allProducts.length} Product pages!`);

// Generate Cart and Checkout Pages
console.log('Generating Cart and Checkout pages...');
const cartHtmlRoot = generateCartPageHtml(0);
fs.writeFileSync(path.join(baseDir, 'cart.html'), cartHtmlRoot, 'utf8');
const cartHtmlFolder = generateCartPageHtml(1);
fs.writeFileSync(path.join(baseDir, 'html', 'cart.html'), cartHtmlFolder, 'utf8');

const checkoutHtmlRoot = generateCheckoutPageHtml(0);
fs.writeFileSync(path.join(baseDir, 'checkout.html'), checkoutHtmlRoot, 'utf8');
const checkoutHtmlFolder = generateCheckoutPageHtml(1);
fs.writeFileSync(path.join(baseDir, 'html', 'checkout.html'), checkoutHtmlFolder, 'utf8');

console.log('Saved Cart & Checkout pages!');

// Copy assets into html/ directory for complete self-contained folder structure
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(path.join(baseDir, 'css'), path.join(baseDir, 'html', 'css'));
copyDirRecursive(path.join(baseDir, 'js'), path.join(baseDir, 'html', 'js'));
fs.copyFileSync(path.join(baseDir, 'cart.js'), path.join(baseDir, 'html', 'cart.js'));
fs.copyFileSync(path.join(baseDir, 'cart.js'), path.join(baseDir, 'js', 'cart.js'));

console.log('Site build completed successfully!');
