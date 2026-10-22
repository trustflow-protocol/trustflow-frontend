import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
            rel="stylesheet"
          />

          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* PWA Meta Tags */}
          <meta name="application-name" content="TrustFlow" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="TrustFlow" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#030712" media="(prefers-color-scheme: dark)" />
          <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

          {/* iOS Splash & Icons */}
          <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
          <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />

          {/* Startup Image for iOS */}
          <link rel="apple-touch-startup-image" href="/icons/icon-512.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
