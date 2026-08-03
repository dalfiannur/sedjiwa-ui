/**
 * Default BCP-47 tag for date formatting across the picker family.
 *
 * With `locale` undefined, Intl falls back to the *browser's* locale, so a
 * call site that forgets the prop renders an English calendar inside an
 * Indonesian app — and it does so only for visitors whose browser is set that
 * way, which is why it survives local testing. Defaulting here makes a missing
 * prop degrade to the app's language rather than the visitor's.
 */
export const DEFAULT_LOCALE = "id-ID";
