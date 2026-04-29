// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the platform's brand name, domain, and emails
// on the FRONTEND.
//
// Change PLATFORM_NAME / PLATFORM_DOMAIN here and every page that imports
// from this file picks it up. The PlatformNameContext also seeds its
// defaults from here, so users see this name until the live branding is
// fetched from the backend.
//
// NOTE: index.html's <title> tag is plain HTML and cannot import this file.
// If you rename the platform, also update index.html manually.
// ─────────────────────────────────────────────────────────────────────────────

export const PLATFORM_NAME   = 'Benchmark Pact'
export const PLATFORM_DOMAIN = 'benchmarkpact.com'

export const SUPPORT_EMAIL = `support@${PLATFORM_DOMAIN}`
