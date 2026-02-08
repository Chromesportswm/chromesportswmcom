/**
 * Production build: copies site files into dist/ for Netlify/Vercel.
 * Run: npm run build
 * Optional: minify JS/CSS with npx (see DEPLOY.md).
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

const FILES = [
  "index.html",
  "styles.css",
  "config.js",
  "app.js",
  "404.html"
];

const ASSETS = ["logo.png", "LOGO.png.png"];

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

FILES.forEach((file) => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, file));
    console.log("Copied:", file);
  }
});

ASSETS.forEach((file) => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, file));
    console.log("Copied:", file);
  }
});

console.log("Build complete. Output: dist/");
