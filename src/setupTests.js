/* global globalThis, vi */
import "@testing-library/jest-dom";

// Provide a `jest` alias for tests written against Jest APIs
if (
  typeof globalThis.jest === "undefined" &&
  typeof globalThis.vi !== "undefined"
) {
  globalThis.jest = globalThis.vi;
}
