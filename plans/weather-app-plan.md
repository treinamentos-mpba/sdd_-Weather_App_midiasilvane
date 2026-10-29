# Plano Técnico: Weather App

## Architecture

Aplicação web SPA em React, servida como arquivos estáticos e sem backend próprio no MVP. A interface chama diretamente os serviços públicos do Open-Meteo, sem API key. Não haverá banco de dados, autenticação ou persistência de dados do usuário.

Responsabilidades:

- **Componentes React:** renderizam busca, resultados, clima atual, previsão, unidade e estados de carregamento/erro.
- **Hook `useWeather`:** coordena busca, seleção, consultas de clima, cancelamento de requisições obsoletas e estados apresentados à UI.
- **`weatherService`:** encapsula HTTP, valida respostas externas e converte o contrato Open-Meteo para tipos internos.
- **Utilitários puros:** conversão de temperatura, formatação de data/hora e mapeamento de códigos meteorológicos.

Fluxo principal: UI → hook → serviço → Open-Meteo → validação/mapeamento → estado do hook → UI. Componentes não devem consumir JSON bruto do provedor.

## Tech Stack

- **Linguagem:** TypeScript em modo strict.
- **UI:** React e Vite.
- **Estilo:** Tailwind CSS.
- **HTTP:** Fetch API nativa; não adicionar cliente HTTP sem necessidade comprovada.
- **Datas e números:** `Intl.DateTimeFormat` e `Intl.NumberFormat` nativos, usando `pt-BR` e o fuso retornado pelo provedor.
- **Testes:** Vitest e Testing Library para unitários/componentes; Playwright para E2E.
- **Qualidade:** Biome; pnpm para dependências e scripts.
- **Dados meteorológicos:** Open-Meteo Geocoding API e Forecast API, sem API key.

## Project Structure

```text
src/
  App.tsx
  main.tsx
  components/
    SearchBar.tsx
    CityResults.tsx
    CurrentWeather.tsx
    ForecastList.tsx
    ForecastCard.tsx
    UnitToggle.tsx
    states/
      EmptyState.tsx
      ErrorState.tsx
      LoadingState.tsx
  hooks/
    useWeather.ts
  services/
    weatherService.ts
  lib/
    format.ts
    temperature.ts
    weatherCodes.ts
  types/
    weather.ts
  styles/
    index.css

tests/
  unit/
  e2e/
```

Manter cada componente focado em uma responsabilidade. Não criar camada de repositório, backend ou abstrações genéricas sem requisito que as justifique.

## Data Model

Tipos internos desacoplados dos nomes e formatos do JSON externo:

```ts
type Unit = "celsius" | "fahrenheit";

interface City {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  observedAt: string | null;
}

interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
}

interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecastDays: ForecastDay[];
  fetchedAt: string;
  isPartial: boolean;
}

type WeatherErrorKind = "network" | "timeout" | "http" | "invalid-response";

interface WeatherError {
  kind: WeatherErrorKind;
  statusCode?: number;
  retryAfter?: string;
}

type RequestState<T> =
  | { status: "idle" | "loading" }
  | { status: "success"; data: T }
  | { status: "partial"; data: T; missingFields: string[] }
  | { status: "empty" }
  | { status: "error"; error: WeatherError };
```

O estado da tela mantém busca, cidade selecionada, clima atual, previsão e unidade como recursos separados. Isso permite representar clima atual válido junto a previsão parcial, sem descartar dados válidos. Valores internos de temperatura permanecem em Celsius; conversão e arredondamento ocorrem somente na apresentação. A regra exata de arredondamento ainda requer decisão de produto.

## Data Flow

1. O usuário digita o nome da cidade. Remover espaços apenas das extremidades; preservar acentos, hífens e apóstrofos.
2. Se o valor normalizado estiver vazio, manter a busca local e não enviar requisição.
3. O hook inicia geocodificação e apresenta carregamento. Resposta vazia produz estado `empty`, não erro.
4. A UI apresenta nome e atributos geográficos disponíveis; o usuário seleciona explicitamente um resultado.
5. O hook consulta o Forecast API com latitude/longitude da cidade selecionada, cinco dias e `timezone=auto`.
6. O serviço valida o formato, mapeia observação atual e listas diárias em tipos internos e identifica campos/dias ausentes.
7. O hook publica sucesso, parcial ou erro. Respostas de uma busca/localidade que deixou de ser atual são ignoradas.
8. A UI formata rótulos e horários em pt-BR; alternar unidade converte sempre a partir dos valores de origem em Celsius.

## External APIs

### Geocoding API

- **Base:** `https://geocoding-api.open-meteo.com/v1/search`
- **Parâmetros necessários:** `name` com o termo normalizado, `language=pt` e `format=json`.
- **Exemplo de URL:** `https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o+Paulo&language=pt&format=json`
- **Mapeamento para `City`:** `id` → `id`; `name` → `name`; `latitude`/`longitude` → coordenadas; `admin1` → `region`; `country` → `country`; `country_code` → `countryCode`; `timezone` → `timezone`. Campos geográficos complementares são opcionais.
- **Exemplo resumido de resposta:**

```json
{
  "results": [
    {
      "id": 3448439,
      "name": "São Paulo",
      "latitude": -23.55,
      "longitude": -46.63,
      "admin1": "São Paulo",
      "country_code": "BR",
      "country": "Brasil",
      "timezone": "America/Sao_Paulo"
    }
  ]
}
```

- **Lista vazia:** interpretar como busca sem resultados. Limite de resultados e ordenação não estão definidos na spec e devem ser aprovados antes de fixar o contrato de busca.

### Forecast API

- **Base:** `https://api.open-meteo.com/v1/forecast`
- **Parâmetros:** `latitude` e `longitude` da `City`; `current=temperature_2m,weather_code`; `daily=weather_code,temperature_2m_max,temperature_2m_min`; `temperature_unit=celsius`; `timezone=auto`; `forecast_days=5`.
- **Exemplo de URL:** `https://api.open-meteo.com/v1/forecast?latitude=-23.55&longitude=-46.63&current=temperature_2m%2Cweather_code&daily=weather_code%2Ctemperature_2m_max%2Ctemperature_2m_min&temperature_unit=celsius&timezone=auto&forecast_days=5`
- **Exemplo resumido de resposta:**

```json
{
  "timezone": "America/Sao_Paulo",
  "current": {
    "time": "2026-10-29T12:00",
    "temperature_2m": 22.1,
    "weather_code": 2
  },
  "daily": {
    "time": ["2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"],
    "weather_code": [2, 3, 61, 2, 1],
    "temperature_2m_max": [25.0, 24.0, 21.0, 26.0, 27.0],
    "temperature_2m_min": [17.0, 18.0, 16.0, 17.0, 18.0]
  }
}
```

- **Mapeamento para `WeatherData`:** a `City` selecionada é mantida; `timezone` vem da resposta Forecast; `current.temperature_2m` → `current.temperatureC`; `current.weather_code` → `current.weatherCode`; `current.time` → `current.observedAt`. Para cada índice `i`, combinar `daily.time[i]`, `daily.weather_code[i]`, `daily.temperature_2m_min[i]` e `daily.temperature_2m_max[i]` em um `ForecastDay`.
- **Metadados internos:** `fetchedAt` é o instante de recebimento registrado pelo cliente; `isPartial` é calculado como `true` se faltar algum campo obrigatório ou um dos cinco dias. Esses campos não vêm da API.
- **Interpretação:** usar `timezone` e datas locais retornadas; validar que as quatro listas diárias tenham comprimentos compatíveis. Valores ausentes viram `null` nos tipos internos e são marcados como parciais, nunca estimados.
- **Atribuição e uso:** confirmar termos, limites, cobertura e exigências de atribuição do provedor antes do lançamento. Não assumir garantia de disponibilidade nem precisão em tempo real.

## State Management

Usar estado React local, coordenado pelo hook `useWeather`; não introduzir Redux, Zustand ou persistência local no MVP.

- `SearchBar` mantém somente o texto ainda não enviado. O hook mantém o termo enviado, resultados, cidade selecionada, dados meteorológicos e unidade.
- Busca, clima atual e previsão têm estados independentes. Usar `RequestState<T>` com `idle`, `loading`, `success`, `empty`, `partial` e `error`; `empty` representa especificamente geocoding sem resultados, enquanto `partial` representa resposta meteorológica incompleta.
- Manter clima atual e previsão separados para permitir exibir uma parte válida enquanto outra está incompleta ou falhou. Não substituir dados válidos de uma cidade por resposta de uma seleção anterior.
- Manter os dados meteorológicos canônicos em Celsius. `Unit` começa em `celsius` a cada sessão e é estado de apresentação no hook.
- Derivar temperaturas de exibição durante a renderização por selector/função pura em `lib/temperature.ts`: Celsius retorna o valor de origem; Fahrenheit calcula `C * 9 / 5 + 32`. Não armazenar valores convertidos e não fazer novo request ao alternar unidade. A formatação/arredondamento ocorre somente após a conversão, conforme regra visual aprovada.
- Cada nova busca/seleção cancela ou invalida a requisição anterior com `AbortController` e/ou identificador monotônico. Aplicar timeout de 8 segundos por chamada, conforme CA-06e; distinguir timeout de cancelamento por troca de cidade.

## Error Handling

- **Entrada vazia:** validar localmente, manter busca em `idle` e não enviar request.
- **Geocoding sem resultados:** classificar como `empty`, exibir mensagem de nenhuma cidade encontrada e não chamar Forecast API. Não mostrar mensagem de erro.
- **Falha de rede:** classificar como `error` de tipo `network`; mostrar indisponibilidade e oferecer retry manual.
- **Timeout:** após 8 segundos, cancelar a chamada, classificar como `timeout` e oferecer retry manual. Não iniciar retry automático.
- **HTTP 5xx:** classificar como erro recuperável do provedor; oferecer retry apenas por ação explícita.
- **HTTP 429:** classificar como limitação do provedor; não repetir automaticamente e desabilitar/adiar retry manual até o instante indicado por `Retry-After`, se presente.
- **HTTP 4xx não transitório:** classificar como erro de API sem retry automático; mostrar mensagem genérica ao usuário e manter o status/código para diagnóstico.
- **JSON inválido ou estrutura incompatível:** classificar como `invalid-response`; não lançar erro não tratado nem renderizar valores inventados.
- **Resposta parcial:** manter e renderizar campos/dias válidos, marcar os ausentes como indisponíveis e definir status `partial`. Se current ou forecast estiverem independentes, a falha/parcialidade de um não deve apagar o outro.
- **Respostas fora de ordem:** ignorar resposta de busca/cidade que não seja mais a seleção atual; cancelamento intencional não deve aparecer como erro ao usuário.
- **Mensagens e diagnóstico:** mensagens em pt-BR, sem stack trace ou detalhes internos na UI; registrar tipo de erro, status HTTP e operação, sem dados pessoais desnecessários.

## Testing Strategy

- **Vitest — funções puras:** testar conversão C/F a partir do valor original, valores negativos e fracionários, ausência de valor (`null`), formatação pt-BR/fuso local e códigos WMO conhecidos/desconhecidos. Fixar os resultados de arredondamento quando a regra de produto for aprovada.
- **Vitest — services com `fetch` mockado:** verificar URL e parâmetros de geocoding/forecast, preservação e codificação de nomes com acentos, mapeamento de respostas, arrays diários desalinhados, campos ausentes, JSON inválido, lista vazia, falha de rede, timeout de 8 segundos, 4xx, 5xx e 429 com `Retry-After`. Confirmar que entrada vazia não faz request e que retry só ocorre após ação explícita.
- **Vitest/Testing Library — hook e componentes:** validar estados `idle`, `loading`, `success`, `empty`, `partial` e `error`; busca e seleção; conteúdo de clima/previsão; alternância de unidade sem segundo request; retry; respostas fora de ordem; controles acessíveis por teclado. Mockar o service no teste de UI para isolar apresentação e estado da rede.
- **Playwright — E2E:** interceptar ambos os endpoints com `page.route` e fixtures determinísticas. Cobrir busca por cidade e seleção de homônimos, dados atuais e cinco dias, troca C/F, sem resultados, payload parcial, timeout/falha e retry manual. Incluir teste de resposta atrasada para garantir que uma cidade anterior não sobrescreva a seleção atual.
- **Playwright — viewport mobile:** executar o fluxo principal em 320 px e 375 px de largura; verificar ausência de rolagem horizontal, controles visíveis e operáveis e leitura dos cinco dias. Manter pelo menos um viewport desktop para regressão responsiva. Usar testes E2E para poucos fluxos críticos; deixar combinações de erro e payload para Vitest.
- **Qualidade não funcional:** testar a matriz de navegadores definida em NFR-06; combinar auditoria automatizada com revisão manual de teclado, foco, nomes acessíveis e contraste. Medir o p95 em staging conforme NFR-04 e monitorar disponibilidade do site separada da taxa de sucesso meteorológica.
- Rastrear testes pelos IDs CA na matriz `Requirements Traceability`. Testes unitários e E2E não devem depender de chamadas reais ao Open-Meteo; executar um smoke test de integração separado apenas se necessário para verificar o contrato externo.

## Risks & Trade-offs

- **Chamadas diretas do navegador ao Open-Meteo (escolhida) vs. BFF/backend:** a chamada direta evita servidor, segredo e operação adicionais, coerente com ausência de API key e persistência. Trade-off: menos controle central de cache, rate limit, observabilidade e disponibilidade; adotar BFF apenas se termos, escala ou necessidade operacional exigirem.
- **Estado local no hook (escolhido) vs. store global ou TanStack Query:** o hook é suficiente para uma tela e evita dependência/configuração. Trade-off: cache e deduplicação de requests não vêm prontos; considerar TanStack Query se surgirem múltiplas telas, cache ou sincronização complexa. Redux/Zustand só se o estado passar a ser compartilhado amplamente.
- **Celsius canônico com conversão na apresentação (escolhido) vs. buscar novamente em Fahrenheit:** evita round-trip, mantém uma única fonte de dados e impede drift entre alternâncias. Trade-off: a política de arredondamento precisa ser definida e testada.
- **Sem persistência de preferências (escolhida) vs. `localStorage`:** reduz armazenamento e decisões de privacidade; em contrapartida, unidade e cidade não são lembradas após nova sessão. Adicionar persistência local somente após requisito explícito.
- **`fetch` mockado/rotas Playwright (escolhidos) vs. testes sempre contra API real:** mocks tornam testes rápidos, repetíveis e imunes a limites/indisponibilidade externa; não validam continuamente o contrato publicado. Mitigar com validação dos exemplos/contrato e smoke test controlado, sem tornar a suíte bloqueada pela rede.
- **Validação manual enxuta (escolhida) vs. biblioteca de schemas em runtime:** type guards e validações focadas mantêm dependências baixas para dois endpoints. Trade-off: mais código de validação próprio; adotar Zod ou equivalente se o contrato crescer ou se a validação manual ficar difícil de manter.
- **Decisões de produto pendentes:** público/região, granularidade, campos, metas NFR, frescor dos dados e restrições de entrega ainda requerem aprovação. Tratar as perguntas abertas da spec como gates antes do compromisso de produção.
