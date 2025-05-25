import { test, expect } from '@playwright/test';

test.describe('Order Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page
    await page.goto('http://localhost:5173/login');

    // Login as a user
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL('http://localhost:5173/**');
  });

  test('User can view orders page', async ({ page }) => {
    // Navigate to the orders page
    await page.click('text=Orders');

    // Verify we are on the orders page
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.locator('h1')).toContainText('Orders');
  });

  test('User can view marketplace and add items to cart', async ({ page }) => {
    // Navigate to marketplace
    await page.click('text=Products');

    // Verify marketplace loads
    await expect(page).toHaveURL(/.*\/marketplace/);

    // Add an item to cart (first product)
    await page.click('button:has-text("Add to Cart")');

    // Open cart
    await page.click('.ShoppingCart');

    // Verify item was added
    await expect(page.locator('.cart-item')).toBeVisible();
  });

  test('User can proceed to checkout', async ({ page }) => {
    // Navigate to marketplace
    await page.click('text=Products');

    // Add an item to cart
    await page.click('button:has-text("Add to Cart")');

    // Open cart
    await page.click('.ShoppingCart');

    // Click on checkout
    await page.click('text=Proceed to New Checkout');

    // Verify we are on the checkout page
    await expect(page).toHaveURL(/.*\/checkout/);

    // Fill out shipping info
    await page.fill('input[name="street"]', '123 Main St');
    await page.fill('input[name="city"]', 'Anytown');
    await page.fill('input[name="zipCode"]', '12345');
    await page.fill('input[name="country"]', 'USA');

    // Fill out payment info
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="cardHolder"]', 'John Doe');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');

    // Place order
    await page.click('button:has-text("Place Order")');

    // Verify order confirmation
    await expect(page.locator('text=Order placed successfully')).toBeVisible();

    // Should redirect to orders page
    await expect(page).toHaveURL(/.*\/orders/);
  });

  test('Admin can view and manage orders', async ({ page }) => {
    // Logout
    await page.click('text=Logout');

    // Login as admin
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navigate to admin orders dashboard
    await page.click('text=Orders');

    // Verify we are on the admin orders page
    await expect(page).toHaveURL(/.*\/admin\/orders/);

    // Check if charts are visible
    await expect(page.locator('.recharts-wrapper')).toBeVisible();

    // Verify order management controls exist
    await expect(page.locator('button:has-text("Export Report")')).toBeVisible();
  });
});
