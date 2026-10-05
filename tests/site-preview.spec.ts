import { expect, test } from "@playwright/test";

test("prévia usa Astro original com animações, localização e conteúdo do lead", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/preview/clinica-horizonte-demo");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="crm-template-engine"]')).toHaveAttribute("content", "diego-astro-original-4b967ad");
  await expect(page.locator("[data-hero-headline]")).toContainText("Clínica Horizonte");
  await expect(page.locator("[data-hero-headline]")).toBeVisible();
  await expect(page.locator(".hero-lead")).toBeVisible();
  await expect.poll(() => page.locator(".hero-media img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.hero a[href="https://wa.me/5511999990001"]').first()).toBeVisible();
  await expect(page.locator('iframe')).toHaveAttribute("src", /Cl%C3%ADnica%20Horizonte.*output=embed/);
  const html = await page.content();
  expect(html).not.toMatch(/Sheila|Blumenau|OAB\/SC|__CRM_/);
  const secondTab = page.locator("[data-difference-tab]").nth(1);
  await secondTab.scrollIntoViewIfNeeded();
  await secondTab.click();
  await expect(secondTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("[data-difference-slide]").nth(1)).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: "test-results/astro-preview-" + test.info().project.name + ".png", fullPage: true });
});

test("menu, FAQ e layout móvel do motor original funcionam", async ({ page }, testInfo) => {
  await page.goto("/preview/clinica-horizonte-demo");
  const question = page.locator(".faq details").nth(1);
  const summary = question.locator("summary");
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  await expect(question).toHaveAttribute("open", "");
  if (testInfo.project.name === "mobile") {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator("[data-menu-toggle]").click();
    await expect(page.locator("[data-mobile-menu]")).toHaveClass(/is-open/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
