# Deploy Chrome Sports W.M to Netlify or Vercel

## Prepare for production

- **Images**: Product images use URLs (e.g. Pexels). For your own images, use WebP or JPEG with sensible dimensions (e.g. 800px wide) and put them in the project folder so they are copied to `dist/` by the build.
- **Logo**: Place your logo as `logo.png` in the project root (or set the path in Admin → Shop Settings). It is copied to `dist/` during build.
- **Broken links**: The site has no internal broken links. After deployment, you can check the live URL with [W3C Link Checker](https://validator.w3.org/checklink) or [broken-link-checker](https://www.npmjs.com/package/broken-link-checker) (`npx broken-link-checker https://your-site.netlify.app`).

### Optional: minify JS/CSS

The default build only copies files. To minify for production (smaller load):

```bash
# One-time install (optional)
npm install -D terser clean-css

# Then in build.js you can add minification, or run manually:
npx terser app.js -c -m -o dist/app.js
npx cleancss -o dist/styles.css styles.css
```

You can extend `build.js` to run these after copying if the packages are installed.

---

## Deploy to Netlify

### Option A: Drag and drop (no Git)

1. Build the site. In the project folder run:
   ```bash
   npm run build
   ```
   If you don’t have Node/npm, create a folder and copy these files into it: `index.html`, `styles.css`, `config.js`, `app.js`, `404.html`, and your `logo.png` (if you use one). Use that folder in step 3 instead of `dist`.
2. Go to [app.netlify.com](https://app.netlify.com) and sign in.
3. Drag the **`dist`** folder (or your copied folder) onto the “Deploy manually” drop zone.
4. Netlify will give you a live URL (e.g. `random-name-123.netlify.app`). You can change it in **Site settings → Domain management**.

### Option B: Deploy with Git

1. Push your project to GitHub, GitLab, or Bitbucket.
2. In Netlify: **Add new site → Import an existing project** and connect the repo.
3. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site**. Netlify will build and publish on every push.

The repo root must contain `package.json` and `build.js`; Netlify runs `npm run build` and publishes the `dist` folder (see `netlify.toml`).

---

## Deploy to Vercel

### Option A: Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. In the project folder, run a build then deploy:
   ```bash
   npm run build
   vercel
   ```
3. Follow the prompts. Your site will be at a `*.vercel.app` URL.

### Option B: Deploy with Git

1. Push your project to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and **Add New Project**.
3. Import the repo. Vercel will detect the build from `vercel.json`:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Deploy. Every push to the main branch will trigger a new deployment.

---

## After deployment

- Set your **custom domain** in Netlify or Vercel (Site settings / Domains).
- Update **Shop Settings** in the site’s Admin tab: WhatsApp number, phone, timing, logo path. These are stored in the browser’s localStorage, so you may want to set them once from the device you use most.
- If you use a **favicon**, add a `favicon.ico` in the project root and include it in the files copied to `dist/` in `build.js`.
