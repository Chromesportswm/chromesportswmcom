// ----- Simple storage helpers (localStorage) -----
const STORAGE_KEYS = {
  products: "chromeSports_products",
  settings: "chromeSports_settings",
  theme: "chromeSports_theme",
  adminSession: "chromeSports_adminSession"
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading storage", key, e);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving storage", key, e);
  }
}

// ----- Settings -----
let settings = {
  shopName: SHOP_CONFIG.shopName,
  tagline: SHOP_CONFIG.tagline,
  phoneDisplay: SHOP_CONFIG.phoneDisplay,
  timing: SHOP_CONFIG.timing,
  whatsappNumber: SHOP_CONFIG.whatsappNumber,
  logoPath: SHOP_CONFIG.logoPath
};

// Override from localStorage if exists
const storedSettings = loadJSON(STORAGE_KEYS.settings, null);
if (storedSettings) {
  settings = { ...settings, ...storedSettings };
}

// ----- Products -----
let products = loadJSON(STORAGE_KEYS.products, null);
if (!products) {
  products = [...SHOP_CONFIG.initialProducts];
  saveJSON(STORAGE_KEYS.products, products);
}

// Ensure existing products have category/sub_category (migration)
const categoriesConfig = SHOP_CONFIG.categories || {};
const defaultCategory = Object.keys(categoriesConfig)[0] || "General";
const defaultSub = categoriesConfig[defaultCategory] ? Object.keys(categoriesConfig[defaultCategory])[0] : "General";
let productsDirty = false;
products.forEach((p) => {
  if (!p.category) { p.category = defaultCategory; productsDirty = true; }
  if (!p.sub_category) { p.sub_category = defaultSub; productsDirty = true; }
});
if (productsDirty) saveJSON(STORAGE_KEYS.products, products);

// ----- Category filter state -----
let selectedCategory = null;
let selectedSubCategory = null;

// ----- RBAC: Admin vs Customer -----
function isAdmin() {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.adminSession) === "1";
  } catch (e) {
    return false;
  }
}

function setAdminSession() {
  try {
    sessionStorage.setItem(STORAGE_KEYS.adminSession, "1");
  } catch (e) {}
}

function clearAdminSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.adminSession);
  } catch (e) {}
}

function applyRBAC() {
  const admin = isAdmin();
  const navTabs = document.getElementById("nav-tabs");
  const navTabAdmin = document.getElementById("nav-tab-admin");
  const tabAdmin = document.getElementById("tab-admin");
  const staffLoginWrap = document.getElementById("staff-login-wrap");
  const staffLogoutWrap = document.getElementById("staff-logout-wrap");

  if (navTabs) navTabs.style.display = admin ? "" : "none";
  if (navTabAdmin) navTabAdmin.style.display = admin ? "" : "none";
  if (tabAdmin) tabAdmin.style.display = admin ? "" : "none";
  if (staffLoginWrap) staffLoginWrap.hidden = admin;
  if (staffLogoutWrap) staffLogoutWrap.hidden = !admin;

  if (!admin) {
    document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
    const shopTab = document.querySelector('.nav-tab[data-tab="shop"]');
    const shopPanel = document.getElementById("tab-shop");
    if (shopTab) shopTab.classList.add("active");
    if (shopPanel) shopPanel.classList.add("active");
    if (tabAdmin) tabAdmin.classList.remove("active");
  }
}

function openAdminLoginModal() {
  const modal = document.getElementById("admin-login-modal");
  const err = document.getElementById("admin-login-error");
  const input = document.getElementById("admin-login-password");
  if (modal) modal.hidden = false;
  if (err) { err.hidden = true; err.textContent = ""; }
  if (input) { input.value = ""; input.focus(); }
}

function closeAdminLoginModal() {
  const modal = document.getElementById("admin-login-modal");
  if (modal) modal.hidden = true;
}

function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("admin-login-password");
  const err = document.getElementById("admin-login-error");
  const password = (input && input.value) || "";
  const expected = (typeof SHOP_CONFIG.adminPassword !== "undefined") ? String(SHOP_CONFIG.adminPassword) : "";
  if (password === expected) {
    setAdminSession();
    closeAdminLoginModal();
    applyRBAC();
    renderAdminProductsList();
  } else {
    if (err) {
      err.textContent = "Incorrect password.";
      err.hidden = false;
    }
  }
}

function setupRBAC() {
  applyRBAC();
  document.getElementById("staff-login-link")?.addEventListener("click", openAdminLoginModal);
  document.getElementById("staff-logout-link")?.addEventListener("click", () => {
    clearAdminSession();
    applyRBAC();
  });
  document.getElementById("admin-login-backdrop")?.addEventListener("click", closeAdminLoginModal);
  document.getElementById("admin-login-close")?.addEventListener("click", closeAdminLoginModal);
  document.getElementById("admin-login-form")?.addEventListener("submit", handleAdminLoginSubmit);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("admin-login-modal");
      if (modal && !modal.hidden) closeAdminLoginModal();
    }
  });
}

// ----- DOM helpers -----
function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

// ----- WhatsApp helpers -----
function buildWhatsAppUrl(message) {
  const num = (settings.whatsappNumber || "").trim();
  if (!num) {
    alert("WhatsApp number is not configured in settings.");
    return "#";
  }
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${num}?text=${encoded}`;
}

// ----- Render settings into header and form -----
function renderSettingsUI() {
  $("#shop-name").textContent = settings.shopName;
  $("#shop-tagline").textContent = settings.tagline;
  $("#shop-phone").textContent = settings.phoneDisplay;
  $("#shop-timing").textContent = settings.timing;

  const logoEl = $("#shop-logo");
  logoEl.src = settings.logoPath || "logo.png";

  // Fill admin form
  $("#setting-shop-name").value = settings.shopName;
  $("#setting-shop-tagline").value = settings.tagline;
  $("#setting-shop-phone").value = settings.phoneDisplay;
  $("#setting-shop-timing").value = settings.timing;
  $("#setting-whatsapp-number").value = settings.whatsappNumber;
  $("#setting-logo-path").value = settings.logoPath;
}

// ----- Product rendering -----
function computeFinalPrice(product) {
  const discount = Number(product.discountPercent) || 0;
  const price = Number(product.price) || 0;
  if (discount <= 0) return { finalPrice: price, hasDiscount: false };
  const finalPrice = Math.round(price * (1 - discount / 100));
  return { finalPrice, hasDiscount: true };
}

function getStockClass(stock) {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in";
}

function colorsToArray(colors) {
  if (!colors) return [];
  if (Array.isArray(colors)) return colors;
  return String(colors)
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function getFilteredProducts() {
  return products.filter((p) => {
    const cat = (p.category || "").trim();
    const sub = (p.sub_category || "").trim();
    if (selectedCategory && cat !== selectedCategory) return false;
    if (selectedSubCategory && sub !== selectedSubCategory) return false;
    return true;
  });
}

function updateFilterVisibility() {
  const grid = $("#products-grid");
  const emptyMsg = $("#filter-empty-msg");
  if (!grid) return;
  grid.classList.add("is-filtering");
  const cards = grid.querySelectorAll(".product-card");
  let visibleCount = 0;
  cards.forEach((card) => {
    const cat = card.dataset.category || "";
    const sub = card.dataset.subCategory || "";
    const match =
      (!selectedCategory || cat === selectedCategory) &&
      (!selectedSubCategory || sub === selectedSubCategory);
    card.classList.toggle("filter-hidden", !match);
    if (match) visibleCount++;
  });
  if (emptyMsg) {
    emptyMsg.hidden = visibleCount > 0 || products.length === 0;
  }
  requestAnimationFrame(() => {
    grid.classList.remove("is-filtering");
  });
}

function getCategoriesWithProducts() {
  const cats = SHOP_CONFIG.categories || {};
  const withProducts = {};
  products.forEach((p) => {
    const c = (p.category || "").trim();
    if (!c) return;
    if (!withProducts[c]) withProducts[c] = new Set();
    const s = (p.sub_category || "").trim();
    if (s) withProducts[c].add(s);
  });
  return { categories: Object.keys(cats), withProducts, config: cats };
}

function renderFilterBar() {
  const catWrap = $("#filter-categories");
  const subRow = $("#filter-sub-row");
  const subWrap = $("#filter-subcategories");
  if (!catWrap || !subWrap) return;

  const { categories, withProducts, config } = getCategoriesWithProducts();
  catWrap.innerHTML = "";

  const allBtn = createEl("button", "filter-pill");
  allBtn.type = "button";
  allBtn.textContent = "All";
  allBtn.classList.toggle("active", !selectedCategory && !selectedSubCategory);
  allBtn.addEventListener("click", () => {
    selectedCategory = null;
    selectedSubCategory = null;
    renderFilterBar();
    updateFilterVisibility();
  });
  catWrap.appendChild(allBtn);

  categories.forEach((cat) => {
    const btn = createEl("button", "filter-pill");
    btn.type = "button";
    btn.textContent = cat;
    btn.classList.toggle("active", selectedCategory === cat && !selectedSubCategory);
    btn.addEventListener("click", () => {
      selectedCategory = cat;
      selectedSubCategory = null;
      renderFilterBar();
      updateFilterVisibility();
    });
    catWrap.appendChild(btn);
  });

  const subs = selectedCategory ? (config[selectedCategory] || {}) : {};
  const subKeys = Object.keys(subs);
  if (subKeys.length) {
    subRow.hidden = false;
    subWrap.innerHTML = "";
    const allSub = createEl("button", "filter-pill");
    allSub.type = "button";
    allSub.textContent = "All " + selectedCategory;
    allSub.classList.toggle("active", !selectedSubCategory);
    allSub.addEventListener("click", () => {
      selectedSubCategory = null;
      renderFilterBar();
      updateFilterVisibility();
    });
    subWrap.appendChild(allSub);
    subKeys.forEach((sub) => {
      const caption = subs[sub] || "";
      const btn = createEl("button", "filter-pill");
      btn.type = "button";
      btn.innerHTML = sub + (caption ? `<span class="filter-pill-caption">${caption}</span>` : "");
      btn.classList.toggle("active", selectedSubCategory === sub);
      btn.addEventListener("click", () => {
        selectedSubCategory = sub;
        renderFilterBar();
        updateFilterVisibility();
      });
      subWrap.appendChild(btn);
    });
  } else {
    subRow.hidden = true;
  }
}

function renderProductsGrid() {
  const grid = $("#products-grid");
  grid.innerHTML = "";

  if (!products.length) {
    const empty = createEl("p");
    empty.textContent = isAdmin()
      ? "No products yet. Add some items from the Admin (CRUD) tab."
      : "No products available at the moment. Check back soon.";
    grid.appendChild(empty);
    return;
  }

  products.forEach((p) => {
    const { finalPrice, hasDiscount } = computeFinalPrice(p);
    const card = createEl("article", "product-card");
    card.dataset.productId = p.id;
    card.dataset.category = (p.category || "").trim();
    card.dataset.subCategory = (p.sub_category || "").trim();
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".btn")) openProductDetail(p.id);
    });
    const content = createEl("div", "product-content");

    const imgWrap = createEl("div", "product-image-wrapper");
    const img = createEl("img");
    img.src =
      p.image ||
      "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg";
    img.alt = p.name;
    img.loading = "lazy";
    img.decoding = "async";
    imgWrap.appendChild(img);

    const titleRow = createEl("div", "product-title-row");
    const titleBox = createEl("div");
    const title = createEl("h3", "product-title");
    title.textContent = p.name;
    const desc = createEl("p", "product-description");
    desc.textContent = p.description || "";
    titleBox.appendChild(title);
    titleBox.appendChild(desc);
    titleRow.appendChild(titleBox);

    if (hasDiscount && p.discountPercent > 0) {
      const badge = createEl("div", "badge-discount");
      badge.textContent = `-${p.discountPercent}% OFF`;
      titleRow.appendChild(badge);
    }

    const priceRow = createEl("div", "price-row");
    const finalSpan = createEl("span", "price-final");
    finalSpan.textContent = `₹${finalPrice.toLocaleString("en-IN")}`;
    priceRow.appendChild(finalSpan);
    if (hasDiscount) {
      const orig = createEl("span", "price-original");
      orig.textContent = `₹${Number(p.price).toLocaleString("en-IN")}`;
      priceRow.appendChild(orig);
    }

    const stock = Number(p.stock) || 0;
    const stockP = createEl("p", "stock");
    stockP.classList.add(getStockClass(stock));
    if (stock <= 0) {
      stockP.textContent = "Out of stock";
    } else if (stock <= 5) {
      stockP.textContent = `Only ${stock} left`;
    } else {
      stockP.textContent = `In stock: ${stock}`;
    }

    const colorRow = createEl("div", "color-row");
    const colorLabel = createEl("span");
    colorLabel.textContent = "Colors:";
    colorRow.appendChild(colorLabel);
    const colorsWrap = createEl("div", "color-dots");
    const colors = colorsToArray(p.colors);
    if (!colors.length) {
      const noColor = createEl("span");
      noColor.textContent = "Standard";
      noColor.style.fontSize = "0.8rem";
      noColor.style.color = "#e5e7eb";
      colorsWrap.appendChild(noColor);
    } else {
      colors.forEach((c) => {
        const dot = createEl("span", "color-dot");
        if (c.toLowerCase() === "natural") {
          dot.style.background =
            "linear-gradient(135deg, #fed7aa, #f97316)";
        } else if (c.toLowerCase().includes("neon")) {
          dot.style.background = "linear-gradient(135deg, #a3e635, #22c55e)";
        } else if (c.toLowerCase().includes("grip")) {
          dot.style.background =
            "linear-gradient(135deg, #0ea5e9, #1e3a8a)";
        } else {
          dot.style.backgroundColor = c;
        }
        dot.title = c;
        colorsWrap.appendChild(dot);
      });
    }
    colorRow.appendChild(colorsWrap);

    const actions = createEl("div", "product-actions");
    const qtySelect = createEl("select", "product-qty-select");
    const maxQty = Math.min(stock > 0 ? stock : 1, 10);
    for (let i = 1; i <= maxQty; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = i;
      qtySelect.appendChild(opt);
    }
    const buyBtn = createEl("button", "btn");
    buyBtn.type = "button";
    buyBtn.textContent = "Buy on WhatsApp";
    buyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (stock <= 0) {
        alert("This item is currently out of stock.");
        return;
      }
      const qty = Number(qtySelect.value || 1);
      openWhatsAppForProduct(p, finalPrice, qty);
    });

    actions.appendChild(qtySelect);
    actions.appendChild(buyBtn);

    content.appendChild(imgWrap);
    content.appendChild(titleRow);
    content.appendChild(priceRow);
    content.appendChild(stockP);
    content.appendChild(colorRow);
    content.appendChild(actions);
    card.appendChild(content);
    grid.appendChild(card);
  });
  updateFilterVisibility();
}

// ----- Admin products list -----
function renderAdminProductsList() {
  const list = $("#admin-products-list");
  list.innerHTML = "";
  if (!products.length) {
    const empty = document.createElement("p");
    empty.textContent =
      "No products saved yet. Use the form above to add your first item.";
    list.appendChild(empty);
    return;
  }

  products.forEach((p) => {
    const row = createEl("div", "admin-product-row");
    const main = createEl("div", "admin-product-main");
    const title = document.createElement("strong");
    title.textContent = p.name;
    const meta = document.createElement("span");
    const { finalPrice } = computeFinalPrice(p);
    meta.textContent = `₹${finalPrice.toLocaleString(
      "en-IN"
    )} • Stock: ${p.stock}`;
    main.appendChild(title);
    main.appendChild(meta);

    const actions = createEl("div", "admin-product-actions");
    const editBtn = createEl("button", "btn btn-outline");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      fillProductFormForEdit(p.id);
    });

    const delBtn = createEl("button", "btn btn-danger");
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      if (!confirm(`Delete product "${p.name}"?`)) return;
      products = products.filter((x) => x.id !== p.id);
      saveJSON(STORAGE_KEYS.products, products);
      renderFeaturedCarousel();
      renderFilterBar();
      renderProductsGrid();
      renderAdminProductsList();
      if ($("#product-id").value === p.id) {
        clearProductForm();
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    row.appendChild(main);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

// ----- Product form helpers -----
function clearProductForm() {
  $("#product-id").value = "";
  $("#product-name").value = "";
  $("#product-description").value = "";
  $("#product-price").value = "";
  $("#product-discount").value = "";
  $("#product-stock").value = "";
  $("#product-category").value = "";
  $("#product-subcategory").value = "";
  $("#product-colors").value = "";
  $("#product-image").value = "";
  $("#product-save-btn").textContent = "Save product";
  fillSubcategoryOptions("");
}

function fillSubcategoryOptions(category) {
  const sel = $("#product-subcategory");
  if (!sel) return;
  const subs = (SHOP_CONFIG.categories || {})[category] || {};
  const keys = Object.keys(subs);
  sel.innerHTML = '<option value="">— Select —</option>';
  keys.forEach((sub) => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    sel.appendChild(opt);
  });
}

function fillCategoryOptions() {
  const sel = $("#product-category");
  if (!sel) return;
  const cats = Object.keys(SHOP_CONFIG.categories || {});
  sel.innerHTML = '<option value="">— Select —</option>';
  cats.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", () => {
    fillSubcategoryOptions(sel.value);
  });
}

function fillProductFormForEdit(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  $("#product-id").value = p.id;
  $("#product-name").value = p.name;
  $("#product-description").value = p.description || "";
  $("#product-price").value = p.price;
  $("#product-discount").value = p.discountPercent || 0;
  $("#product-stock").value = p.stock;
  $("#product-category").value = p.category || "";
  fillSubcategoryOptions(p.category || "");
  $("#product-subcategory").value = p.sub_category || "";
  $("#product-colors").value = colorsToArray(p.colors).join(", ");
  $("#product-image").value = p.image || "";
  $("#product-save-btn").textContent = "Update product";
}

function handleProductFormSubmit(event) {
  event.preventDefault();
  const idField = $("#product-id");
  const isEdit = Boolean(idField.value);

  const name = $("#product-name").value.trim();
  const description = $("#product-description").value.trim();
  const price = Number($("#product-price").value || 0);
  const discountPercent = Number($("#product-discount").value || 0);
  const stock = Number($("#product-stock").value || 0);
  const category = ($("#product-category").value || "").trim();
  const sub_category = ($("#product-subcategory").value || "").trim();
  const colorsStr = $("#product-colors").value;
  const image = $("#product-image").value.trim();

  if (!name || price <= 0 || stock < 0) {
    alert("Please fill product name, price (> 0) and stock (>= 0).");
    return;
  }

  const colors = colorsToArray(colorsStr);

  if (isEdit) {
    const existingIndex = products.findIndex((p) => p.id === idField.value);
    if (existingIndex !== -1) {
      products[existingIndex] = {
        ...products[existingIndex],
        name,
        description,
        price,
        discountPercent,
        stock,
        category,
        sub_category,
        colors,
        image
      };
    }
  } else {
    const idBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let id = idBase || "product";
    let counter = 1;
    while (products.some((p) => p.id === id)) {
      id = `${idBase}-${counter++}`;
    }
    products.push({
      id,
      name,
      description,
      price,
      discountPercent,
      stock,
      category,
      sub_category,
      colors,
      image
    });
  }

  saveJSON(STORAGE_KEYS.products, products);
  renderFeaturedCarousel();
  renderFilterBar();
  renderProductsGrid();
  renderAdminProductsList();
  clearProductForm();
}

// ----- Settings form -----
function handleSettingsSubmit(event) {
  event.preventDefault();
  settings.shopName = $("#setting-shop-name").value.trim() || settings.shopName;
  settings.tagline = $("#setting-shop-tagline").value.trim();
  settings.phoneDisplay =
    $("#setting-shop-phone").value.trim() || settings.phoneDisplay;
  settings.timing =
    $("#setting-shop-timing").value.trim() || settings.timing;
  settings.whatsappNumber =
    $("#setting-whatsapp-number").value.trim() || settings.whatsappNumber;
  settings.logoPath =
    $("#setting-logo-path").value.trim() || settings.logoPath;

  saveJSON(STORAGE_KEYS.settings, settings);
  renderSettingsUI();
  alert("Settings saved.");
}

// ----- Tabs -----
function setupTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      document
        .querySelectorAll(".nav-tab")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-panel")
        .forEach((panel) => panel.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`tab-${tab}`).classList.add("active");
    });
  });
}

// ----- Main WhatsApp button -----
function setupMainWhatsAppButton() {
  const btn = document.getElementById("whatsapp-main");
  btn.addEventListener("click", () => {
    const msg = `Hi, I am interested in sports items from ${settings.shopName}. Please share details.`;
    const url = buildWhatsAppUrl(msg);
    if (url !== "#") window.open(url, "_blank");
  });
}

// ----- Theme (dark / light) -----
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const prefersDark = !saved
    ? true
    : saved === "dark";
  if (prefersDark) {
    document.body.classList.remove("theme-light");
  } else {
    document.body.classList.add("theme-light");
  }
}

function toggleTheme() {
  document.body.classList.toggle("theme-light");
  const isLight = document.body.classList.contains("theme-light");
  localStorage.setItem(STORAGE_KEYS.theme, isLight ? "light" : "dark");
}

function setupThemeToggle() {
  initTheme();
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.addEventListener("click", toggleTheme);
}

// ----- Featured carousel -----
let carouselIndex = 0;
let featuredList = [];

function getFeaturedProducts() {
  const ids = (SHOP_CONFIG.featuredIds || []).filter(Boolean);
  if (ids.length) {
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
  }
  return products.slice(0, 4);
}

function renderCarouselSlide(p) {
  const { finalPrice, hasDiscount } = computeFinalPrice(p);
  const slide = createEl("div", "carousel-slide");
  const card = createEl("article", "product-card featured-card");
  card.dataset.productId = p.id;

  const content = createEl("div", "product-content");
  const imgWrap = createEl("div", "product-image-wrapper");
  const img = createEl("img");
  img.src =
    p.image ||
    "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg";
  img.alt = p.name;
  img.loading = "lazy";
  img.decoding = "async";
  imgWrap.appendChild(img);

  const title = createEl("h3", "product-title");
  title.textContent = p.name;
  const priceRow = createEl("div", "price-row");
  const finalSpan = createEl("span", "price-final");
  finalSpan.textContent = `₹${finalPrice.toLocaleString("en-IN")}`;
  priceRow.appendChild(finalSpan);
  if (hasDiscount && p.discountPercent > 0) {
    const badge = createEl("div", "badge-discount");
    badge.textContent = `-${p.discountPercent}% OFF`;
    priceRow.appendChild(badge);
  }

  const buyBtn = createEl("button", "btn");
  buyBtn.type = "button";
  buyBtn.textContent = "Buy Now";
  buyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openWhatsAppForProduct(p, finalPrice, 1);
  });

  content.appendChild(imgWrap);
  content.appendChild(title);
  content.appendChild(priceRow);
  content.appendChild(buyBtn);
  card.appendChild(content);
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".btn")) openProductDetail(p.id);
  });
  slide.appendChild(card);
  return slide;
}

function renderFeaturedCarousel() {
  featuredList = getFeaturedProducts();
  const track = $("#featured-carousel");
  const dotsWrap = $("#carousel-dots");
  if (!track || !dotsWrap) return;

  track.innerHTML = "";
  dotsWrap.innerHTML = "";
  if (!featuredList.length) return;

  featuredList.forEach((p) => track.appendChild(renderCarouselSlide(p)));

  for (let i = 0; i < featuredList.length; i++) {
    const dot = createEl("button", "carousel-dot");
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goCarousel(i));
    dotsWrap.appendChild(dot);
  }

  goCarousel(0);
}

function setupCarouselButtons() {
  document.querySelector(".carousel-btn-prev")?.addEventListener("click", () => goCarousel(carouselIndex - 1));
  document.querySelector(".carousel-btn-next")?.addEventListener("click", () => goCarousel(carouselIndex + 1));
}

function goCarousel(index) {
  if (!featuredList.length) return;
  carouselIndex = (index + featuredList.length) % featuredList.length;
  const track = $("#featured-carousel");
  const dots = document.querySelectorAll("#carousel-dots .carousel-dot");
  if (track) {
    const slide = track.querySelector(".carousel-slide");
    const gap = 16;
    const slideWidth = slide ? slide.offsetWidth + gap : 296;
    track.style.transform = `translateX(-${carouselIndex * slideWidth}px)`;
  }
  if (dots && dots.length) {
    dots.forEach((d, i) => d.classList.toggle("active", i === carouselIndex));
  }
}

// ----- Product detail modal: reviews + related -----
function getReviews(productId) {
  const rev = (SHOP_CONFIG.reviews || {})[productId];
  return Array.isArray(rev) ? rev : [];
}

function getRelatedProducts(currentId, limit = 3) {
  return products.filter((p) => p.id !== currentId).slice(0, limit);
}

function openWhatsAppForProduct(p, finalPrice, qty) {
  if ((Number(p.stock) || 0) <= 0) {
    alert("This item is currently out of stock.");
    return;
  }
  const colors = colorsToArray(p.colors);
  const hasDiscount = (Number(p.discountPercent) || 0) > 0;
  const msgLines = [
    `Hi, I want to buy:`,
    `• Product: ${p.name}`,
    `• Quantity: ${qty}`,
    `• Price: ₹${finalPrice.toLocaleString("en-IN")} (each)`,
    hasDiscount ? `• Discount: ${p.discountPercent}%` : null,
    colors.length ? `• Preferred color: ${colors[0]}` : null,
    "",
    `From: ${settings.shopName}`
  ].filter(Boolean);
  const url = buildWhatsAppUrl(msgLines.join("\n"));
  if (url !== "#") window.open(url, "_blank");
}

function openProductDetail(productId) {
  const p = products.find((x) => x.id === productId);
  if (!p) return;

  const modal = $("#product-modal");
  const body = $("#product-modal-body");
  if (!modal || !body) return;

  const { finalPrice, hasDiscount } = computeFinalPrice(p);
  const reviews = getReviews(p.id);
  const related = getRelatedProducts(p.id, 4);
  const colors = colorsToArray(p.colors);
  const stock = Number(p.stock) || 0;

  const detailImg = p.image || "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg";
  let html = `
    <img class="detail-product-image" src="${detailImg}" alt="${p.name}" loading="lazy" decoding="async">
    <h2 id="modal-title" class="detail-title">${p.name}</h2>
    <div class="detail-meta">
      <span class="price-final">₹${finalPrice.toLocaleString("en-IN")}</span>
      ${hasDiscount ? `<span class="badge-discount">-${p.discountPercent}% OFF</span>` : ""}
      <span>Stock: ${stock <= 0 ? "Out of stock" : stock + " left"}</span>
      ${colors.length ? `<span>Colors: ${colors.join(", ")}</span>` : ""}
    </div>
    ${p.description ? `<p class="product-description">${p.description}</p>` : ""}
    <button type="button" class="btn" id="modal-buy-btn">Buy on WhatsApp</button>
  `;

  html += `<h3 class="reviews-heading">Customer Reviews</h3>`;
  if (!reviews.length) {
    html += `<p class="review-text">No reviews yet. Be the first to review after your purchase!</p>`;
  } else {
    reviews.forEach((r) => {
      const stars = "★".repeat(Number(r.rating) || 5) + "☆".repeat(5 - (Number(r.rating) || 5));
      html += `
        <div class="review-item">
          <span class="review-author">${r.author || "Customer"}</span>
          <div class="review-stars">${stars}</div>
          <p class="review-text">${r.text || ""}</p>
        </div>
      `;
    });
  }

  html += `<h3 class="related-heading">Related Products</h3><div class="related-grid" id="related-grid"></div>`;

  body.innerHTML = html;

  const grid = $("#related-grid");
  if (grid) {
    related.forEach((r) => {
      const { finalPrice: fp } = computeFinalPrice(r);
      const a = createEl("a", "related-card");
      a.href = "#";
      a.dataset.productId = r.id;
      const relImg = r.image || "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg";
      a.innerHTML = `<img src="${relImg}" alt="${r.name}" loading="lazy" decoding="async"><p class="related-name">${r.name}</p><p class="related-price">₹${fp.toLocaleString("en-IN")}</p>`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        closeProductModal();
        openProductDetail(r.id);
      });
      grid.appendChild(a);
    });
  }

  const buyBtn = $("#modal-buy-btn");
  if (buyBtn) {
    buyBtn.addEventListener("click", () => {
      openWhatsAppForProduct(p, finalPrice, 1);
    });
  }

  modal.hidden = false;
  modal.querySelector(".modal-close").focus();
}

function closeProductModal() {
  const modal = $("#product-modal");
  if (modal) modal.hidden = true;
}

function setupProductModal() {
  const modal = $("#product-modal");
  const backdrop = $("#modal-backdrop");
  const closeBtn = $("#modal-close");
  if (backdrop) backdrop.addEventListener("click", closeProductModal);
  if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeProductModal();
  });
}

// ----- Init -----
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year-span").textContent =
    new Date().getFullYear();

  setupRBAC();

  setupThemeToggle();
  setupTabs();
  setupMainWhatsAppButton();
  setupProductModal();

  renderSettingsUI();
  document
    .getElementById("settings-form")
    .addEventListener("submit", handleSettingsSubmit);

  fillCategoryOptions();
  renderFeaturedCarousel();
  setupCarouselButtons();
  renderFilterBar();
  renderProductsGrid();

  if (isAdmin()) {
    renderAdminProductsList();
  }
  document
    .getElementById("product-form")
    .addEventListener("submit", handleProductFormSubmit);
  document
    .getElementById("product-reset-btn")
    .addEventListener("click", clearProductForm);
});

