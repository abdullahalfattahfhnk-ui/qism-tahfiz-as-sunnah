# قسم تحفيظ السنة (Qism Tahfiz as-Sunnah)

A modern digital classroom for Islamic education.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 (redirects to `/bn/login`). Also try `/ar` and `/en`.

The login form is design only. Use the "Preview the interface" link to see the app shell.
To preview another role's navigation, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_DEMO_ROLE` to `student`, `teacher` or `super_admin`, then restart the dev server.

Without Supabase keys the app runs in demo mode. With keys in `.env.local` it uses real sign-in (see below).

## Structure

- `messages/` translations (bn, ar, en)
- `src/i18n/` routing, navigation helpers, request config
- `src/app/[locale]/` all pages live under a locale segment
- `src/lib/brand.ts` official project names (single source of truth)

## Demo role preview

The Students page needs the `teacher` or `super_admin` demo role, and Admin needs `super_admin`.
With the default `student` role those pages show an "access" message. This is a preview only; real access control is enforced by the server and Supabase RLS in Step 4.

## Database

See `supabase/README.md` for the SQL, run order and first Super Admin setup.

## Real sign-in (Step 4b)

1. Copy `.env.example` to `.env.local`.
2. Paste `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase (Project Settings -> API).
3. Restart `npm run dev`.

Signed-out visitors are redirected to the login page. Your role comes from the `profiles` table
(not from `NEXT_PUBLIC_DEMO_ROLE`, which is only used in demo mode). Page content is still demo data
until the data-wiring step.
