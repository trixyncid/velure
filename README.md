# Velure

Storefront and CMS for **Velure Perfume — The Midnight Collection**.

- **Landing page** (`/id`, `/en`): a cinematic, scroll-scrubbed film that hands off to a shop. Every product shown comes from the CMS. Orders are sent through WhatsApp.
- **Admin dashboard** (`/admin`): manage perfumes, scents, testimonials and admin users.

> This project runs **Next.js 16.3.8**, which has breaking changes from older versions. Read the guides in `node_modules/next/dist/docs/` before changing framework-level code (see `AGENTS.md`).

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon) via Prisma 7 (`@prisma/adapter-pg`), client generated to `generated/prisma` |
| Auth | better-auth with an admin role |
| Media | DigitalOcean Spaces (S3 API) for perfume images |
| Landing film | three.js, @react-three/fiber, postprocessing, GSAP ScrollTrigger, Lenis, zustand |
| Package manager | bun 1.3 |

## Getting started

```bash
bun install
cp .env.example .env.local   # then fill it in (see below)
bun run db:migrate           # apply migrations to your database
bun run auth:admin           # create the first admin user
bun run dev                  # http://localhost:3000
```

`/` redirects to the visitor's saved language, Indonesian by default (`/id`). The admin login is at `/admin/login`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string used by Prisma |
| `BETTER_AUTH_SECRET` | yes | Auth secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | yes | Public URL of the app, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | production | Public origin for canonical URLs, Open Graph and structured data. Falls back to `BETTER_AUTH_URL` |
| `ADMIN_USER_IDS` | no | Comma-separated user ids always treated as admins |
| `SPACES_KEY`, `SPACES_SECRET`, `SPACES_BUCKET`, `SPACES_REGION` | yes (for image upload) | DigitalOcean Spaces credentials; region is the datacenter, e.g. `sgp1` |
| `SPACES_ENDPOINT` | no | Defaults to `https://<SPACES_REGION>.digitaloceanspaces.com` |
| `SPACES_CDN_ENDPOINT` | no | CDN origin for images |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | Number that receives orders, digits only in international format |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | no | Free-shipping threshold in whole Rupiah (default `500000`) |

### Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Development server |
| `bun run build` | Generates the Prisma client, then builds for production |
| `bun run start` | Serves the production build |
| `bun run lint` | ESLint |
| `bun run db:generate` | Regenerates the Prisma client (`prisma7.config.ts`) |
| `bun run db:migrate` | Creates/applies migrations in development (`prisma migrate dev`) |
| `bun run auth:generate` | Regenerates the better-auth schema |
| `bun run auth:admin` | Creates an admin user |

To apply existing migrations to a deployed database without creating new ones:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

After any schema change, **restart the dev server**. A running server keeps the old Prisma client and the catalog fails until it restarts.

## Project structure

```
app/
  [lang]/            Landing page (id, en): layout, page, Open Graph image, landing.css
  admin/             Admin login and dashboard: perfumes, scent, testimonials, users
  api/               better-auth handler and admin media upload
components/
  landing/           Landing page client components
    three/           Footage canvas: film surface, night sky, effects
    sections/        Hero, BrandStory, Craft, Collection, Assurance, ScentFinder, Outro, Footer
    shop/            ProductCard, ProductDetail, ProductPanel (product dialog)
    order/           CartDrawer, CheckoutForm, QuantityStepper
  admin/             Admin UI (shell, fragrance editor, scent manager, toasts)
  commerce.tsx       Cart state and checkout panel (shared)
config/
  landing-content.ts All landing copy, Indonesian and English
  perfume-themes.ts  Visual themes per perfume
lib/
  landing/           Film timeline, footage loader, scroll, scent finder, product mapping
  i18n/              Locales and dictionaries
  store.ts           Storefront catalog query
  perfumes.ts        Admin perfume queries
  scent.ts           Scent list queries
  whatsapp.ts        Order reference and WhatsApp message builder
  site.ts            Public origin and absolute URLs
prisma/              Schema and migrations
public/landing/film/ Pre-extracted film frames (WebP)
proxy.ts             Language redirect and admin route guard
```

## Landing page

The page plays as one continuous film driven by scroll, then turns into a regular shop.

1. **Hero** – moonlit mist over water.
2. **Story** – the bottle rises from the mist.
3. **Craft** – three steps shown over the droplet, fill and seven-bottle clips.
4. **Shop** – Collection, Assurance and the Scent Finder, all CMS-driven.
5. **Outro** – testimonials, FAQ, closing call to action and footer.

### How the film works

- Each clip is pre-extracted into numbered WebP frames at `public/landing/film/<clip>/<hd|sd>/NNN.webp` (`moon`, `bottle`, `drops`, `fill`, `seven`). Phones, low-end devices and Save-Data visitors get the `sd` set.
- Scroll position maps to a film time (`film.T` = chapter index + progress). `lib/landing/footage.ts` defines clip frame counts, chapter beats and the scroll window in which each clip is fetched, so frames load only when they are about to be needed.
- Frames are decoded ahead of time into `ImageBitmap`s and drawn as textured planes in a React Three Fiber canvas with a sharpening shader and blending between neighbouring frames.
- Once the shop is reached, the canvas stops rendering and the page behaves like a normal site.
- Visitors with reduced motion or without WebGL get a still version.
- Frames are served with a 30-day cache header (`next.config.ts`).

### Deep links

`/id?product=<slug>` skips the film, jumps to the collection and opens that perfume. `/?product=<slug>` keeps the query through the language redirect, which is useful for ads.

### Ordering

The cart collects items and the checkout form collects name, city and note. The order is sent as a pre-filled WhatsApp message to `NEXT_PUBLIC_WHATSAPP_NUMBER` with an order reference. There is no online payment.

## Admin dashboard

| Page | Purpose |
| --- | --- |
| **Perfumes** | Name, descriptions, price, discount, stock, gender, images, best-seller flag, reviews, plus the scent profile: scents, scent summary ("Karakter Aroma") and top/middle/base notes |
| **Scents** | The list of scents visitors can pick in the Scent Finder. Add, rename (Indonesian/English), reorder and delete |
| **Testimonials** | Testimonials shown in the outro |
| **Users** | Admin users |

Admin changes revalidate the landing page, so they appear without a redeploy.

### Scent Finder matching

1. The visitor picks who the scent is for (men, women or both) and then the scents they like.
2. Only perfumes for that gender, or Unisex, are considered. "Both" considers all of them.
3. The perfume that has the most of the picked scents wins. Ties go to a perfume made exactly for the choice over a Unisex one, then to the order in the shop.
4. The result shows which picks matched, e.g. "Cocok dengan pilihan Anda: Vanilla, Kopi (2 dari 2)". A second suggestion is shown when it is at most one matched scent behind.

The finder only offers scents that at least one perfume has, so **tick scents on each perfume** for the finder to work. With none ticked, it only asks who the scent is for.

## Content rules

- All product content (names, descriptions, notes, character, size, price, stock, images) comes from the CMS. Never hardcode it in components.
- Landing copy lives in `config/landing-content.ts`, in both languages.
- Scent notes describe how a perfume smells, not what it is made of. Do not name or imply ingredients, suppliers, origins, grades, concentrations, ratios or process steps beyond the three published craft steps.
- Do not add claims such as "natural", "organic", "halal", "imported" or "long-lasting" unless the client provides them.

## Deployment notes

- Set `NEXT_PUBLIC_SITE_URL` in production.
- Run `prisma migrate deploy` against the production database before deploying a build that includes new migrations.
- The film frames (`public/landing/film`, about 67 MB) are committed with the app. Consider moving them to the Spaces CDN if repository size becomes a problem.
