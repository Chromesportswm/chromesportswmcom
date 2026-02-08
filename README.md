## Chrome Sports W.M – Simple Shop Website

This is a single-page website for your sports shop **Chrome Sports W.M**, built with only **HTML, CSS, and JavaScript**.  
It works in any browser – just open `index.html`.

### 1. How to open the website

- **Option 1 (easiest)**: Right–click `index.html` → “Open with” → choose your browser (Chrome / Edge / etc.).
- **Option 2 (recommended for local testing)**:
  - In VS Code / Cursor, install a “Live Server” extension.
  - Right–click `index.html` → “Open with Live Server”.

> Note: Data (products and settings) is stored in the browser using **localStorage**.  
> This means the data is saved on the machine where you edit it, but not on a remote server database.

### 2. Role-based access (Admin vs Customer)

- **Customers** see only the storefront: featured products, categories, product grid, and Buy on WhatsApp. They cannot see or access any Admin dashboard, Edit, or Delete. Contact details and product images are fixed (set by you).
- **Admin** access is protected by a password. To open the Admin dashboard:
  1. Click **Staff login** in the footer.
  2. Enter the admin password (default in `config.js`: `adminPassword: "chrome-sports-admin"` — change this and keep it private).
  3. The Admin (CRUD) tab appears; you can manage products and shop settings. Session ends when the browser is closed, or click **Log out** in the footer.

### 3. Changing logo, phone, timing, WhatsApp number

You can change these in **two simple ways**:

- **From code (very easy)**:
  - Open `config.js`.
  - Edit:
    - `shopName`
    - `tagline`
    - `phoneDisplay`
    - `timing`
    - `whatsappNumber` (digits only, e.g. `919000000000`)
    - `logoPath` (for example `"logo.png"` or `"images/my-logo.png"`)

- **From the website (Admin tab)**:
  - Open the site in your browser.
  - Click the **“Admin (CRUD)”** tab.
  - In **Shop Settings**, edit:
    - Shop name
    - Tagline
    - Phone number
    - Shop timing
    - WhatsApp number
    - Logo image path
  - Click **Save settings**.  
  - These values are saved in localStorage for that browser.

**To change the logo image file**:

- Place your new logo file in the same folder as `index.html`.
- Example name: `logo.png`
- In `config.js` or in the Admin settings, set `logoPath` to `logo.png`.

### 4. Managing products (CRUD)

Go to the **Admin (CRUD)** tab:

- **Create**:
  - Fill the product form (Name, description, price, discount %, stock, colors, image URL).
  - Click **Save product**.
- **Edit**:
  - In “Current products” list, click **Edit**.
  - The form is filled with product details.
  - Change what you want and click **Update product**.
- **Delete**:
  - Click **Delete** on a product row and confirm.

Fields:

- **Category** & **Sub-category**: choose from the dropdowns (e.g. Cricket → English Willow). Used for the shop filter bar. Add more in `config.js` → `categories`.
- **Price (₹)**, **Discount (%)**, **Stock Qty**, **Color options**, **Image URL** (same as before).

All products are stored in **localStorage** (`chromeSports_products`).

### 4b. Categories and sub-categories

- The **Shop** tab has a filter bar: **Category** (e.g. Cricket, Football, Badminton) and **Sub-category** (e.g. English Willow, Yonex) with professional captions (e.g. “Elite Performance”, “Master the Court”).
- Edit `config.js` → `categories` to add or change categories, sub-categories, and captions.
- When a customer selects a sub-category, only those products are shown with a smooth transition.

### 5. How the “Buy on WhatsApp” button works

- Each product card shows:
  - **Name, description**
  - **Price & discount %**
  - **Stock quantity**
  - **Color options (colored dots)**
  - **Quantity selector**
  - **“Buy on WhatsApp” button**
- When the button is clicked:
  - It opens `https://wa.me/<whatsappNumber>?text=...` in a new tab.
  - Message text includes:
    - Product name
    - Selected quantity
    - Final price
    - Discount (if any)
    - First color (if you set colors)
    - Your shop name

Make sure `whatsappNumber` is set correctly in `config.js` or in the Admin tab.

### 6. Deploying to production (Netlify / Vercel)

- Run **`npm run build`** to generate the **`dist/`** folder.
- **Netlify**: Drag the `dist` folder onto [app.netlify.com](https://app.netlify.com) (or connect your Git repo; set Build command: `npm run build`, Publish directory: `dist`).
- **Vercel**: Connect your repo at [vercel.com](https://vercel.com) or run **`vercel`** in the project folder after `npm run build`.
- See **DEPLOY.md** for step-by-step instructions, optional minification, and image/link checks.

### 7. Notes and next steps

- This project is **frontend only** – no server or database.
- For a real online deployment with many customers, you may later add a backend, database, and authentication for the Admin area.

For now you can edit shop details and products in the browser (localStorage), then deploy the `dist/` folder to Netlify or Vercel.

