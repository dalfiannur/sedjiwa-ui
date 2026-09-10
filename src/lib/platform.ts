/**
 * Which modifier key the user's keyboard actually has.
 *
 * Shared rather than duplicated: `useKeyboardShortcut` resolves `"mod"` to
 * Cmd or Ctrl when it *binds* a shortcut, and `<Kbd />` has to resolve it the
 * same way when it *prints* one. Two copies of this sniffing would eventually
 * disagree, and the symptom — a hint reading Ctrl+K over a binding that only
 * answers to Cmd+K — is the kind nobody files a bug for.
 */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ??
    navigator.platform ??
    "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}
