# Rentique — Designer Indian Wear & Jewellery on Rent

> A full-stack rental wardrobe for Indian celebrations. Borrow a Sabyasachi lehenga, a Kanjeevaram saree or a kundan set for the days that matter, return it after the function, and keep your security deposit. Built with React, Express and a Cloudinary-backed visual condition lifecycle.

**Live demo:** [rentique-three.vercel.app](https://rentique-three.vercel.app) — the Vercel API is backed by MongoDB Atlas, so accounts, rentals, payments and wallet changes survive serverless cold starts. Every mutation is written through to MongoDB before the API replies.

---

## The idea

Buying occasion wear in India is expensive and one-use. Rentique rents the same pieces at **20% of retail for a three-day tenure**, holds a **refundable security deposit** in the customer's wallet, and settles it back after a visual inspection. Every listing, dispatch, return and dispute is documented with images, so condition is never a matter of opinion.

The storefront is designed as a believable Indian luxury-rental brand: deep plum, burnt saffron, forest green and warm paper, Fraunces display type with Outfit and Tiro Devanagari Hindi accents, arch-framed campaign imagery and Hindi ritual labels.

---

## The catalog

**136 curated pieces across 8 collections**, seeded from structured per-collection files:

| Collection | Pieces | Examples |
| --- | ---: | --- |
| Lehengas | 22 | Bridal, sangeet, mehendi, reception |
| Sarees | 20 | Banarasi, Kanjeevaram, organza, georgette |
| Suits & Anarkalis | 18 | Anarkali, sharara, kurta sets, palazzo |
| Gowns & Dresses | 14 | Evening, cocktail, indo-western |
| Men's Ethnic | 16 | Sherwanis, bandhgalas, kurtas |
| Jewellery | 24 | Kundan, polki, temple, choker sets |
| Bags & Accessories | 10 | Potlis, clutches, minaudières |
| Footwear | 12 | Juttis, mojaris, embroidered heels |

Each product carries 5 listing views (`FRONT`, `BACK`, `SIDE`, `CLOSEUP`, `TAG`), collection, silhouette, colour family, occasion, fabric, sizes, retail price, rating and condition history. The API derives facets — collections, silhouettes, colours, occasions, brands and price bands — from the seed data, so the catalog filters are never hardcoded.

---

## Pricing model

```text
Retail price (MRP)        = 100%
Rental, 3-day tenure      = 20% of MRP  (pro-rata: tenure / 3)
Security deposit          = 30% of MRP  (20% for trusted renters)
Late fee                  = 2% of MRP per day
Customer pays upfront     = rental + deposit
```

**Example — ₹15,000 lehenga, 3 days, trusted renter**

| Line | Amount |
| --- | ---: |
| Rental (20%) | ₹3,000 |
| Refundable deposit (20%) | ₹3,000 |
| Payable now | ₹6,000 |
| Returned after inspection | ₹3,000 |

Deposit settlement options:
- **Rentique wallet** — instant credit, reusable on the next rental.
- **Original payment source** — card / UPI, typically 3–5 working days.

The backend computes all pricing in `backend/services/pricing.service.js`; the product page uses the same formula so the quote and the booking agree.

---

## Checkout, payments and delivery

Every **Rent now** button opens `/checkout/:id` with the selected tenure, size and refund route. The page requests an authoritative quote from `GET /api/rentals/quote`, then collects:

- **Delivery address** — receiver name, 10-digit Indian mobile, address line 1/2, city, state and 6-digit pincode. Signed-in customers get their saved profile address pre-filled.
- **Pincode serviceability** — checked automatically against `GET /api/delivery/serviceability?pincode=…`. A serviceable result fills city/state and shows the area, ETA and COD availability; rejected pincodes block the order.
- **Payment method** — UPI, card or cash on delivery:
  - **UPI** validates `name@handle` format and stores only a masked ID such as `an***@okhdfcbank`.
  - **Card** validates number (Luhn), brand, expiry and CVV in the browser. Only `brand •••• last4` and the cardholder name leave the browser. The API explicitly rejects a payload containing a full card number or CVV.
  - **COD** re-checks pincode eligibility, records the payment as `PENDING`, and fixes the deposit refund to the Rentique wallet because there is no card/UPI source to return to. The customer dashboard shows the amount due and hides the refund-route switch for COD orders.
- **Order summary** — rental fee, loyalty discount, refundable deposit, payable total, size selector and tenure.

`POST /api/rentals` revalidates the address, Indian mobile, pincode serviceability, selected size, UPI format, card metadata and COD eligibility before creating the rental and payment record. This is a clearly labelled **demo gateway**: no real charge is made, and no full card number or CVV is ever accepted or stored.

**Demo pincodes**

| Pincode | Result |
| --- | --- |
| `560038` | Deliverable — Indiranagar, Bengaluru · 1 day · COD available |
| `560034` | Deliverable — Koramangala, Bengaluru · 1 day · COD available |
| `110001` | Deliverable — Connaught Place, New Delhi · 2 days · COD available |
| `400001` | Deliverable — Fort, Mumbai · 2 days · COD available |
| `999999` | **Rejected** — the demo "not serviceable" pincode |
| Any other | Rejected with the covered examples in the message |

**Demo credentials for the gateway:** UPI `ananya@okhdfcbank`; card `4111 1111 1111 1111`, any future `MM/YY`, any 3-digit CVV. The browser strips both down to display-safe metadata before the request.

---

## Data persistence

The deployed API is backed by **MongoDB Atlas** (free M0, AWS Mumbai), so a serverless cold start no longer wipes accounts, rentals, payments or wallet balances.

- **Collections** — `rentique_users`, `rentique_products`, `rentique_rentals`, `rentique_evidence`, `rentique_payments`, `rentique_inspections`, `rentique_penalties`, `rentique_notifications`.
- **Cold start** — connect, seed any empty collection from the shipped catalog seed, then hydrate the in-memory store.
- **Per request** — the store refreshes from MongoDB before the handler runs. Mutations are queued and flushed before the JSON response is sent; if the flush fails the API returns HTTP 503 instead of a false success.
- **Fallback** — with no `MONGODB_URI`, or if Atlas is unreachable, the API serves the seeded in-memory store so local development works offline. `GET /api/health` shows `database.store: "MONGODB"` when persistence is active and `"MEMORY"` otherwise.

Atlas network access allows `0.0.0.0/0` because Vercel's serverless egress IPs are not fixed — an accepted trade-off for a free-tier demo, paired with a dedicated SCRAM user and a single database. Credentials live only in Vercel environment variables and the git-ignored `backend/.env`.

---

## How Cloudinary is used

Cloudinary is the media backend for the entire rental lifecycle — listings, dispatch proof, customer receive evidence, return proof, inspection comparison and the condition timeline. It is not a decorative CDN or a stub. This checkout is wired to cloud `bbdiye5r`; `GET /api/health` reports `cloudinary.configured: true`, and `GET /api/products/facets` reports `deliveryMode: "CLOUDINARY_DELIVERY"` with **546 source-to-delivery mappings**.

```text
ADMIN DISPATCH            DELIVERY                CUSTOMER RECEIVE
Photo record        ──►   Sealed handover   ──►   "Good condition?"
front / back /            with proof               photo or video evidence
side / fabric /                                    if damaged or wrong piece
authentication tag

CUSTOMER RETURN           PICKUP PROOF            ADMIN INSPECTION
Return request      ──►   Partner captures  ──►   Before vs after,
with photos               collection proof        side by side

                          ▼
                 SECURITY DEPOSIT SETTLEMENT
                 deposit − late fee − damage fee
                 → wallet (instant) or original source
```

### 1. Catalog upload: 545 assets, 680 delivery URLs

`backend/scripts/push-to-cloudinary.js` walks the 136-SKU catalogue and uploads each distinct file once:

```text
136 front + 136 back + 136 side + 136 close-up + 1 shared authenticity tag
= 545 catalog assets
```

The script writes `backend/data/mediaOverrides.json` (local path → Cloudinary `secure_url`). `backend/services/media.service.js` resolves every listing through that map before responding, so the API currently serves **680 / 680 listing URLs from `res.cloudinary.com`** with **136 distinct front photographs**. Uploads retry `429`/`5xx` responses with exponential backoff and reuse an existing `public_id` on re-runs, so `npm run media:push` is safe to repeat.

Objects live under `rentique/catalog/<sha1-of-source-path>`; rental evidence lives under `rentique/evidence/...`.

### 2. Delivery: responsive transformation URLs

Both the API and the browser build transformed delivery URLs on demand:

| Surface | Transformation |
| --- | --- |
| Grid thumbnails | `c_fill,g_auto,w_140,h_180,q_auto,f_auto` |
| Catalogue cards | `c_fill,g_auto,w_500,h_650,q_auto,f_auto` |
| Product detail | `c_limit,w_1000,h_1333,q_auto:best,f_auto` |
| Inspection studio | `c_fill,g_auto,w_700,h_900,q_auto,f_auto` |
| Zoom | `c_limit,w_1600,h_2133,q_auto:best,f_auto` |

`f_auto` returns WebP/AVIF where the browser supports it and falls back otherwise; `q_auto` lets Cloudinary pick compression. `g_auto` is deliberately omitted for `c_limit` because Cloudinary rejects that combination with HTTP 400 — `frontend/src/services/cloudinaryUtils.js` centralises the rule so every caller produces a valid URL.

### 3. Evidence: one upload path for the whole lifecycle

Every rental photo or video is uploaded through `POST /api/evidence/upload-file`: Multer keeps the file in memory, `backend/services/cloudinary.service.js` streams it to Cloudinary, and the response stores `publicId`, `secureUrl`, `resourceType`, `format`, `width` and `height` against the rental.

| Lifecycle stage | Endpoint | Captured by | Evidence |
| --- | --- | --- | --- |
| Before dispatch | `POST /api/evidence/:rentalId/before-rental` | Boutique admin | Five guided angles: FRONT, BACK, SIDE, CLOSEUP, TAG |
| Customer receive | `POST /api/evidence/:rentalId/customer-receive` | Customer | `RECEIVED_CORRECTLY`, `DAMAGED`, `DEFECTIVE`, `WRONG_PRODUCT` or `MISSING_ACCESSORY` + photos/videos |
| Return request | `POST /api/evidence/:rentalId/customer-return` | Customer | Five guided angles, including a damage slot |
| Pickup proof | `POST /api/evidence/:rentalId/delivery-pickup` | Logistics partner | Collection-condition media |
| Inspection | `POST /api/inspections/:rentalId` | Boutique admin | Before/after comparison, grade, damage fee and refund settlement |

The admin studio reads the dispatch set and the return set for the same angle, shows the thumbnails side by side, and writes the final grade and ledger. `POST /api/evidence/sign-upload` is also available for direct browser-to-Cloudinary uploads via `uploadDirectToCloudinary`; the server-side buffer upload is the default for the in-app forms. Private damage proof can be served as a time-limited signed URL (`generatePrivateEvidenceUrl`).

Every `INITIAL_STOCK`, `BEFORE_RENTAL`, `RETURNED`, `INSPECTED` and `REPAIRED` event stores its Cloudinary references in the product's condition history, which is what powers `/product/timeline-preview`.

### 4. What is live right now

| Check | Result |
| --- | --- |
| Cloud | `bbdiye5r` |
| API health | `cloudinary.configured: true` |
| Delivery mode | `CLOUDINARY_DELIVERY` |
| Source-to-URL mappings | 546 (545 catalog + 1 return-condition proof) |
| Listing URL coverage | 680 / 680 on `res.cloudinary.com` |
| Distinct front photographs | 136 |
| `npm run media:check` | `Cloudinary OK — cloud "bbdiye5r" (ok).` |

### 5. Activation, fallback and secrets

```bash
cd backend
npm run media:setup   # prompts locally; writes backend/.env with mode 600
npm run media:check   # pings the Cloudinary API
npm run media:push    # uploads the catalogue once and writes the override map
```

Restart the backend after pushing. `setup-cloudinary.js` removes existing `CLOUDINARY_*` keys, never echoes secrets, validates the credentials with `cloudinary.api.ping()`, and supports either the three dashboard values or a single `CLOUDINARY_URL`.

The app stays runnable without credentials: `cloudinary.service.js` treats the exact demo placeholders as unconfigured, and the storefront then serves the local JPEG masters in `frontend/public/media/`. `.env` is git-ignored, `.env.example` contains placeholders only, and the Cloudinary API secret never reaches the browser. The health, facets and delivery-mode fields above let a reviewer confirm which mode is active without logging into Cloudinary.

### Media in the demo

Every SKU has a dedicated image set under `frontend/public/media/products/<id>-<view>.jpg`. The catalogue uses **136 distinct source photographs** of real models and products, curated from [Pexels](https://www.pexels.com/license/) so the garment type, colour and silhouette match the listing. Each source is cropped locally with Pillow into five derivatives:

- **front** — full-length listing photograph
- **closeup** — fabric and embroidery crop
- **back / side** — additional crops kept for internal condition records
- **tag** — the shared Rentique authenticity card

No source photograph is reused across SKUs; the authenticity tag is the only shared asset, and it is deliberately identical on every piece. A SHA-256 audit of all 136 front, closeup, side and back files returns zero duplicates, and every listing reports `mediaStatus: 'OWN'`.

The homepage hero and occasion cards use separate campaign photography from Wikimedia Commons. Files live in `frontend/public/media/editorial/`.

- Hero and Mehendi/Sangeet/Cocktail/Wedding campaign frames — [Rianta's](https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Rianta%27s%20lehenga) bridal lookbook, **CC0**.
- Festive card — [*Indian Bride 2*](https://commons.wikimedia.org/wiki/File:Indian_Bride_2.jpg), Naveen Kadam, **CC BY 2.0**.

`backend/scripts/generate-product-images.js` remains available as a fallback for local databases with no media, but the shipped catalogue does not depend on it. Listings without their own photographs borrow a view set from an owned sibling in the same subcategory, and the API exposes `mediaStatus: 'OWN' | 'CATEGORY'` so the UI can badge the difference.

The local masters are kept in the repository only as an offline fallback. The demo is already wired to Cloudinary, so the storefront, evidence flows and timelines serve transformed `res.cloudinary.com` URLs; if credentials are removed, delivery falls back to these files and the API reports a non-Cloudinary mode. Setup, verification and push commands live in [Activation, fallback and secrets](#5-activation-fallback-and-secrets).

---

## Screenshots and demo media

Every screenshot below was captured against the running demo with Cloudinary live. Catalog photography, dispatch proof, return proof and timeline thumbnails are all delivered from `res.cloudinary.com`; the uploads in the receive and return flows go through Cloudinary as well.

### Catalog — Cloudinary-transformed cards and URL-driven filters

![Catalog with collection filters, Cloudinary image cards and 16 of 16 transformed images loaded](docs/screenshots/catalog.png)

Eight lehengas under the active filters, each card rendered from a `c_fill,g_auto,w_500,h_650,q_auto,f_auto` delivery URL. The counter reports **16/16 images from Cloudinary**, zero broken, and the filter rail narrows the 136-SKU catalog by collection, silhouette, budget, colour, occasion, wearer and designer.

### Before-rental evidence — five guided angles for one product

![Boutique dispatch evidence with FRONT, BACK, SIDE, CLOSEUP and TAG angles for RNT-1023](docs/screenshots/before-rental-evidence.png)

The boutique locks a dispatch record for RNT-1023 with a **five-angle Cloudinary set** — FRONT, BACK, SIDE, CLOSEUP and the shared authenticity TAG — before the piece leaves the studio. This is the baseline the inspection studio later compares the return against.

### Receive check — issue types plus photo and video proof

![Customer receive verification with condition issue types and Cloudinary upload controls](docs/screenshots/receive-check.png)

The customer confirms the sealed handover. If something is wrong they pick `DAMAGED`, `DEFECTIVE`, `WRONG_PRODUCT` or `MISSING_ACCESSORY` and attach photos or video. The preview shown here was uploaded through `POST /api/evidence/upload-file` and stored on Cloudinary before the rental record was updated.

### Inspection — before and after, side by side

![Inspection studio comparing a clean dispatch closeup with a stained return closeup, grading Minor Damage and settling ₹5,100](docs/screenshots/inspection.png)

The admin studio pairs the dispatch closeup with the return closeup for the same angle. The return closeup (`rentique/evidence/rnt1023_return_closeup`) is Cloudinary-hosted damage proof; the grade is **Minor Damage** and the ledger updates live.

### Refund — deposit settlement

![Refund ledger showing ₹6,000 deposit minus ₹400 late fee minus ₹500 damage fee equals ₹5,100 refund](docs/screenshots/refund.png)

The settlement reads straight from the inspection: **₹6,000 deposit − ₹400 late fee − ₹500 damage fee = ₹5,100 refund**, credited to the wallet instantly or routed back to the original payment source.

### Condition timeline — the visual history across rentals

![Product condition timeline with four stages and nine Cloudinary evidence thumbnails](docs/screenshots/condition-timeline.png)

`/product/timeline-preview` assembles the product's `INITIAL_STOCK`, `BEFORE_RENTAL`, `RETURNED` and `INSPECTED` events into one visual history — **four stages, nine Cloudinary thumbnails**, including the five-angle dispatch set and the stained return closeup.

---

## Features

- **Storefront** — asymmetric arch hero, five-occasion celebration rail (weddings, festivals, sangeet, mehendi, cocktails), 8 collection cards, curated edits, deposit explainer with wallet mock, three-view inspection panel, testimonials, seller CTA, newsletter footer.
- **Catalog** — URL-driven filters (collection, silhouette, budget, colour, occasion, wearer, designer, search), live facets and counts, sticky collection rail, active filter chips, mobile drawer.
- **Product page** — front/fabric/tag gallery with zoom, pro-rata tenure selector (3/7/10 days), size selector, wallet vs original-source refund choice, transparent payable summary, condition timeline, Cloudinary media record, related pieces, mobile sticky booking bar.
- **Checkout & payments** — full delivery-address form, debounced pincode serviceability with demo accept/reject pincodes, UPI/card/COD demo gateway, masked payment metadata, COD pending status, and a confirmation with rental number, ETA, payment state and refund route.
- **Dashes for all personas** — customer wardrobe/wallet/trust score, delivery pickup portal with return proof capture, boutique studio with inspection queue and condition grading.
- **Trust & loyalty** — clean returns raise the score; ≥90 unlocks the 20% deposit rate; Silver/Gold/Platinum loyalty discounts.

---

## Tech stack

- **Frontend** — React 18, React Router 6, Vite 6, Tailwind CSS 3, Lucide React, Axios.
- **Backend** — Node.js, Express 4, MongoDB Atlas (Mongoose connection plus native-driver collections) with a seeded in-memory `MemoryDataStore` fallback, JWT auth, bcrypt, RBAC.
- **Media** — Cloudinary SDK v2 (catalog upload, evidence pipeline, transformed delivery), Multer memory uploads, Pillow/`sips` view derivation.
- **Design** — Fraunces, Outfit, Tiro Devanagari Hindi; custom Tailwind palette and component classes (`bg-paper`, `text-plum`, `btn-primary`, `eyebrow`, `arch-frame`, `jaali-pattern`).

---

## Run locally

```bash
# terminal 1
cd backend
npm install
npm start          # http://localhost:5001

# terminal 2
cd frontend
npm install
npm run dev        # http://localhost:3000 (proxies /api → :5001)
```

Create `backend/.env`:

```env
PORT=5001
JWT_SECRET=change-me
MONGODB_URI=mongodb://127.0.0.1:27017/fashion_rental
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# or the single dashboard value: CLOUDINARY_URL=cloudinary://key:secret@cloud
```

`MONGODB_URI` is optional locally; without it, or if Mongo is unreachable, the API falls back to the seeded in-memory store and data resets on restart. The deployed demo sets `MONGODB_URI` to MongoDB Atlas, and `GET /api/health` reports `database.store: "MONGODB"` in that mode. Never commit real Cloudinary, MongoDB or JWT secrets.

---

## Demo personas

Use the **Demo: Customer** dropdown in the announcement bar, the first-load persona modal, or `/login`:

- **Customer — Ananya Sharma** — browse, book with a tenure, receive verification, request a return, watch the deposit settle.
- **Boutique — Pooja Mehta** — catalog metrics, pending visual inspection queue, condition grading, add a product.
- **Logistics — Vikram Rathore** — assigned pickups and dispatch jobs, upload return condition proof.

All three are one-click demo accounts; no password required.

---

## Verify

```bash
node backend/test-suite.js
cd backend && npm run media:check   # pings Cloudinary with the configured credentials
```

Covers pricing (pro-rata, deposits, late fees), auth/RBAC, catalog filtering, booking, receive verification, returns, inspection and wallet refunds. The media check confirms the Cloudinary cloud is reachable and the credentials are valid.

Check pincode coverage without signing in:

```bash
curl -s "http://localhost:5001/api/delivery/serviceability?pincode=560038"  # serviceable: true
curl -s "http://localhost:5001/api/delivery/serviceability?pincode=999999"  # serviceable: false
```

---

## Project map

```text
backend/
  data/products/          per-collection seed files + price/image helper
  data/seedData.js        users, rentals, evidence, payments
  data/mediaOverrides.json  local path → Cloudinary secure_url map
  data/store.js           in-memory store + facets; mutations queue MongoDB writes
  data/persistence.js     Atlas seed, hydrate, per-request refresh, write-through flush
  services/pricing.service.js
  services/serviceability.service.js  demo pincode coverage, ETA and COD rules
  services/media.service.js      resolves listings and evidence through Cloudinary
  services/cloudinary.service.js upload, signing, private evidence URLs
  scripts/setup-cloudinary.js    interactive credential setup
  scripts/check-cloudinary.js    API ping behind `npm run media:check`
  scripts/push-to-cloudinary.js  uploads catalog assets, writes overrides
  controllers/ routes/ middleware/
frontend/
  public/media/products/  locally generated front + fabric crops (136 SKUs)
  public/media/evidence/  local masters for return-condition proof
  public/media/brand/     logo and shared authenticity card
  src/components/         navbar, footer, logo, product cards, gallery, timeline, modals
  src/pages/              home, catalog, product detail, checkout, dashboards, login
  src/services/cloudinaryUtils.js
  tailwind.config.js
docs/screenshots/         flow screenshots embedded in this README
```

---

© 2026 Rentique. A hackathon demo built for Indian celebrations.
