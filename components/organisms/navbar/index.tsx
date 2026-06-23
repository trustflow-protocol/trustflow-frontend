import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '../../atoms/theme-toggle';
import { LocaleSwitcher } from '../../atoms/locale-switcher';

const NAV_LINKS = [
  { key: 'home',        href: '/'            },
  { key: 'explore',     href: '/explore'     },
  { key: 'leaderboard', href: '/leaderboard' },
  { key: 'dashboard',   href: '/dashboard'   },
  { key: 'escrow',      href: '/escrow'      },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('Nav');

  const toggle = () => setOpen((v) => !v);
  const close  = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Brand */}
      <Link href="/" onClick={close} className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        TrustFlow
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
        {NAV_LINKS.map(({ key, href }) => (
          <li key={href}>
            <Link
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === href
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right actions */}
      <div className="hidden md:flex items-center gap-3">
        <LocaleSwitcher />
        <ThemeToggle />
        <Link
          href="/escrow"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all hover:-translate-y-px"
        >
          {t('launchApp')}
        </Link>
      </div>

      {/* Hamburger */}
      <button
        className="flex md:hidden flex-col gap-1.5 bg-transparent border-none cursor-pointer p-1"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? t('closeMenu') : t('openMenu')}
      >
        <span className="block w-5 h-0.5 bg-gray-900 dark:bg-white rounded transition-all" />
        <span className="block w-5 h-0.5 bg-gray-900 dark:bg-white rounded transition-all" />
        <span className="block w-5 h-0.5 bg-gray-900 dark:bg-white rounded transition-all" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg px-6 py-4 animate-[slideDown_0.18s_ease-out]">
          <ul className="list-none m-0 p-0 flex flex-col gap-1">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    router.pathname === href
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/escrow"
              onClick={close}
              className="flex-1 text-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {t('launchApp')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
