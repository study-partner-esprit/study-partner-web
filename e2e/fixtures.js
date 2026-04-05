// @ts-check
const { test: base } = require("@playwright/test");

/**
 * Fixture to mock API responses
 * Prevents real API calls during E2E tests
 */
const test = base.extend({
  mockAPI: async ({ page }, use) => {
    // Mock auth endpoints
    await page.route("**/api/v1/auth/register", (route) => {
      route.abort("blockedbyclient");
    });

    await page.route("**/api/v1/auth/login", (route) => {
      route.abort("blockedbyclient");
    });

    await page.route("**/api/v1/auth/logout", (route) => {
      route.abort("blockedbyclient");
    });

    // Mock dashboard/data endpoints
    await page.route("**/api/v1/tasks/**", (route) => {
      route.abort("blockedbyclient");
    });

    await page.route("**/api/v1/sessions/**", (route) => {
      route.abort("blockedbyclient");
    });

    await page.route("**/api/v1/study-plans/**", (route) => {
      route.abort("blockedbyclient");
    });

    // Provide hook to enable selective mocks in tests
    const mockResponse = async (pattern, handler) => {
      await page.route(pattern, handler);
    };

    await use({ mockResponse });
  },
});

module.exports = { test };
