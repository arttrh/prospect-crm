import { expect, test } from "@playwright/test";

test("abre o CRM, o Kanban e os detalhes do lead", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pipeline de prospecção" })).toBeVisible();
  await expect(page.getByText("Clínica Horizonte", { exact: true })).toBeVisible();
  await page.getByText("Clínica Horizonte", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: /Gemini Flash/i })).toBeVisible();
  await expect(page.getByText(/Nenhuma mensagem é enviada automaticamente/i)).toBeVisible();
});

test("mostra o formulário de importação do Apify", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Importar do Apify/i }).click();
  await expect(page.getByRole("heading", { name: "Importar dataset do Apify" })).toBeVisible();
  await expect(page.getByText(/Nenhum Actor é executado/i)).toBeVisible();
});

test("mantém os controles utilizáveis em tela móvel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Somente no projeto móvel");
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Kanban/i })).toBeVisible();
  await expect(page.getByPlaceholder("Buscar empresa...")).toBeVisible();
});
