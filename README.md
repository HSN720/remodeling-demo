# Aldermere — Production Build

This folder is a **completely self-contained static website**. It has no build
step and no runtime dependency on the development source or any external CDN —
fonts, the animation library, and all photography are bundled locally.

Just upload the **contents of this folder** to any static host and it works.

## What's inside

| Path | Contents |
|------|----------|
| `*.html`        | Every page (home, services, 5 service pages, portfolio, 6 case studies, blog, contact, faq, 404) |
| `css/`          | Site styles (`styles.css`, `pages.css`) |
| `js/`           | Site scripts (`site.js`, `main.js`, `split-scroll.js`, `hero-hotspots.js`) |
| `assets/vendor/`| GSAP + ScrollTrigger (self-hosted) |
| `fonts/`        | Self-hosted web fonts + `fonts.css` |
| `images/`       | Localized stock photography + Open Graph image |
| `videos/`       | Scroll-scrubbed hero videos |
| `icons/`        | `favicon.svg` |
| `public/`       | All project/portfolio/service imagery referenced by the pages |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | SEO + PWA metadata |
| `404.html`      | Custom not-found page |
| `vercel.json`, `netlify.toml`, `_redirects`, `.htaccess`, `nginx.conf` | Per-host routing/caching |

> **Set your domain:** search-and-replace `https://www.aldermere.com` in `sitemap.xml`,
> `robots.txt`, and the `<link rel="canonical">` tags with your real domain,
> or re-run the build with `SITE_URL=https://yourdomain.com bash build-hosting.sh`.
>
> Absolute asset paths (`/images/...`) assume the site is served from a domain
> **root** (true for all hosts below). For a sub-path deployment, host at root
> or convert those to relative paths.

---

## Deploy

### 1) Vercel
- **Dashboard:** New Project → Import → set **Framework Preset = Other**,
  **Root Directory = this folder**, no build command, **Output = ./**. Deploy.
- **CLI:** `npm i -g vercel` then, inside this folder, `vercel --prod`.
- `vercel.json` sets caching and keeps `.html` URLs; `404.html` is served automatically.

### 2) Netlify
- **Drag & drop:** app.netlify.com → **Add new site → Deploy manually** → drag
  this whole folder onto the drop zone.
- **CLI:** `npm i -g netlify-cli` then `netlify deploy --prod --dir .`
- `netlify.toml` / `_redirects` handle the 404 and caching.

### 3) Hostinger
- hPanel → **File Manager** → open `public_html`.
- Upload this folder's **contents** (not the folder itself) into `public_html`
  — or upload a ZIP and **Extract** there. Ensure `index.html` sits directly in
  `public_html`. The included `.htaccess` enables the 404 page and caching.

### 4) cPanel shared hosting
- cPanel → **File Manager** → `public_html`.
- Upload + **Extract** a ZIP of this folder's contents so `index.html` is at the
  root of `public_html`. `.htaccess` is picked up automatically (Apache).
- No database, PHP, or Node required.

### 5) VPS / Nginx
```bash
# copy the build to the server
scp -r ./ user@your-server:/var/www/aldermere

# install the server block
sudo cp /var/www/aldermere/nginx.conf /etc/nginx/sites-available/aldermere
sudo ln -s /etc/nginx/sites-available/aldermere /etc/nginx/sites-enabled/
# edit server_name + root in that file, then:
sudo nginx -t && sudo systemctl reload nginx
```
Add HTTPS with `sudo certbot --nginx`.

---

## Rebuilding
From the project source, run:
```bash
bash build-hosting.sh
# or with your domain baked in:
SITE_URL=https://yourdomain.com bash build-hosting.sh
```
This regenerates `/hosting-build` from scratch.

## Note on file size
The bundled photography/video is large (the portfolio & service PNGs are
high-resolution). For faster loads, consider compressing `public/` and
`images/` to WebP before going live.
