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
  const cityResult = page.getByRole('button', { name: /São Paulo São Paulo, Brasil/ });
  await expect(cityResult).toBeVisible();
  await cityResult.click();

  await expect(page.getByRole('heading', { name: 'São Paulo' }).first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C')).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();

  await expect(page.getByText('32°F')).toBeVisible();
});

test('mostra o estado vazio quando o geocoding não retorna results', async ({ page }) => {
  let forecastRequests = 0;

  await page.route('**/v1/search?*', (route) =>
    route.fulfill({ status: 200, json: { results: [] } }),
  );
  await page.route('**/v1/forecast?*', (route) => {
    forecastRequests += 1;
    return route.fulfill({ status: 200, json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade sem resultado');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
  await expect(page.getByText(/Não encontramos resultados para/)).toBeVisible();
  expect(forecastRequests).toBe(0);
});

test('distingue homônimos e consulta forecast apenas após seleção explícita', async ({ page }) => {
  const homonymResponse = {
    results: [
      {
        id: 1,
        name: 'Bristol',
        latitude: 51.45,
        longitude: -2.59,
        admin1: 'England',
        country: 'Reino Unido',
      },
      {
        id: 2,
        name: 'Bristol',
        latitude: 36.6,
        longitude: -82.19,
        admin1: 'Tennessee',
        country: 'Estados Unidos',
      },
    ],
  };
  let forecastRequests = 0;
  let forecastRequestUrl = '';

  await page.route('**/v1/search?*', (route) =>
    route.fulfill({ status: 200, json: homonymResponse }),
  );
  await page.route('**/v1/forecast?*', (route) => {
    forecastRequests += 1;
    forecastRequestUrl = route.request().url();
    return route.fulfill({ status: 200, json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Bristol');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('button', { name: /Bristol England, Reino Unido/ })).toBeVisible();
  const unitedStatesResult = page.getByRole('button', {
    name: /Bristol Tennessee, Estados Unidos/,
  });
  await expect(unitedStatesResult).toBeVisible();
  expect(forecastRequests).toBe(0);

  await unitedStatesResult.click();

  await expect(page.getByRole('heading', { name: 'Bristol' })).toBeVisible();
  await expect.poll(() => forecastRequests).toBe(1);
  expect(new URL(forecastRequestUrl).searchParams.get('latitude')).toBe('36.6');
  expect(new URL(forecastRequestUrl).searchParams.get('longitude')).toBe('-82.19');
});

test('preserva dados válidos e mostra fallback no forecast incompleto', async ({ page }) => {
  await page.route('**/v1/search?*', (route) =>
    route.fulfill({ status: 200, json: geocodingResponse }),
  );
  await page.route('**/v1/forecast?*', (route) =>
    route.fulfill({
      status: 200,
      json: {
        ...forecastResponse,
        current: { ...forecastResponse.current, temperature_2m: null },
        daily: {
          ...forecastResponse.daily,
          temperature_2m_min: [null, 1, 4, 6, 8],
        },
      },
    }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  const cityResult = page.getByRole('button', { name: /São Paulo São Paulo, Brasil/ });
  await expect(cityResult).toBeVisible();
  await cityResult.click();

  await expect(page.getByRole('status')).toContainText('Parte dos dados está indisponível.');
  await expect(page.getByText('Indisponível').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'São Paulo' }).first()).toBeVisible();
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
  const cityResult = page.getByRole('button', { name: /São Paulo São Paulo, Brasil/ });
  await expect(cityResult).toBeVisible();
  await cityResult.click();

  await expect(page.getByRole('heading', { name: 'São Paulo' }).first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
