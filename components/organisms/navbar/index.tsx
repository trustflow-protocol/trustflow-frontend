import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './navbar.module.css';

const NAV_LINKS = [
  { label: 'Home',      href: '/'          },
  { label: 'Explore',   href: '/explore'   },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Escrow',    href: '/escrow'    },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const toggle = () => setOpen((v) => !v);
  const close  = () => setOpen(false);

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      {/* Brand */}
      <Link href="/" className={styles.brand} onClick={close}>
        TrustFlow
      </Link>

      {/* Desktop links */}
      <ul className={styles.links}>
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className={`${styles.link} ${router.pathname === href ? styles.active : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Hamburger (mobile) */}
      <button
        className={styles.hamburger}
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <ul className={styles.drawerLinks}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.drawerLink} ${router.pathname === href ? styles.active : ''}`}
                  onClick={close}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
