/* global globalThis */
import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

// BLOOM-11: register the jest-axe a11y matcher (expect(...).toHaveNoViolations())
expect.extend(toHaveNoViolations);

// Provide a `jest` alias for tests written against Jest APIs
if (
  typeof globalThis.jest === "undefined" &&
  typeof globalThis.vi !== "undefined"
) {
  globalThis.jest = globalThis.vi;
}
