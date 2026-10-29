import { expect, test } from '@playwright/test';

const geocodingResponse = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
      admin1: 'São Paulo',
      country: 'Brasil',
      country_code: 'BR',
      timezone: 'America/Sao_Paulo',
    },
  ],
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-10-29T12:00',
    temperature_2m: 0,
    weather_code: 0,
  },
  daily: {
    time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [-2, 1, 4, 6, 8],
    temperature_2m_max: [10, 5, 9, 12, 14],
    precipitation_probability_max: [0, 10, 20, 50, 80],
  },
};

test('busca uma cidade, mostra a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await page.route('**/v1/search?*', (route) =>
    route.fulfill({ status: 200, json: geocodingResponse }),
  );
  await page.route('**/v1/forecast?*', (route) =>
    route.fulfill({ status: 200, json: forecastResponse }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' }).first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C')).toBeVisible();

  await page.getByRole('button', { name: '°F' }).click();

  await expect(page.getByText('32°F')).toBeVisible();
});

test('mostra o estado vazio quando o geocoding não retorna results', async ({ page }) => {
  let forecastRequests = 0;

  await page.route('**/v1/search?*', (route) => route.fulfill({ status: 200, json: {} }));
  await page.route('**/v1/forecast?*', (route) => {
    forecastRequests += 1;
    return route.fulfill({ status: 200, json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade sem resultado');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
  expect(forecastRequests).toBe(0);
});

test('renderiza o clima no fluxo principal em viewport mobile 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/v1/search?*', (route) =>
    route.fulfill({ status: 200, json: geocodingResponse }),
  );
  await page.route('**/v1/forecast?*', (route) =>
    route.fulfill({ status: 200, json: forecastResponse }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' }).first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
