import { expect, test } from "@playwright/test";

const statuses = ["Novo", "Enviado", "Follow-up", "Respondeu", "Site enviado", "Reunião", "Fechado", "Desqualificado"];

test("abre o CRM, o Kanban e os detalhes do lead", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Pipeline de prospecção" })).toBeVisible();
  await page.getByRole("tab", { name: /Kanban/i }).click();
  await expect(page.getByText("Clínica Horizonte", { exact: true })).toBeVisible();
  await page.getByText("Clínica Horizonte", { exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: /Gemini Flash/i })).toBeVisible();
  await expect(page.getByText(/Nenhuma mensagem é enviada automaticamente/i)).toBeVisible();
});

test("mostra o formulário de importação do Apify", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Importar/i }).click();
  await expect(page.getByRole("heading", { name: "Importar dataset do Apify" })).toBeVisible();
  await expect(page.getByText(/Nenhum Actor é executado/i)).toBeVisible();
});

test("mantém os controles utilizáveis em tela móvel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Somente no projeto móvel");
  await page.goto("/");
  await expect(page.getByRole("tab", { name: /Kanban/i })).toBeVisible();
  await expect(page.getByPlaceholder("Buscar empresa...")).toBeVisible();
});

test("teclado abre o lead, devolve o foco e move o status", async ({ page }) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Abrir Clínica Horizonte" });
  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();

  await page.getByRole("combobox", { name: "Mover status de Clínica Horizonte" }).click();
  await page.getByRole("option", { name: "Enviado", exact: true }).click();
  await expect(page.getByRole("button", { name: "Abrir Clínica Horizonte" })).toBeVisible();
  await expect(page.getByText("Enviado", { exact: true }).first()).toBeVisible();
});

test("navegação preserva destinos e destaca o destino atual", async ({ page }) => {
  await page.goto("/");
  for (const [name, heading] of [["Relatórios", "Relatórios"], ["Follow-ups", "Follow-ups"], ["Pierre", "Integração Pierre"], ["Visão geral", "Pipeline de prospecção"]] as const) {
    const destination = page.getByRole("button", { name, exact: true });
    await destination.click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(destination).toHaveAttribute("aria-current", "page");
  }
});

test("mobile mantém oito estágios acessíveis, sem overflow e com alvos de toque", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Somente no projeto móvel");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Abrir Clínica Horizonte" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Mover status de Clínica Horizonte" })).toBeVisible();
  await expect(page.getByText("Arraste um lead para cá")).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const control of [page.getByRole("button", { name: "Abrir Clínica Horizonte" }), page.getByRole("combobox", { name: "Mover status de Clínica Horizonte" })]) {
    const box = await control.boundingBox();
    expect(box, "controle deve estar renderizado").not.toBeNull();
    expect(box!.width, "largura mínima de toque").toBeGreaterThanOrEqual(44);
    expect(box!.height, "altura mínima de toque").toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByText(statuses[0], { exact: true }).first()).toBeVisible();
  await expect(page.getByText(statuses.at(-1)!, { exact: true }).first()).toBeVisible();
});
