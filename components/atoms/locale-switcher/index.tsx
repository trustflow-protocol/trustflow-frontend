import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { locales, type Locale } from '../../../i18n/messages'

/**
 * LocaleSwitcher — switches the active UI language while preserving the current
 * route (pathname + query). Relies on Next.js built-in locale routing, so the
 * selected locale is reflected in the URL and `useRouter().locale`.
 */
export function LocaleSwitcher() {
  const router = useRouter()
  const t = useTranslations('LocaleSwitcher')
  const active = (router.locale ?? router.defaultLocale) as string

  const onChange = (next: Locale) => {
    if (next === active) return
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
      locale: next,
    })
  }

  return (
    <label className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
      <span className="sr-only">{t('label')}</span>
      <select
        aria-label={t('label')}
        value={active}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc} className="text-gray-900">
            {t(loc)}
          </option>
        ))}
      </select>
    </label>
  )
}
