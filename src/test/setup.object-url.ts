// jsdom does not implement `URL.createObjectURL` / `URL.revokeObjectURL` at
// all — they are `undefined`, so any component that previews a picked file
// throws before a single assertion runs.
//
// The stub is more than a silencer. It keeps a registry of every URL handed
// out and removes it again on revoke, which turns "did we leak?" into
// something a test can assert directly: after unmounting, `liveObjectUrls`
// must be empty. That leak is invisible in a browser — nothing on the page
// looks wrong when an object URL is never released — so this is the only
// place it can realistically be caught.

/** URLs handed out and not yet revoked. */
export const liveObjectUrls = new Set<string>();

let counter = 0;

if (typeof URL.createObjectURL === "undefined") {
  URL.createObjectURL = (obj: Blob | MediaSource): string => {
    const url = `blob:sedjiwa-ui/${(counter += 1)}`;
    // The object itself is irrelevant to the registry, but reading it keeps
    // the signature honest for callers passing something unexpected.
    void obj;
    liveObjectUrls.add(url);
    return url;
  };

  URL.revokeObjectURL = (url: string): void => {
    liveObjectUrls.delete(url);
  };
}
