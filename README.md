# Wigy

Wigy is a small Vercel dashboard for Project Istiqamah widget text. Add quotes or reminders, optionally schedule them, and Wigy serves a deterministic active quote for each day.

## Deploy to Vercel

1. Create an Upstash Redis database from the Vercel Marketplace and connect it to the Vercel project. This automatically supplies `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
2. Add `WIGY_ADMIN_PASSWORD` in **Vercel → Project → Settings → Environment Variables**. Use a long, unique password.
3. Import this GitHub repository into Vercel and deploy it.
4. Open the deployed Wigy URL, sign in, and add text.

## iPhone URLs

In Project Istiqamah Settings, paste your production domain:

```text
https://YOUR-WIGY-URL/api/widget-reminder
https://YOUR-WIGY-URL/api/plain-widget-text
```

The endpoints return a JSON response in the format the app expects:

```json
{ "text": "Your current daily reminder" }
```

## How quote selection works

- Only active quotes in the chosen widget channel are eligible.
- Optional start/end times can temporarily schedule a quote.
- If several quotes are eligible, the result is stable for that calendar day and can change the next day.
- No eligible widget quote returns `Keep showing up.`; no eligible Plain Text quote returns an empty string.

## Local development

```sh
npm install
cp .env.example .env.local
npm run dev
```

Add your Upstash credentials and admin password to `.env.local`. Never commit it.
