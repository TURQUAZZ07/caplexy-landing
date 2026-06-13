# Caplexy Landing Page

Modern web-first landing page for Caplexy, a gamified English learning platform where learners rise from Cadet to Admiral through voyages, missions, ranks, and promotions.

## Tech

- Next.js
- React
- Tailwind CSS
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Notes

- No backend, login, database, or payment system is included.
- The hero image is stored at `public/images/caplexy-hero.png`.
- Main landing page code lives in `app/page.tsx`.
- Learner dashboard prototype lives at `app/dashboard/page.tsx`.
- Dashboard UI components live in `components/dashboard/LearnerDashboard.tsx`.
- i18n runtime lives in `lib/i18n.tsx` and `components/i18n/LanguageSwitcher.tsx`.
- Translation files live in `locales/{locale}/common.json`.
- See `docs/i18n-architecture.md` for the interface-language vs learning-language model.
