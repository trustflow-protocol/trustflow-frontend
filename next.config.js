/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Built-in locale routing (Pages Router). Prefixes non-default locales, e.g.
  // `/es/explore`, and exposes the active locale via `useRouter().locale`.
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
};
