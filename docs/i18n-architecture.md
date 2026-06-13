# Caplexy i18n Architecture

Caplexy separates interface language from learning language.

- Interface language controls navigation, dashboard labels, missions UI, rank labels, teacher panels, reports, settings, and marketing copy.
- Learning language is the target language content. For the current product concept, that learning language is English: vocabulary, grammar, listening, reading, and speaking content stays English even when the interface is Turkish, Spanish, Portuguese, or German.

## Current Implementation

Supported interface locales:

- `tr` - Türkçe
- `en` - English
- `es` - Español
- `pt` - Português
- `de` - Deutsch

Translation files live in:

```text
locales/
  tr/common.json
  en/common.json
  es/common.json
  pt/common.json
  de/common.json
```

The i18n runtime lives in:

```text
lib/i18n.tsx
components/i18n/LanguageSwitcher.tsx
```

## Locale Selection Rules

1. If the user has selected a language before, use `localStorage["caplexy.interfaceLocale"]`.
2. Otherwise, detect the browser language with `navigator.languages`.
3. Match the closest supported base language:
   - `tr-TR` -> `tr`
   - `en-US` -> `en`
   - `es-MX` -> `es`
   - `pt-BR` -> `pt`
   - `de-DE` -> `de`
4. Fall back to `en`.

Manual selection always overrides browser detection and does not reload the page.

## Future Namespaces

As Caplexy grows, split `common.json` into feature namespaces:

```text
locales/{locale}/common.json
locales/{locale}/landing.json
locales/{locale}/dashboard.json
locales/{locale}/teacher.json
locales/{locale}/missions.json
locales/{locale}/voyages.json
locales/{locale}/ranks.json
locales/{locale}/billing.json
```

The same provider can load or import additional namespaces as the app grows.

## Product Rule

Do not translate English learning targets into the interface language.

Example for a Turkish learner:

- Interface: `Görevler`, `Rütbeler`, `Seferler`
- Learning content: English vocabulary, English grammar, English listening, English reading, English speaking

This distinction should remain visible in database design, content tooling, analytics, and teacher reporting.
