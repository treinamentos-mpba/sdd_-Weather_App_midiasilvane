# Backlog de Tarefas: Weather App

Tarefas derivadas de [plans/weather-app-plan.md](../plans/weather-app-plan.md), ordenadas por dependência. T-01 e T-02 são pré-requisitos que podem ser resolvidos em paralelo ao desenvolvimento. A implementação segue tipos → funções puras → services → hook → componentes → integração; todos os testes vêm depois da integração e o hardening fecha o backlog. Os IDs existentes foram preservados para manter referências estáveis.

## Matriz de rastreabilidade funcional

| Requisito da spec | Tarefas de implementação | Cobertura |
| --- | --- | --- |
| FR-01 — Buscar cidades | T-08, T-14, T-21, T-25 | Geocoding, estado de busca, entrada/resultados e composição da tela. |
| FR-02 — Selecionar a cidade | T-08, T-15, T-21, T-25, T-42 | Mapeamento, seleção/coordenadas, resultados e contexto da cidade atual. |
| FR-03 — Consultar o clima atual | T-09, T-15, T-22, T-42 | Forecast, estado da seleção, exibição e integração do clima atual. |
| FR-04 — Consultar a previsão de cinco dias | T-09, T-15, T-23, T-43 | Forecast diário, estado da seleção, cartões e integração da previsão. |
| FR-05 — Alternar unidade de temperatura | T-04, T-16, T-24, T-43 | Conversão, estado da unidade, controle e integração da apresentação. |
| FR-06 — Comunicar estados da consulta | T-10, T-14, T-15, T-16, T-18, T-19, T-20, T-22, T-23, T-25, T-42, T-43 | Erros/timeout, estados do hook, loading/vazio/erro, dados parciais e integração progressiva. |

**Lacunas:** Nenhum requisito funcional FR-01 a FR-06 está sem tarefa de implementação correspondente. Os testes associados estão listados separadamente na Entrega 7.

## Prioridade e tamanho

P0 = necessário para entregar o MVP funcional ou cumprir um gate obrigatório; P1 = importante para robustez e validação antes do release; P2 = adiável ou condicionado à aprovação de metas. Tamanho relativo: S = esforço focado; M = esforço moderado; G = maior coordenação, incerteza ou cobertura.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P1 | M |
| T-02 | P0 | M |
| T-03 | P0 | S |
| T-04 | P0 | M |
| T-05 | P0 | M |
| T-06 | P0 | S |
| T-07 | P1 | S |
| T-08 | P0 | M |
| T-09 | P0 | G |
| T-10 | P0 | M |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | G |
| T-17 | P0 | G |
| T-18 | P0 | S |
| T-19 | P0 | S |
| T-20 | P0 | M |
| T-21 | P0 | M |
| T-22 | P0 | M |
| T-23 | P0 | M |
| T-24 | P0 | S |
| T-25 | P0 | S |
| T-26 | P0 | M |
| T-27 | P0 | M |
| T-28 | P0 | M |
| T-29 | P0 | M |
| T-30 | P0 | S |
| T-31 | P0 | M |
| T-32 | P1 | M |
| T-33 | P1 | M |
| T-34 | P0 | M |
| T-35 | P0 | M |
| T-36 | P0 | M |
| T-37 | P1 | G |
| T-38 | P1 | G |
| T-39 | P2 | G |
| T-40 | P1 | S |
| T-41 | P1 | S |
| T-42 | P0 | S |
| T-43 | P0 | M |

## Sequência de fatias verticais

1. **Busca visível:** T-03 → T-08 → T-10 → T-14 → T-18/T-19/T-21 → T-25. Entrega uma tela utilizável para pesquisar, ver resultados e entender loading/ausência de resultados, antes de integrar o clima.
2. **Clima atual:** T-04/T-05/T-09 → T-15/T-16 → T-20/T-22 → T-42. Ao selecionar uma cidade, a tela passa a mostrar a observação atual e o caminho de erro/retry.
3. **Previsão e unidade:** T-23/T-24 → T-43 → T-26. Completa previsão de cinco dias, alternância C/F e responsividade.
4. **Verificação e release:** executar T-06/T-07/T-11/T-12/T-13/T-17/T-27 a T-35/T-41; depois T-36 a T-40. Fazer uma verificação manual da fatia ao integrá-la; os testes automatizados continuam concentrados após as integrações conforme a ordem do backlog.

T-02 deve ser concluída antes da primeira integração para aplicar a atribuição se exigida. T-01 pode avançar em paralelo; suas decisões aprovadas alimentam os gates de hardening.

## Pré-requisitos

### T-01 — Aprovar escopo e metas do baseline
- **Descrição:** Resolver as decisões de produto e as metas não funcionais propostas que afetam o compromisso de lançamento.
- **Critérios de aceite:**
  - As Open Questions 1–4, 6 e 7 têm status aprovado, rejeitado ou adiado registrado em `specs/weather-app-spec.md`.
  - As metas NFR-03 a NFR-06 estão aprovadas ou explicitamente excluídas do compromisso de lançamento.
- **Rastreabilidade:** Open Questions 1–7; NFR-03 a NFR-06.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`.
- **Tipo:** Infra

### T-02 — Verificar termos e atribuição do Open-Meteo
- **Descrição:** Confirmar termos de uso, cobertura, limites e exigência de atribuição do provedor.
- **Critérios de aceite:**
  - Termos, licença, cobertura e limites de uso do provedor estão registrados com a fonte consultada.
  - A exigência de atribuição está registrada e, se necessária, o texto exigido está definido para a interface.
- **Rastreabilidade:** NFR-09; Open Question 5.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `plans/weather-app-plan.md`, `specs/weather-app-spec.md`.
- **Tipo:** Infra

## Entrega 1 — Tipos

### T-03 — Definir os tipos internos de clima
- **Descrição:** Criar os tipos internos para cidade, clima atual, previsão, unidade, erros e estados de requisição.
- **Critérios de aceite:**
  - `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `WeatherError` e `RequestState` estão definidos conforme o Data Model do plano; campos meteorológicos ausentes aceitam `null`.
  - Os módulos da interface importam tipos internos, sem usar tipos ou propriedades do payload bruto do Open-Meteo.
- **Rastreabilidade:** NFR-08; plano técnico, seção Data Model.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

## Entrega 2 — Funções puras

### T-04 — Implementar conversão e formatação
- **Descrição:** Criar funções puras de conversão de temperatura e formatação pt-BR de números, datas e horários locais.
- **Critérios de aceite:**
  - Para entradas `0`, `-40` e `25.5` °C, a conversão retorna, respectivamente, `32`, `-40` e `77.9` °F; `null` retorna `null`.
  - Os formatadores usam `Intl.NumberFormat` e `Intl.DateTimeFormat` com `pt-BR`; a formatação de horário recebe e aplica o fuso informado.
- **Rastreabilidade:** FR-05; CA-05b; NFR-01; NFR-08.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/format.ts`.
- **Tipo:** Data

### T-05 — Mapear códigos meteorológicos WMO
- **Descrição:** Mapear códigos WMO conhecidos para descrições em pt-BR e definir fallback.
- **Critérios de aceite:**
  - Código WMO `0` e ao menos um código de cada grupo suportado retornam descrições em pt-BR.
  - Código desconhecido ou `null` retorna `Condição indisponível` sem lançar exceção.
- **Rastreabilidade:** NFR-01; spec, Edge Cases (código meteorológico desconhecido).
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data

## Entrega 3 — Services

### T-08 — Implementar busca de localidades
- **Descrição:** Consultar a Geocoding API e mapear resultados para o tipo interno `City`.
- **Critérios de aceite:**
  - A URL contém `name`, `language=pt` e `format=json`; `  São Tomé-d'Ávila  ` é enviado sem espaços externos e com acentos, hífen e apóstrofo preservados.
  - `id`, `name`, latitude, longitude e os campos disponíveis `admin1`, `country`, `country_code` e `timezone` são mapeados para `City`.
  - Resultado sem cidades é retornado como lista vazia; termo vazio resulta em zero chamadas a `fetch`.
- **Rastreabilidade:** FR-01; CA-01a, CA-01b, CA-01c; FR-02; NFR-07.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-10 — Tratar erros HTTP, timeout e cancelamento
- **Descrição:** Padronizar erros de rede/resposta e aplicar timeout de 8 segundos e cancelamento de requisições obsoletas.
- **Critérios de aceite:**
  - Uma chamada sem resposta é abortada em 8 segundos e classificada como `timeout`; falha de `fetch`, JSON inválido e HTTP são classificados pelos tipos definidos.
  - HTTP 429 preserva o valor de `Retry-After`; HTTP 4xx/5xx e 429 não iniciam retry automático.
  - Abort por troca de consulta não é convertido em erro de rede nem em timeout.
- **Rastreabilidade:** FR-06; CA-06c, CA-06d, CA-06e, CA-06f.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-09 — Implementar consulta de clima e previsão
- **Descrição:** Consultar a Forecast API para uma cidade e converter clima atual e até cinco dias em tipos internos.
- **Critérios de aceite:**
  - A URL contém as coordenadas recebidas, `temperature_unit=celsius`, `timezone=auto`, `forecast_days=5` e os campos current/daily especificados no plano.
  - Payload completo retorna o horário e fuso atuais e exatamente cinco registros diários, mantendo as datas locais e a cidade de entrada.
  - Campo obrigatório ausente ou arrays diários com comprimentos diferentes geram `isPartial: true`; valores ausentes são `null` e nenhum valor é estimado.
- **Rastreabilidade:** FR-03; CA-03; FR-04; CA-04a, CA-04b; NFR-01; NFR-08.
- **Dependências:** T-03, T-10.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

## Entrega 4 — Hook

### T-14 — Coordenar busca no hook `useWeather`
- **Descrição:** Implementar estado e fluxo de busca de localidades, incluindo entrada vazia e resultados vazios.
- **Critérios de aceite:**
  - Busca percorre `idle → loading → success`, `empty` ou `error` conforme o resultado do serviço.
  - Busca vazia/só com espaços não chama o serviço; `  São Tomé  ` é enviado como `São Tomé` sem alterar os caracteres internos.
- **Rastreabilidade:** FR-01; CA-01a, CA-01b, CA-01c; CA-06a, CA-06b.
- **Dependências:** T-03, T-08, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-15 — Coordenar seleção e consulta meteorológica
- **Descrição:** Ligar a seleção explícita de uma cidade à consulta e aos estados independentes de clima atual e previsão.
- **Critérios de aceite:**
  - Nenhuma chamada de forecast ocorre antes da seleção; após selecionar uma cidade, a chamada usa exatamente sua latitude e longitude.
  - Clima atual e previsão mantêm estados separados; fixture com forecast parcial não apaga campos atuais válidos, nem o inverso.
- **Rastreabilidade:** FR-02; CA-02b; FR-03; CA-03; FR-04; CA-04b.
- **Dependências:** T-14, T-09.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-16 — Coordenar concorrência, retry e unidade
- **Descrição:** Impedir publicação de respostas obsoletas e coordenar retry manual e unidade de apresentação.
- **Critérios de aceite:**
  - Em teste com A atrasada e B concluída primeiro, o estado final continua associado a B; Abort de A não publica erro.
  - O contador de chamadas só aumenta após ativação explícita de retry; para 429, retry fica bloqueado até o instante de `Retry-After`.
  - Unidade inicial é `celsius`; alternar C/F não aumenta o contador de chamadas ao serviço.
- **Rastreabilidade:** CA-05a, CA-05b; CA-06c, CA-06d, CA-06e, CA-06f; NFR-08.
- **Dependências:** T-15, T-10, T-04.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

## Entrega 5 — Componentes

### T-18 — Implementar indicador de carregamento
- **Descrição:** Criar componente acessível para o estado de carregamento.
- **Critérios de aceite:**
  - Enquanto o estado recebido for `loading`, o componente renderiza mensagem pt-BR com semântica `role="status"`; ao concluir/falhar, a mensagem de carregamento desaparece.
  - Campo de busca continua presente e habilitado durante o carregamento.
- **Rastreabilidade:** CA-06a; NFR-01; NFR-03.
- **Dependências:** T-14.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI

### T-19 — Implementar estado sem resultados
- **Descrição:** Criar componente para busca sem localidades correspondentes.
- **Critérios de aceite:**
  - Para estado `empty`, renderiza mensagem de nenhuma cidade encontrada e não renderiza mensagem de falha do serviço.
  - O campo de busca permanece visível e habilitado após a mensagem.
- **Rastreabilidade:** CA-01c; CA-06b; NFR-01.
- **Dependências:** T-14.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI

### T-20 — Implementar estado de erro e retry
- **Descrição:** Criar componente para erro recuperável, timeout e indisponibilidade do provedor.
- **Critérios de aceite:**
  - Erro `timeout` e falha de rede/HTTP renderizam mensagens pt-BR distintas, sem stack trace ou detalhes internos.
  - Botão de retry só inicia nova tentativa após ativação; para 429 com `Retry-After`, permanece desabilitado até o prazo informado.
- **Rastreabilidade:** CA-06c, CA-06e, CA-06f; NFR-01; NFR-03.
- **Dependências:** T-10, T-16.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI

### T-21 — Implementar entrada de busca e resultados
- **Descrição:** Criar os componentes de entrada de cidade e de escolha explícita entre localidades encontradas.
- **Critérios de aceite:**
  - Submeter campo vazio ou só com espaços não inicia busca; termo válido mantém acentos, hífen e apóstrofo e exibe carregamento enquanto aguarda.
  - Cada resultado mostra nome e região/país quando presentes; nenhum resultado é selecionado automaticamente.
  - Campo e resultados têm nome acessível e seleção pode ser feita por teclado.
- **Rastreabilidade:** CA-01a, CA-01b, CA-02a, CA-02b; NFR-03.
- **Dependências:** T-14, T-18, T-19.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI

### T-22 — Exibir clima atual
- **Descrição:** Criar componente para localidade selecionada, temperatura atual, condição e horário observado.
- **Critérios de aceite:**
  - Com fixture completa, exibe cidade selecionada, temperatura com `°C` ou `°F`, descrição da condição e horário formatado no fuso da cidade.
  - Temperatura, código ou horário ausente é indicado como indisponível; ao trocar a cidade, nenhum dado da cidade anterior permanece visível.
- **Rastreabilidade:** CA-03; NFR-01; NFR-08.
- **Dependências:** T-04, T-05, T-15.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-23 — Exibir lista e cartões da previsão
- **Descrição:** Criar a lista de cinco dias e o componente de apresentação de cada dia.
- **Critérios de aceite:**
  - Com fixture completa, renderiza exatamente cinco datas locais consecutivas, cada uma com condição e mínima/máxima.
  - Com campo/dia ausente, renderiza `Indisponível` no valor faltante, preserva os demais valores e identifica a previsão como incompleta.
- **Rastreabilidade:** CA-04a, CA-04b; NFR-01; NFR-08.
- **Dependências:** T-04, T-05, T-15.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI

### T-24 — Implementar controle de unidade
- **Descrição:** Criar controle acessível para alternar entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Controle inicia em Celsius; ambos os valores têm nomes acessíveis e o selecionado é exposto semanticamente.
  - Alternar para Fahrenheit atualiza temperatura atual e todas as mínimas/máximas segundo `F = C × 9/5 + 32`; voltar a Celsius restaura os valores de origem sem chamada de serviço.
- **Rastreabilidade:** CA-05a, CA-05b; NFR-03; NFR-08.
- **Dependências:** T-04, T-16.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI

## Entrega 6 — Integração

### T-25 — Compor a tela principal
- **Descrição:** Integrar a primeira fatia ao `App`: busca, resultados, seleção, loading e estado sem resultados.
- **Critérios de aceite:**
  - A busca e a seleção usam `useWeather`; resultados mostram localidade e atributos geográficos disponíveis.
  - Loading e ausência de resultados são apresentados sem renderizar dados meteorológicos de outra cidade.
  - Antes de enviar uma busca, a interface informa em pt-BR que o nome da cidade será enviado ao Open-Meteo; não exige login, não persiste buscas, cidade ou preferências em servidor, e a unidade reinicia em Celsius a cada sessão.
  - A atribuição é exibida se T-02 determinar que é necessária.
- **Rastreabilidade:** FR-01, FR-02, FR-06; NFR-07; NFR-09.
- **Dependências:** T-18, T-19, T-21, T-02.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-42 — Integrar clima atual e estados de erro
- **Descrição:** Acrescentar ao `App` o clima atual da cidade selecionada e os estados de erro/retry.
- **Critérios de aceite:**
  - Após selecionar uma cidade, o painel atual mostra os dados dela; resposta atrasada de outra cidade não substitui esse painel.
  - Timeout/falha mostra `ErrorState`; retry é manual e respeita `Retry-After`.
- **Rastreabilidade:** FR-02; FR-03; FR-06; CA-03, CA-06c, CA-06d, CA-06e, CA-06f.
- **Dependências:** T-15, T-16, T-20, T-22, T-25.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-43 — Integrar previsão e unidade
- **Descrição:** Acrescentar ao `App` a previsão diária e o controle de unidade.
- **Critérios de aceite:**
  - A seleção exibe cinco dias locais ou identifica claramente dados parciais.
  - Alternar unidade atualiza clima atual e previsão sem nova chamada ao serviço.
- **Rastreabilidade:** FR-04; FR-05; FR-06; CA-04a, CA-04b, CA-05a, CA-05b.
- **Dependências:** T-23, T-24, T-42.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-26 — Aplicar layout responsivo
- **Descrição:** Implementar estilos de tela para os viewports suportados.
- **Critérios de aceite:**
  - Em larguras de 320 px, 375 px, 1024 px e 1920 px, `scrollWidth` não excede `clientWidth` e nenhum controle principal fica oculto.
  - Busca, resultados, clima atual e os cinco dias permanecem legíveis e utilizáveis nessas larguras.
- **Rastreabilidade:** NFR-02.
- **Dependências:** T-43.
- **Arquivos prováveis:** `src/styles/index.css`.
- **Tipo:** UI

## Entrega 7 — Testes

### T-06 — Testar conversão de unidade
- **Descrição:** Testar isoladamente a conversão de temperaturas entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Testes automatizados verificam as conversões `0 °C → 32 °F`, `-40 °C → -40 °F`, `25.5 °C → 77.9 °F` e `null → null`.
  - Converter repetidamente o mesmo valor Celsius sempre retorna o mesmo Fahrenheit; nenhum resultado convertido é usado como nova origem.
- **Rastreabilidade:** FR-05; CA-05b; NFR-01; NFR-08.
- **Dependências:** T-04, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-41 — Testar formatação pt-BR e fuso
- **Descrição:** Testar isoladamente a formatação de números, datas e horários.
- **Critérios de aceite:**
  - Testes confirmam o uso de `pt-BR` em números e datas.
  - Para o mesmo instante, testes verificam saídas diferentes nos fusos `UTC` e `America/Sao_Paulo`.
- **Rastreabilidade:** NFR-01; NFR-08.
- **Dependências:** T-04, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test

### T-07 — Testar mapeamento WMO
- **Descrição:** Verificar códigos meteorológicos conhecidos, desconhecidos e ausentes.
- **Critérios de aceite:**
  - Testes verificam o texto esperado para WMO `0` e para um código de precipitação.
  - Código não mapeado e `null` retornam exatamente `Condição indisponível`.
- **Rastreabilidade:** NFR-01; spec, Edge Cases (código meteorológico desconhecido).
- **Dependências:** T-05, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test

### T-11 — Testar busca de localidades
- **Descrição:** Testar parâmetros, mapeamento e lista vazia da Geocoding API com `fetch` mockado.
- **Critérios de aceite:**
  - Testes inspecionam URL e parâmetros para termo com acento, hífen e apóstrofo, além do mapeamento de coordenadas e campos geográficos opcionais.
  - Fixture `{ "results": [] }` retorna zero resultados sem rejeição; entrada vazia não chama `fetch`.
  - Todas as chamadas a `fetch` são mockadas e a suíte passa sem rede externa.
- **Rastreabilidade:** FR-01; CA-01a, CA-01b, CA-01c; FR-02; CA-02a.
- **Dependências:** T-08, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`.
- **Tipo:** Test

### T-12 — Testar consulta de clima e previsão
- **Descrição:** Testar parâmetros e conversão de payloads do Forecast API com `fetch` mockado.
- **Critérios de aceite:**
  - Testes verificam coordenadas, `temperature_unit=celsius`, `timezone=auto`, `forecast_days=5` e todos os campos solicitados.
  - Fixture completa produz cinco dias consecutivos; fixtures com campo ausente, dia faltante ou arrays desalinhados produzem `isPartial: true` e preservam valores válidos.
  - Todas as chamadas a `fetch` são mockadas e a suíte passa sem rede externa.
- **Rastreabilidade:** CA-03; CA-04a, CA-04b; NFR-08.
- **Dependências:** T-09, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/forecast.test.ts`.
- **Tipo:** Test

### T-13 — Testar erros e timeout dos serviços
- **Descrição:** Verificar classificação de erros e cancelamento nos services usando `fetch` mockado.
- **Critérios de aceite:**
  - `fetch` mockado simula falha de rede, timeout de 8 segundos, JSON inválido, HTTP 4xx, 5xx e 429 com `Retry-After`; cada resposta produz a classificação correspondente.
  - Testes confirmam zero retries automáticos e que Abort por troca de consulta não produz estado de erro.
- **Rastreabilidade:** CA-06c, CA-06d, CA-06e, CA-06f.
- **Dependências:** T-10, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/weatherServiceErrors.test.ts`.
- **Tipo:** Test

### T-17 — Testar estados do hook
- **Descrição:** Testar os fluxos de busca, seleção, requisição, erro e unidade do hook sem rede real.
- **Critérios de aceite:**
  - Testes verificam os estados `idle`, `loading`, `success`, `empty`, `partial` e `error` nos respectivos fluxos do hook.
  - Testes verificam zero chamada para entrada vazia, coordenadas da seleção, descarte de resposta obsoleta, retry acionado manualmente e zero nova requisição ao alternar unidade.
- **Rastreabilidade:** CA-01b, CA-01c, CA-02b, CA-04b, CA-05a, CA-05b, CA-06a a CA-06f.
- **Dependências:** T-14, T-15, T-16, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test

### T-27 — Testar componentes loading, erro e vazio
- **Descrição:** Testar separadamente os componentes de loading, erro/retry e ausência de resultados com Testing Library.
- **Critérios de aceite:**
  - `LoadingState` mostra estado/mensagem enquanto carrega; `EmptyState` informa ausência de resultados sem mensagem de falha; `ErrorState` distingue timeout de falha do serviço.
  - Teste do `ErrorState` confirma zero retries antes da interação e botão desabilitado durante o `Retry-After` de uma fixture 429.
- **Rastreabilidade:** CA-06a, CA-06b, CA-06c, CA-06e, CA-06f; NFR-01; NFR-03.
- **Dependências:** T-18, T-19, T-20, T-25, T-42, T-43, T-26.
- **Arquivos prováveis:** `tests/unit/components/states.test.tsx`.
- **Tipo:** Test

### T-28 — Testar busca e seleção de localidades
- **Descrição:** Cobrir entrada, renderização de resultados e seleção acessível.
- **Critérios de aceite:**
  - Testes confirmam zero submissões para vazio/espaços, preservação de `São Tomé-d'Ávila` e exibição dos atributos geográficos opcionais.
  - Com duas cidades homônimas, nenhuma é selecionada inicialmente; clique e teclado selecionam a cidade correta e passam suas coordenadas ao callback.
- **Rastreabilidade:** CA-01a, CA-01b, CA-02a, CA-02b; NFR-03.
- **Dependências:** T-21, T-25, T-26.
- **Arquivos prováveis:** `tests/unit/components/SearchBar.test.tsx`, `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test

### T-29 — Testar componentes meteorológicos
- **Descrição:** Cobrir apresentação do clima atual e dos cartões/lista de previsão.
- **Critérios de aceite:**
  - Testes de clima atual verificam temperatura/unidade, descrição e horário no fuso de fixture.
  - Testes de previsão verificam cinco datas, condição, mínima/máxima e placeholder de indisponibilidade sem ocultar valores válidos.
- **Rastreabilidade:** CA-03, CA-04a, CA-04b; NFR-01; NFR-08.
- **Dependências:** T-22, T-23, T-42, T-43, T-26.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/ForecastList.test.tsx`.
- **Tipo:** Test

### T-30 — Testar controle de unidade
- **Descrição:** Verificar seleção acessível e interação do controle Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Teste confirma Celsius selecionado inicialmente e que uma interação seleciona Fahrenheit uma vez.
  - Testes de teclado alternam a opção e verificam o estado acessível selecionado.
- **Rastreabilidade:** CA-05a, CA-05b; NFR-03.
- **Dependências:** T-24, T-43, T-26.
- **Arquivos prováveis:** `tests/unit/components/UnitToggle.test.tsx`.
- **Tipo:** Test

### T-31 — Testar fluxo principal com Playwright
- **Descrição:** Validar busca, seleção de localidade, clima atual e previsão com fixtures determinísticas.
- **Critérios de aceite:**
  - Playwright intercepta Geocoding e Forecast; ao escolher um homônimo, a requisição usa as coordenadas daquele resultado.
  - A tela apresenta clima atual e exatamente cinco dias para a cidade escolhida, sem dados de outro fixture.
  - O aviso de envio do nome da cidade ao Open-Meteo está visível antes do envio da busca.
  - O fluxo completo passa em desktop e em viewport mobile de 375 px; no mobile, `scrollWidth <= clientWidth` e busca, seleção e unidade permanecem operáveis.
- **Rastreabilidade:** CA-01a, CA-02a, CA-02b, CA-03, CA-04a; NFR-07; NFR-08.
- **Dependências:** T-25, T-26, T-42, T-43, T-28, T-29.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test

### T-32 — Testar ausência de resultados e resposta parcial em E2E
- **Descrição:** Verificar os estados de busca vazia no provedor e de payload meteorológico incompleto.
- **Critérios de aceite:**
  - Fixture de geocoding vazia exibe “nenhuma cidade encontrada”, não exibe falha de serviço e gera zero chamadas ao Forecast.
  - Fixture parcial exibe os valores disponíveis, marca cada campo ausente como indisponível e identifica a previsão como incompleta.
- **Rastreabilidade:** CA-01c, CA-04b, CA-06b; NFR-08.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/weather-states.spec.ts`.
- **Tipo:** Test

### T-33 — Testar falhas e retry em E2E
- **Descrição:** Verificar timeout/indisponibilidade, ação de retry e resposta HTTP 429.
- **Critérios de aceite:**
  - Fixtures de timeout, rede/5xx e 429 exibem estados de falha distintos de `empty`; a contagem de chamadas não aumenta sem interação.
  - Retry manual aumenta a contagem de chamadas em um; para 429, não pode ser acionado antes do `Retry-After`.
- **Rastreabilidade:** CA-06b, CA-06c, CA-06e, CA-06f.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`.
- **Tipo:** Test

### T-34 — Testar respostas fora de ordem em E2E
- **Descrição:** Simular resposta atrasada da cidade anterior após uma nova seleção.
- **Critérios de aceite:**
  - Com resposta A atrasada e B selecionada/concluída primeiro, após ambas terminarem permanecem visíveis o nome e os dados de B.
- **Rastreabilidade:** CA-06d; NFR-08.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/weather-race.spec.ts`.
- **Tipo:** Test

### T-35 — Testar responsividade em E2E
- **Descrição:** Verificar os fluxos principais nos viewports móveis e desktop definidos na spec.
- **Critérios de aceite:**
  - Fluxo principal é executado em 320 px, 375 px, 1024 px e 1920 px.
  - Em cada viewport, `scrollWidth <= clientWidth`, busca/seleção/unidade são operáveis e os cinco dias podem ser inspecionados sem controles ocultos.
- **Rastreabilidade:** NFR-02.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`.
- **Tipo:** Test

## Entrega 8 — Hardening

### T-36 — Executar lint, build e suíte automatizada
- **Descrição:** Confirmar os gates automatizados do projeto antes do release.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` retornam código de saída `0`.
  - Qualquer bloqueio de ambiente ou falha conhecida é identificado pelo comando e registrado; nenhuma etapa é marcada como aprovada sem execução bem-sucedida.
- **Rastreabilidade:** Plano técnico, seção Quality; gates do projeto em `.github/copilot-instructions.md`.
- **Dependências:** T-06, T-07, T-11, T-12, T-13, T-17, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-41, T-42, T-43.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-37 — Verificar compatibilidade de navegadores
- **Descrição:** Executar os fluxos críticos na matriz de navegadores aprovada.
- **Critérios de aceite:**
  - Fluxos críticos são executados nas versões estáveis atual e anterior de Chrome, Edge, Firefox e Safari desktop, Safari iOS e Chrome Android, conforme matriz aprovada em T-01.
  - Cada falha é registrada com navegador/versão, dispositivo, fluxo e resultado observado.
- **Rastreabilidade:** NFR-06; decisão de matriz em T-01.
- **Dependências:** T-01, T-35, T-36.
- **Arquivos prováveis:** `playwright.config.ts`, `README.md`.
- **Tipo:** Infra

### T-38 — Auditar acessibilidade dos fluxos principais
- **Descrição:** Combinar verificação automatizada e revisão manual de teclado, foco, nomes acessíveis e contraste.
- **Critérios de aceite:**
  - Auditoria automatizada dos fluxos principais registra zero violações classificadas como críticas.
  - Checklist registra resultado aprovado/reprovado para operação por teclado, foco visível, nomes acessíveis e contraste.
- **Rastreabilidade:** NFR-03.
- **Dependências:** T-17, T-27, T-28, T-29, T-30, T-31, T-36.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra

### T-39 — Medir metas de desempenho e disponibilidade
- **Descrição:** Medir as metas não funcionais aprovadas em ambiente de staging e separar falhas do app das falhas do provedor.
- **Critérios de aceite:**
  - Em 100 execuções de staging com o serviço externo respondendo em até 1 segundo, p95 entre envio e resultado/estado final é calculado e comparado ao limite aprovado de 3 segundos; erros e timeouts são reportados à parte.
  - A disponibilidade mensal do carregamento do app é comparada à meta aprovada de 99,5%; sucesso das consultas meteorológicas é reportado separadamente, incluindo falhas do provedor.
- **Rastreabilidade:** NFR-04; NFR-05; aprovação de metas em T-01.
- **Dependências:** T-01, T-31, T-36.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra

### T-40 — Executar smoke test controlado do provedor
- **Descrição:** Validar o contrato publicado do Open-Meteo fora da suíte automatizada mockada, quando necessário para o release.
- **Critérios de aceite:**
  - Se o smoke test for necessário, uma chamada controlada a cada endpoint é executada e o resultado/data são registrados; caso contrário, a dispensa e sua justificativa ficam registradas.
  - Suítes unitária e E2E continuam sem dependência de rede real; limitações observadas não são descritas como garantias de disponibilidade ou precisão.
- **Rastreabilidade:** NFR-09; plano técnico, seção Testing Strategy e Risks & Trade-offs.
- **Dependências:** T-02, T-08, T-09, T-36.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra