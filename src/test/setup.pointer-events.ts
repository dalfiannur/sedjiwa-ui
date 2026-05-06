// jsdom does not implement the Pointer Capture API; provide minimal stubs so
// Radix UI Select (and similar primitives) that call hasPointerCapture /
// setPointerCapture / releasePointerCapture during pointer events don't throw.
if (typeof Element.prototype.hasPointerCapture === "undefined") {
  Element.prototype.hasPointerCapture = () => false;
}
if (typeof Element.prototype.setPointerCapture === "undefined") {
  Element.prototype.setPointerCapture = () => {};
}
if (typeof Element.prototype.releasePointerCapture === "undefined") {
  Element.prototype.releasePointerCapture = () => {};
}

// jsdom does not implement scrollIntoView; provide a no-op stub so Radix UI
// Select (which calls it on the highlighted item when the listbox opens) does
// not throw.
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = () => {};
}
