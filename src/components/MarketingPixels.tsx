"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Marketing / advertising pixels are only allowed on our PUBLIC marketing
// pages. They must never load on logged-in surfaces (dashboard, upload,
// analysis results, settings, etc.) where a dancer's activity could be
// tracked. Gate strictly by pathname prefix.
const PUBLIC_PREFIXES = [
  "/events",
  "/guides",
  "/studio",
  "/signup",
  "/login",
  "/privacy",
  "/terms",
  "/support",
  "/contact",
  "/scoring",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export default function MarketingPixels() {
  const pathname = usePathname();
  if (!pathname || !isPublicPath(pathname)) return null;

  return (
    <>
      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7833856993657379"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* TikTok Pixel */}
      <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D7BUDSRC77UDSGCDVMLG');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>

      {/* Meta (Facebook) Pixel — id 255034242069090 */}
      <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '255034242069090');
          fbq('track', 'PageView');
        `}</Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=255034242069090&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
