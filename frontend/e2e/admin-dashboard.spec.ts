import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard E2E Tests", () => {

  test.beforeEach(async ({ page }) => {
    // Set admin auth token in localStorage before each test
    await page.addInitScript(() => {
      localStorage.setItem("skipd_admin_token", "mock-admin-token-12345");
      localStorage.setItem("skipd_admin_user", JSON.stringify({
        id: 1,
        full_name: "Sachin Rawat",
        email: "admin@skipd.in",
        role: "SUPER_ADMIN"
      }));
    });
  });

  test("1. Delivery & Express Logistics Dashboard (/admin/delivery)", async ({ page }) => {
    await page.goto("/admin/delivery", { waitUntil: "domcontentloaded" });
    
    // Wait for AdminLayout auth state to hydrate
    await page.waitForSelector("h1", { timeout: 20000 });

    // Check Header Title & Subtitle
    await expect(page.locator("h1")).toContainText("Delivery & Express Logistics");

    // Check 6 Top Metric Cards
    await expect(page.getByText("Total Shipments").first()).toBeVisible();
    await expect(page.getByText("In Transit").first()).toBeVisible();
    await expect(page.getByText("Out for Delivery").first()).toBeVisible();
    await expect(page.getByText("Delivered").first()).toBeVisible();
    await expect(page.getByText("Delivery Success Rate").first()).toBeVisible();
    await expect(page.getByText("RTO / Failed").first()).toBeVisible();

    // Check Sub-Tabs Bar
    await expect(page.getByRole("button", { name: "Shipments", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tracking", exact: true })).toBeVisible();

    // Check Shipments Table Columns
    await expect(page.getByText("AWB TRACKING CODE")).toBeVisible();
    await expect(page.getByText("ORDER ID").first()).toBeVisible();

    // Test + Create Shipment Modal Opening
    await page.getByRole("button", { name: /Create Shipment/i }).click();
    await expect(page.getByText("Create New Express Shipment")).toBeVisible();
    await page.getByRole("button", { name: "✕" }).click();
  });

  test("2. Marketing & Promotional Campaigns Dashboard (/admin/sales)", async ({ page }) => {
    await page.goto("/admin/sales", { waitUntil: "domcontentloaded" });

    // Wait for AdminLayout auth state to hydrate
    await page.waitForSelector("h1", { timeout: 20000 });

    // Check Header Title
    await expect(page.locator("h1")).toContainText("Marketing & Promotional Campaigns");

    // Check 5 Top Metric Stat Cards
    await expect(page.getByText("Total Campaigns").first()).toBeVisible();
    await expect(page.getByText("Active Campaigns").first()).toBeVisible();
    await expect(page.getByText("Total Reach").first()).toBeVisible();
    await expect(page.getByText("Total Sales (Promo)").first()).toBeVisible();
    await expect(page.getByText("Customers Engaged").first()).toBeVisible();

    // Check Sub-Tabs Bar
    await expect(page.getByRole("button", { name: /All Campaigns/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Flash Sale/i })).toBeVisible();

    // Check Campaigns Table
    await expect(page.getByText("CAMPAIGN TITLE")).toBeVisible();
    await expect(page.getByText("Great Freedom Sale").first()).toBeVisible();

    // Test + Create Campaign Modal
    await page.getByRole("button", { name: /Create Campaign/i }).click();
    await expect(page.getByText("Create New Marketing Campaign")).toBeVisible();
  });

  test("3. Payments & Gateways Dashboard (/admin/payments)", async ({ page }) => {
    await page.goto("/admin/payments", { waitUntil: "domcontentloaded" });

    // Wait for AdminLayout auth state to hydrate
    await page.waitForSelector("h1", { timeout: 20000 });

    // Check Title
    await expect(page.locator("h1")).toContainText("Payments, Finance & Gateways");

    // Check Stat Cards
    await expect(page.getByText("Total Transaction Amount").first()).toBeVisible();
    await expect(page.getByText("Successful Payments").first()).toBeVisible();
  });

});
