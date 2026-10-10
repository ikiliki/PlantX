/**
 * Apps that open links in their own built-in browser (the Google app, Instagram, Facebook, TikTok, …). Google
 * sign-in does not work there: its window opens, goes white and never returns to PlantX. The login card sends
 * these visitors to Safari or Chrome instead.
 */
const IN_APP: [RegExp, string][] = [
  [/\bGSA\//, 'Google'],
  [/Instagram/, 'Instagram'],
  [/FBAN|FBAV|FB_IAB/, 'Facebook'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'TikTok'],
  [/Snapchat/, 'Snapchat'],
  [/LinkedInApp/, 'LinkedIn'],
  [/\bLine\//, 'LINE'],
  [/MicroMessenger/, 'WeChat'],
  [/Twitter/, 'X'],
]

/** The app's name when this page is inside an app's built-in browser, else null. */
export function inAppBrowser(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent): string | null {
  for (const [pattern, name] of IN_APP) if (pattern.test(userAgent)) return name
  // Android WebView marks itself with "; wv)".
  if (/Android/.test(userAgent) && /; wv\)/.test(userAgent)) return 'app'
  return null
}

export function isIos(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent) {
  return /iPhone|iPad|iPod/.test(userAgent)
}

export function isAndroid(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent) {
  return /Android/.test(userAgent)
}

/** Links that open `url` in a real browser: Safari and Chrome on iOS, Chrome on Android. */
export function openInBrowserLinks(url: string, userAgent?: string) {
  const parsed = new URL(url)
  const rest = `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`
  if (isIos(userAgent)) {
    return {
      safari: `x-safari-${parsed.protocol === 'http:' ? 'http' : 'https'}://${rest}`,
      chrome: `${parsed.protocol === 'http:' ? 'googlechrome' : 'googlechromes'}://${rest}`,
    }
  }
  return {
    safari: null,
    chrome: `intent://${rest}#Intent;scheme=${parsed.protocol.replace(':', '')};package=com.android.chrome;end`,
  }
}
