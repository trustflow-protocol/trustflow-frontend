import type { AbstractIntlMessages } from 'next-intl'
import en from '../messages/en.json'
import es from '../messages/es.json'

/** Locales supported by the app. Keep in sync with `i18n.locales` in next.config.js. */
export const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

const messagesByLocale: Record<Locale, AbstractIntlMessages> = { en, es }

/** Type guard for an incoming (possibly undefined) locale string. */
export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value)
}

/** Resolve the message catalog for a locale, falling back to the default. */
export function getMessages(locale: string | undefined): AbstractIntlMessages {
  return messagesByLocale[isLocale(locale) ? locale : defaultLocale]
}
