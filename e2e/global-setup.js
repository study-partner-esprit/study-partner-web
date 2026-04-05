// @ts-check
/**
 * Global setup for Playwright tests
 * Configures API mocking for all tests
 */

const globalSetup = async () => {
  console.log("🌐 Playwright Global Setup - Initializing test environment");
  
  // This runs before all tests start
  // We can use this to set environment variables if needed
  process.env.PLAYWRIGHT_TEST_BASE_URL = process.env.E2E_BASE_URL || "http://localhost:5173";
  
  console.log("✅ Test environment ready");
  
  return async () => {
    // Cleanup after all tests
    console.log("🧹 Cleaning up test environment");
  };
};

module.exports = globalSetup;
