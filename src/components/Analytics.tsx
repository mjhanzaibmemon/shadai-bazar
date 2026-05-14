import Script from 'next/script';

/**
 * Analytics component — supports Plausible (preferred, privacy-friendly)
 * and Google Analytics. Renders nothing if neither env var is set.
 *
 * Set ONE of:
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN — e.g. "shaadibazaar.com" or "44-248-29-160.sslip.io"
 *   NEXT_PUBLIC_GA_ID            — e.g. "G-XXXXXXXX"
 */
export default function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (plausibleDomain) {
    return (
      <Script
        defer
        data-domain={plausibleDomain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (gaId) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', { anonymize_ip: true });
          `}
        </Script>
      </>
    );
  }

  return null;
}
