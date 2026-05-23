# More Than Food website

The website for More Than Food, rebuilt to move off Wix. It is a static
[Astro](https://astro.build) site styled with Tailwind CSS, designed to be
hosted on Cloudflare Pages. The contact and donation forms are handled by a
Cloudflare Pages Function that emails submissions through Resend.

---

## Quick reference

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 18 or newer (20+ recommended) |
| Production domain | `wearemorethanfood.com` |
| Form delivery | Resend API to `wearemorethanfood@gmail.com` |

---

## What is in this project

```
morethanfood-website/
  src/
    pages/          The 5 pages: index, about, service-in-action, donate, contact
    layouts/        Shared page shell (head, header, nav, footer)
    components/     Reusable pieces (section headings, etc.)
    assets/images/  Source photos, optimized automatically at build time
    styles/         Global CSS and the Tailwind layer
  functions/
    api/submit.js   Cloudflare Pages Function that handles both forms
  public/           Files copied as-is: favicon, og-image, robots.txt, _redirects
  scripts/          One-off image utilities (see "Image scripts" below)
  astro.config.mjs  Site URL, integrations, image settings
```

The five pages map to clean URLs: `/`, `/about`, `/service-in-action`,
`/donate`, `/contact`.

---

## Running it locally

You need Node.js installed. Then, from the project folder:

```bash
npm install      # first time only
npm run dev      # starts a local server, usually http://localhost:4321
```

To produce the exact files that get deployed:

```bash
npm run build    # writes the finished site into dist/
npm run preview  # serves the built dist/ folder so you can check it
```

---

## Deploying to Cloudflare Pages

You deploy this once. After that, every time you push a change the site
updates on its own.

### 1. Put the code in a Git repository

Cloudflare Pages deploys from GitHub or GitLab. Create a new repository
(it can be private) and push this project folder to it. Do not commit the
`node_modules` or `dist` folders; the included `.gitignore` already excludes
them.

### 2. Create the Pages project

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages**, then **Create**, then the **Pages** tab.
3. Choose **Connect to Git** and select the repository you just created.
4. On the build settings screen, enter:
   - Framework preset: **Astro**
   - Build command: **`npm run build`**
   - Build output directory: **`dist`**
5. Click **Save and Deploy**.

The first build takes a few minutes. When it finishes you get a temporary
address like `morethanfood-website.pages.dev` so you can preview everything
before pointing the real domain at it.

### 3. Add the Resend environment variables

The forms will not send email until these are set. In your Pages project,
go to **Settings**, then **Environment variables**, and add the following
three variables to **Production** (and to **Preview** if you want the
preview builds to send mail too):

| Variable | What to put |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (starts with `re_`) |
| `TO_EMAIL` | `wearemorethanfood@gmail.com` |
| `FROM_EMAIL` | `More Than Food <forms@wearemorethanfood.com>` |

After adding or changing environment variables, trigger a fresh deploy
(**Deployments**, then **Retry deployment** on the latest one) so the
function picks them up.

A note on `FROM_EMAIL`: Resend will only send from a domain you have
verified (see the next section). Until the domain is verified, you can
temporarily set `FROM_EMAIL` to `More Than Food <onboarding@resend.dev>`,
which Resend allows for testing. Switch it to the real address once the
domain is verified.

### 4. Verify the domain in Resend

So that emails come from `@wearemorethanfood.com` and land in the inbox
rather than spam:

1. In the [Resend dashboard](https://resend.com), open **Domains** and add
   `wearemorethanfood.com`.
2. Resend shows a set of DNS records (DKIM, SPF, and similar).
3. Add those records in Cloudflare under your domain's **DNS** settings.
4. Back in Resend, wait for the domain to show as **Verified**.

Then create the API key under **API Keys** and use it for `RESEND_API_KEY`.

### 5. Point the domain at Cloudflare Pages

In the Pages project, go to **Custom domains** and add both
`wearemorethanfood.com` and `www.wearemorethanfood.com`. If the domain's DNS
is already managed by Cloudflare, this is automatic. If the domain is still
registered or managed elsewhere, Cloudflare will show you the DNS records to
add, or you can move the domain into Cloudflare first.

Once the custom domain is active, the `.pages.dev` address keeps working as
a backup but the real site is live at `wearemorethanfood.com`.

---

## How the forms work

Both the contact form and the donation form submit to a single endpoint,
`/api/submit`, which is the file `functions/api/submit.js`. Cloudflare runs
that file automatically as part of the same deployment; there is nothing
separate to configure.

The function decides which form was sent using a hidden `form_type` field,
validates the input, builds a tidy HTML email, and sends it through Resend
to `TO_EMAIL`. The reply-to address is set to whoever submitted the form, so
you can reply straight from Gmail.

There is also a hidden honeypot field named `company`. Real visitors never
see or fill it; spam bots usually do. If it is filled in, the function
quietly discards the submission.

If `RESEND_API_KEY` is missing, the form shows a friendly message asking the
visitor to email `wearemorethanfood@gmail.com` directly, so the site never
looks broken.

### Donations

The donation form currently records a donor's intent to give and emails you
the details. Money still moves through Venmo, as it does today. When you are
ready to take card payments directly, Stripe can be added later without
changing the rest of the site.

---

## Old Wix links

The file `public/_redirects` forwards old Wix URLs (such as `/our-story`,
`/gallery`, `/get-involved`) to the matching new pages, so existing links
and search results do not break. The hidden Wix pages that were dropped
(the London page and the unused demo store) redirect to the homepage.

---

## Image scripts

The `scripts/` folder holds two small helper scripts. They were already run
to prepare the current images and you normally will not need them again.

- `gen-assets.mjs` regenerates the favicon PNGs and the social-share image
  (`og-image.jpg`). Run it again if the logo or share image changes:
  `node scripts/gen-assets.mjs`.
- `fix-orientation.mjs` corrects sideways photos. Phone photos often carry a
  rotation tag that some tools ignore; this bakes the correct rotation into
  the file. If you add new photos that appear rotated, drop them into
  `src/assets/images/` and run `node scripts/fix-orientation.mjs`.

Every photo placed in `src/assets/images/` is automatically resized and
converted to modern formats during the build, so you can add full-resolution
photos without worrying about file size.

---

## Updating content

Page text lives in the `.astro` files inside `src/pages/`. Editing the text
there and pushing the change to Git is all it takes; Cloudflare rebuilds and
publishes within a couple of minutes.

To swap a photo, replace the file in `src/assets/images/` (keeping the same
name is easiest) and push.

---

## Maintenance note

`@astrojs/sitemap` is pinned to version `3.2.1` because newer 3.7+ releases
require Astro 5, and this site is on Astro 4. If you upgrade Astro to 5 or
later in the future, you can also move the sitemap package back to its
latest version.

`npm audit` reports advisories on Astro 4. They concern server-side
rendering and the local development server. This site is a fully static
build with no server runtime, so those code paths are not used in
production. Upgrading to Astro 5 or 6 clears the warnings but is a larger
change best done deliberately rather than with `npm audit fix --force`.
