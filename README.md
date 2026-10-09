# PrintPay: Coming Soon

The public coming-soon landing page for PrintPay: a single static page built with
React, Vite and Tailwind CSS.

This is a **frontend-only** project. It has no backend, database, authentication
or payment processing, and it never will unless you add them yourself. It builds
to plain static files that any static host can serve.

| | |
|---|---|
| **Install** | `npm install` |
| **Dev server** | `npm run dev`, then open http://localhost:5173 |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Required environment variables** | **None** |
| **Optional environment variable** | `VITE_FORMSPREE_FORM_ID` (see [Contact form](#contact-form-formspree-is-optional)) |
| **Node.js** | 22.x (see `.nvmrc`); Node 20.19+ also works locally |

---

## Contents

1. [Project structure](#project-structure)
2. [Run locally](#run-locally)
3. [Contact form (Formspree is optional)](#contact-form-formspree-is-optional)
4. [Push to GitHub](#push-to-github)
5. [Deploy to Netlify](#deploy-to-netlify)
6. [Deploy to Vercel](#deploy-to-vercel)
7. [Check the live site](#check-the-live-site)
8. [Troubleshooting](#troubleshooting)
9. [Editing content](#editing-content)
10. [Known limitations](#known-limitations)

---

## Project structure

```
printpay-landing/
├── index.html            # HTML shell, page title and meta tags
├── public/
│   ├── printpay-logo.png # logo + favicon (served at /printpay-logo.png)
│   └── robots.txt
├── src/
│   ├── main.tsx          # entry point
│   ├── App.tsx           # the whole page: nav, sections, contact form
│   ├── index.css         # all styling, animations and responsive rules
│   ├── vite-env.d.ts     # types for the optional env variable
│   └── components/error-boundary.tsx
├── vite.config.ts        # standard Vite config (no env vars needed)
├── netlify.toml          # Netlify build settings + headers
├── vercel.json           # Vercel build settings + headers
├── .env.example          # template for the optional Formspree ID
├── .nvmrc                # Node version for Netlify / nvm
├── package.json
└── package-lock.json     # commit this; hosts use it for reproducible installs
```

There is deliberately **no SPA rewrite rule**. The site is one page navigated by
`#anchors`, with no client-side router, so unknown URLs should return a real 404
rather than silently serving the home page.

---

## Run locally

You need [Node.js](https://nodejs.org) 22 (LTS) and npm, which comes with Node.

```bash
# 1. From the project folder, install dependencies
npm install

# 2. Start the dev server (hot reload)
npm run dev
# -> open http://localhost:5173
```

Other commands:

```bash
npm run typecheck   # TypeScript check, no output files
npm run build       # production build into ./dist
npm run preview     # serve ./dist locally at http://localhost:4173
```

To test exactly what will be deployed, run `npm run build` and then
`npm run preview`.

> If you use nvm: run `nvm use` in this folder to pick up `.nvmrc`.

---

## Contact form (Formspree is optional)

The form has **two modes**, chosen at build time by whether
`VITE_FORMSPREE_FORM_ID` is set.

### Mode 1: no form ID (default): email fallback

When the variable is unset or empty, submitting the form opens the visitor's own
email app with a pre-filled message to the address in `src/App.tsx`
(`CONTACT_EMAIL`). The page then shows a notice saying that **nothing has been
submitted from the website yet** and that the visitor must send the email
themselves. It also shows the direct email address in case no email app opens.
It never says the enquiry was sent. This is the honest limit of a `mailto:` link,
because a website cannot know whether the visitor actually sent the email.

### Mode 2: with a Formspree form ID, so the form posts directly

[Formspree](https://formspree.io) receives submissions and emails them to you,
with no server of your own.

1. Create a free account at https://formspree.io and click **New form**.
2. Give it a name and set the recipient email address. Confirm the verification
   email Formspree sends you.
3. Copy the **form ID**: the last part of the endpoint URL.
   ```
   https://formspree.io/f/xyzabcde   ->   form ID is   xyzabcde
   ```
4. Set it as an environment variable named exactly `VITE_FORMSPREE_FORM_ID`:

   - **Locally:** copy `.env.example` to `.env.local` and fill it in:
     ```bash
     cp .env.example .env.local
     # then edit .env.local so it reads:
     # VITE_FORMSPREE_FORM_ID=xyzabcde
     ```
     Restart `npm run dev` afterwards.
   - **Netlify / Vercel:** add it in the dashboard (steps below) and **redeploy**.

5. (Recommended) In Formspree, open the form's **Settings** and add your live
   domain under the allowed-domains option so other sites cannot reuse your form.

How it behaves once configured:

| Situation | What the visitor sees |
|---|---|
| Formspree accepts the submission (HTTP 2xx) | "Your enquiry has been sent…" and the form is cleared. **This is the only case that says "sent".** |
| Formspree rejects it (e.g. invalid email) | Formspree's error message; the form keeps what they typed |
| Server error / network failure / blocked request | "We could not send your enquiry just now… email <address> directly" |
| While waiting for a response | Button is disabled and reads "Sending…"; no result is shown yet |

Good to know:

- The form ID is **public by design**. It ends up in the browser bundle, and
  Formspree intends this. **Never** put a private API key or secret in any
  `VITE_` variable.
- Variables prefixed `VITE_` are baked in **at build time**. Changing the value
  on Netlify or Vercel has **no effect until you redeploy**.
- A hidden honeypot field (`_gotcha`) is included to reduce spam bots.
- You may paste either the bare ID (`xyzabcde`) or the full endpoint URL; both
  work. Anything that is not a valid ID is ignored (a warning is logged in the
  browser console) and the email fallback is used instead.

---

## Push to GitHub

Do this once, from inside the project folder. `node_modules`, `dist` and `.env*`
files are already excluded by `.gitignore`.

1. Create a **new empty repository** on GitHub (no README, no .gitignore, no
   licence), for example `printpay-landing`.
2. Then run:

```bash
git init
git add .
git commit -m "Initial commit: PrintPay landing page"
git branch -M main
git remote add origin https://github.com/<your-username>/printpay-landing.git
git push -u origin main
```

Replace `<your-username>` with your GitHub username (or organisation).

Before you push, confirm that no secrets are staged:

```bash
git status            # .env.local must NOT be listed
git ls-files | grep -E "^\.env" # should print only .env.example
```

---

## Deploy to Netlify

### Option A: Git-connected (recommended)

1. Push the project to GitHub (above).
2. In Netlify: **Add new site → Import an existing project → GitHub**, then
   authorise Netlify and choose your repository.
3. The settings are read from `netlify.toml`. Confirm they show:

   | Setting | Value |
   |---|---|
   | Branch to deploy | `main` |
   | Build command | `npm run build` |
   | Publish directory | `dist` |

   Node version is taken from `.nvmrc` (22).
4. *(Optional)* Add the form ID before the first deploy: **Site configuration →
   Environment variables → Add a variable**, key `VITE_FORMSPREE_FORM_ID`,
   value your form ID.
5. Click **Deploy**. Every later push to `main` redeploys automatically.

**After changing an environment variable:** go to **Deploys → Trigger deploy →
Clear cache and deploy site**.

### Option B: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init                    # link/create the site
netlify deploy --build --prod   # builds with `npm run build`, publishes ./dist
```

### Custom domain

**Domain management → Add a domain** and follow Netlify's DNS instructions.
HTTPS is provisioned automatically.

---

## Deploy to Vercel

### Option A: Git-connected (recommended)

1. Push the project to GitHub (above).
2. In Vercel: **Add New… → Project**, then **Import** your GitHub repository.
3. Vercel detects Vite automatically, and `vercel.json` pins the same values.
   Confirm:

   | Setting | Value |
   |---|---|
   | Framework Preset | `Vite` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | *(leave default)* |
   | Root Directory | `./` |

4. *(Optional)* Expand **Environment Variables** and add `VITE_FORMSPREE_FORM_ID`
   with your form ID (enable it for Production, and Preview if you want).
5. Click **Deploy**. Every later push to `main` redeploys automatically.

**After changing an environment variable:** go to **Deployments**, open the
latest one, **⋯ → Redeploy**. Env changes never apply to existing deployments.

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel          # preview deployment (answer the prompts; accept detected settings)
vercel --prod   # production deployment
```

### Custom domain

**Project → Settings → Domains → Add**, then follow the DNS instructions.

---

## Check the live site

After each deployment, open the live URL and check:

- [ ] The PrintPay logo shows in the header, the footer and the large faded mark
      near the bottom, and the browser-tab icon is the logo.
- [ ] `https://<your-site>/printpay-logo.png` and `/robots.txt` open directly.
- [ ] Desktop: *The Vision*, *How It Works*, *For Merchants*, *Contact* and
      *Get in touch* scroll to the right sections.
- [ ] Phone width: the menu button opens the menu, each link scrolls and closes
      it, and nothing scrolls sideways.
- [ ] "Interested as a Customer?" and "Interested as a Merchant?" scroll to the
      form with the dropdown pre-selected.
- [ ] Submit an empty form: the browser asks you to complete the fields.
- [ ] Submit a real test enquiry:
  - **With** a form ID: you see "Your enquiry has been sent" **and** the email
    arrives in the Formspree recipient inbox. (Always confirm the email
    arrived; that proves the whole chain.)
  - **Without** one: your email app opens pre-filled, and the page says nothing
    has been submitted yet.
- [ ] The page does **not** show any note mentioning `VITE_FORMSPREE_FORM_ID`
      (that hint is for developers and appears only in `npm run dev`).

---

## Troubleshooting

**Build fails with `vite: not found` / `Cannot find module '@vitejs/plugin-react'`**
The host skipped dev dependencies, which happens when `NODE_ENV=production` is
set in the *install* environment. Remove that variable from the site's
environment settings (build tools live in `devDependencies`, as in the standard
Vite template).

**Build fails on an old Node version**
Vite 7 needs Node 20.19+ or 22.12+. Netlify reads `.nvmrc`. On Vercel, set
**Settings → General → Node.js Version** to `22.x` (it also reads `engines` in
`package.json`).

**The form still uses the email fallback after I set the ID**
The variable must be named exactly `VITE_FORMSPREE_FORM_ID` and the site must be
**rebuilt** after you set it (see above). Open the browser console: an invalid
value logs "not a valid Formspree form ID".

**Form shows an error with a form ID set**
Check that the form exists and is verified in Formspree, that your domain is
allowed in its settings, and that you are within its plan's submission limits.

**Fonts look different from the design**
The page loads *DM Sans* and *Manrope* from Google Fonts. If a visitor's network
blocks `fonts.googleapis.com`, the browser falls back to a generic sans-serif.
Layout is unaffected.

**`npm ci` complains the lockfile is out of sync**
Run `npm install` locally, commit the updated `package-lock.json`, and push.

---

## Editing content

All page copy, links, the contact email and the phone number are in
`src/App.tsx`. The email address is the `CONTACT_EMAIL` constant at the top of
the file. Styling and animations are in `src/index.css`. Replace
`public/printpay-logo.png` (keep the filename) to change the logo.

---

## Known limitations

- **Formspree is not live until you configure it.** Until a form ID is set, the
  contact form works only through the visitor's own email app.
- **`mailto:` depends on the visitor's device.** On a device with no email app
  configured, nothing may open; the page tells them the direct address.
- **Phone link:** the number is linked as `tel:09063540737` (local Nigerian
  format) so it dials correctly only from within Nigeria. A link like
  `tel:+2349063540737` would work internationally. This was left as-is to
  preserve the original content.
- **Social-share preview:** `index.html` declares a large-image Twitter/Open
  Graph card but has no `og:image`, so link previews will show text only. Adding
  one needs an absolute image URL, which depends on your final domain.
- **Google Fonts is an external dependency** (see Troubleshooting).
- **Single page only.** Deep links work only to the five in-page anchors.
