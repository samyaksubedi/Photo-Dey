# Deploying the web app on Vercel

The organizer dashboard and the guest gallery are one React (Vite) single-page app in `client/web`. It is the
only part that runs on Vercel. The API and workers run on your VPS (see [coolify.md](coolify.md)); deploy those
first so you have the API address.

> `client/web/Dockerfile` and `client/web/nginx.conf` are only for self-hosting the web app on Coolify. You
> don't use them with Vercel; Vercel builds the app itself.

## 1. Project settings

| Setting                          | Value                                                                   |
| -------------------------------- | ----------------------------------------------------------------------- |
| Import                           | This Git repository, branch `main`                                      |
| Framework preset                 | Vite                                                                    |
| Root directory                   | `client/web`                                                            |
| Install command                  | default (`npm install`, Vercel detects npm from `package-lock.json`)   |
| Build command                    | default (`npm run build`, which type-checks and then builds)            |
| Output directory                 | default (`dist`)                                                        |
| Node.js version                  | 22.x                                                                    |

`client/web/vercel.json` already sends every path to `index.html`, so links such as `/gallery/…` and
`/auth/verify/…` work when opened directly or refreshed.

## 2. Environment variables

Set this for **Production** before the first deploy. Vite bakes it into the built files, so changing it later
needs a redeploy.

| Variable            | Value                              |
| ------------------- | ---------------------------------- |
| `VITE_API_BASE_URL` | `https://api.photodey.com/api/v1`  |

Leave it unset for **Preview** deployments, or accept that they can't log in: the API only allows one web origin
(`CLIENT_URL`), so a `*.vercel.app` preview address is blocked by CORS.

## 3. Domains

The API sets its login refresh cookie as `SameSite=strict`. The browser only sends that cookie when the web
app and the API share a parent domain, so the app **must** be served from `photodey.com` (not a `*.vercel.app`
address) and the API from `api.photodey.com`.

1. Under **Settings → Domains**, add `photodey.com` and `www.photodey.com`.
2. Create the DNS records Vercel shows at your domain registrar (usually an `A` record for the apex and a `CNAME` for `www`).
3. Make **`photodey.com` the primary** and set `www.photodey.com` to **redirect** to it.

The redirect matters: the API accepts exactly one origin. `CLIENT_URL` on the VPS is `https://photodey.com`,
so a visitor who stays on `www.photodey.com` would get CORS errors. Prefer `www` as the primary instead? Then set
`CLIENT_URL=https://www.photodey.com` on the API, the upload worker and the email worker, and redeploy them.

## 4. Check it

- `https://photodey.com` shows the landing page, and `https://www.photodey.com` redirects to it.
- Open the browser's developer tools, then the **Network** tab. Requests go to `https://api.photodey.com/api/v1/…` and return, with no CORS errors.
- Register, verify the email, log in, then **reload**: you stay logged in.
- Open `https://photodey.com/some/unknown/path`: the app's own "not found" page shows, not a Vercel 404.
- Create an event and open its QR link. It should lead to the Telegram bot.
