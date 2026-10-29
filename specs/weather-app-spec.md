# Especificação de Produto: Weather App

## Overview

O Weather App é uma aplicação web em pt-BR para pesquisar uma cidade e consultar o clima atual e a previsão diária de hoje mais os quatro dias seguintes. O usuário pode alternar temperaturas entre Celsius e Fahrenheit. A fonte definida é Open-Meteo, sem API key.

O MVP não exige conta e não persiste dados de usuário em servidor. Deve funcionar em desktop e dispositivos móveis. A previsão diária e as metas de qualidade abaixo são propostas de baseline; as aprovações pendentes estão listadas em **Open Questions** e são necessárias antes do compromisso de produção.

## Functional Requirements

- **FR-01 — Buscar cidades.** Aceitar nome de cidade, remover espaços externos sem remover acentos ou pontuação válida e consultar a geocodificação do Open-Meteo. Uma busca vazia não deve ser enviada.
- **FR-02 — Selecionar a cidade.** Permitir selecionar um resultado e usar a identidade geográfica desse resultado nas consultas seguintes. Exibir nome da cidade e, quando disponíveis, região administrativa e país.
- **FR-03 — Consultar o clima atual.** Para a cidade selecionada, exibir temperatura, unidade, condição meteorológica em pt-BR e horário da observação no fuso local da cidade.
- **FR-04 — Consultar a previsão de cinco dias.** Exibir dados diários para hoje e os quatro dias seguintes, segundo o calendário local da cidade selecionada. Cada data deve conter condição meteorológica e temperaturas mínima e máxima.
- **FR-05 — Alternar unidade de temperatura.** Iniciar em Celsius e permitir alternar entre Celsius e Fahrenheit para a temperatura atual e todas as mínimas e máximas. Converter a partir dos valores de origem, sem conversões cumulativas entre alternâncias.
- **FR-06 — Comunicar estados da consulta.** Exibir carregamento, ausência de resultados, resposta parcial, timeout e falha do provedor em estados distintos. Falha recuperável deve oferecer retry; resposta vazia de geocodificação não é falha de API. Nunca apresentar dados de outra cidade ou dados antigos como atuais.

## User Stories

- **US-01:** Como pessoa em deslocamento diário, quero buscar uma cidade pelo nome para encontrar as condições do lugar certo. **Requisito relacionado:** FR-01.
- **US-02:** Como pessoa em deslocamento diário, quero distinguir e selecionar a cidade correta entre resultados semelhantes para não consultar a previsão de outra localidade. **Requisito relacionado:** FR-02.
- **US-03:** Como pessoa em deslocamento diário, quero ver o clima atual da cidade selecionada para decidir como me preparar antes de sair. **Requisito relacionado:** FR-03.
- **US-04:** Como planejadora de viagem curta, quero consultar a previsão diária de hoje e dos quatro dias seguintes para planejar atividades e bagagem. **Requisito relacionado:** FR-04.
- **US-05:** Como pessoa que trabalha ao ar livre, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro. **Requisito relacionado:** FR-05.
- **US-06:** Como pessoa que trabalha ao ar livre, quero entender quando os dados estão carregando ou indisponíveis para saber se posso usá-los no planejamento das minhas atividades. **Requisito relacionado:** FR-06.

## Acceptance Criteria

- **CA-01a (FR-01)**
	- **Given** que o usuário informa um nome de cidade com espaços externos e/ou caracteres válidos, como acentos, hífen ou apóstrofo
	- **When** envia a busca
	- **Then** a aplicação remove apenas os espaços externos, preserva os caracteres do nome e exibe os resultados retornados pelo Open-Meteo.
- **CA-01b (FR-01)**
	- **Given** que o campo de busca está vazio ou contém apenas espaços
	- **When** o usuário tenta enviar a busca
	- **Then** nenhuma consulta é enviada ao provedor e a interface solicita um nome de cidade.
- **CA-01c (FR-01)**
	- **Given** que a geocodificação responde com uma lista vazia
	- **When** a busca termina
	- **Then** a interface informa que nenhuma cidade foi encontrada e não envia consulta meteorológica.
- **CA-02a (FR-02)**
	- **Given** que a busca retorna cidades homônimas com regiões ou países diferentes
	- **When** a lista de resultados é exibida
	- **Then** cada resultado mostra o nome da cidade e os dados de região e país disponíveis para distingui-lo.
- **CA-02b (FR-02)**
	- **Given** que há resultados de busca disponíveis
	- **When** o usuário seleciona um resultado
	- **Then** a localidade selecionada é exibida como contexto e suas coordenadas são usadas para consultar o clima.
- **CA-03 (FR-03)**
	- **Given** que uma localidade foi selecionada e o provedor retornou temperatura, código de condição e horário da observação
	- **When** a consulta termina
	- **Then** a interface exibe temperatura, unidade, descrição da condição em pt-BR e horário local, todos vinculados à localidade selecionada.
- **CA-04a (FR-04)**
	- **Given** que o provedor retorna cinco registros diários completos a partir da data local atual da cidade
	- **When** a previsão é carregada
	- **Then** são exibidas exatamente cinco datas locais consecutivas, cada uma com condição meteorológica, temperatura mínima e temperatura máxima.
- **CA-04b (FR-04)**
	- **Given** que falta um ou mais registros diários ou um campo obrigatório da previsão
	- **When** a previsão é carregada
	- **Then** os valores ausentes são marcados como indisponíveis, os dados válidos permanecem visíveis e a previsão é identificada como incompleta; nenhum valor é estimado ou inventado.
- **CA-05a (FR-05)**
	- **Given** que uma nova sessão da aplicação é iniciada
	- **When** os dados meteorológicos são exibidos
	- **Then** as temperaturas são apresentadas em Celsius e identificadas com `°C`.
- **CA-05b (FR-05)**
	- **Given** que temperaturas de origem conhecidas estão sendo exibidas em Celsius
	- **When** o usuário seleciona Fahrenheit
	- **Then** temperatura atual, mínimas e máximas correspondem a `F = C × 9/5 + 32` e são identificadas com `°F`; ao voltar para Celsius, os valores originais são restaurados, sem desvio acumulado.
- **CA-06a (FR-06)**
	- **Given** que uma busca ou consulta meteorológica foi enviada e ainda não foi concluída
	- **When** a aplicação aguarda a resposta
	- **Then** um indicador de carregamento fica visível até a resposta ou falha.
- **CA-06b (FR-06)**
	- **Given** que a geocodificação respondeu sem resultados
	- **When** a aplicação processa a resposta
	- **Then** informa que nenhuma cidade foi encontrada, mantém a busca disponível e não apresenta mensagem de falha do serviço.
- **CA-06c (FR-06)**
	- **Given** que uma consulta falhou por erro de rede ou resposta 5xx do provedor
	- **When** a aplicação recebe a falha
	- **Then** informa que os dados estão temporariamente indisponíveis e exibe retry; retry só envia nova consulta após ação explícita do usuário.
- **CA-06e (FR-06)**
	- **Given** que uma consulta permanece sem resposta por 8 segundos
	- **When** o limite de espera é atingido
	- **Then** a consulta é encerrada, a interface informa timeout e oferece retry; nenhuma tentativa automática adicional é iniciada.
- **CA-06f (FR-06)**
	- **Given** que o provedor retorna HTTP 429 ou erro 4xx não causado por falha transitória
	- **When** a resposta é processada
	- **Then** a interface informa indisponibilidade sem iniciar retry automático; a ação de retry respeita `Retry-After` quando fornecido.
- **CA-06d (FR-06)**
	- **Given** que uma consulta da cidade A ainda está pendente e o usuário seleciona a cidade B
	- **When** a resposta atrasada da cidade A chega depois da seleção de B
	- **Then** os dados de A não substituem o contexto nem os dados de B.

## Non-Functional Requirements

- **NFR-01 — Idioma e localização:** toda mensagem, estado e descrição meteorológica deve estar em pt-BR. Datas e números seguem convenções brasileiras; o dia da previsão é calculado no fuso da cidade.
- **NFR-02 — Responsividade:** os fluxos de busca, seleção, consulta e alternância devem funcionar entre 320 px e 1920 px, sem rolagem horizontal nem controles ocultos. Verificação: executar os fluxos nos extremos e em um viewport intermediário.
- **NFR-03 — Acessibilidade:** atender WCAG 2.2 nível AA nos fluxos principais. Verificação: auditoria automatizada sem violações críticas e teste manual de teclado, foco visível, nomes acessíveis e contraste; o critério de conformidade completo requer aprovação.
- **NFR-04 — Desempenho:** meta proposta: p95 de até 3 segundos entre envio da busca/consulta e renderização do resultado ou estado final, medido em 100 execuções de staging com serviço externo respondendo em até 1 segundo. Reportar separadamente erros e timeouts.
- **NFR-05 — Disponibilidade:** meta proposta de 99,5% mensal para carregamento da aplicação, excluindo o provedor. Medir separadamente a taxa de consultas meteorológicas bem-sucedidas, incluindo falhas do provedor, para não ocultar indisponibilidade percebida pelo usuário.
- **NFR-06 — Compatibilidade:** suportar versões estáveis atual e anterior de Chrome, Edge, Firefox e Safari em desktop, Safari em iOS e Chrome em Android. Verificar os fluxos críticos em cada navegador da matriz.
- **NFR-07 — Privacidade e acesso:** não exigir conta ou autenticação e não persistir buscas, cidades selecionadas ou preferências em servidor. Informar que o nome da cidade pesquisada é enviado ao Open-Meteo. Persistência local de preferências não faz parte deste baseline.
- **NFR-08 — Integridade de dados:** não associar resposta a localidade diferente da selecionada; exibir datas no fuso local; nunca estimar campos ausentes nem rotular dados parciais como completos.
- **NFR-09 — Dependência externa:** antes do lançamento, validar cobertura, limites, termos, licença e atribuição exigida pelo Open-Meteo; registrar a atribuição na interface se os termos exigirem.

As metas de NFR-03 a NFR-06 são propostas testáveis, mas precisam de aprovação dos responsáveis antes de se tornarem compromissos de produção.

## Requirements Traceability

| User Story | Requisito funcional | Acceptance Criteria | NFRs relevantes |
| --- | --- | --- | --- |
| US-01 — Buscar cidade | FR-01 | CA-01a, CA-01b, CA-01c, CA-06a, CA-06b | NFR-01 (pt-BR), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-04 (desempenho), NFR-06 (compatibilidade), NFR-07 (privacidade), NFR-09 (Open-Meteo) |
| US-02 — Distinguir e selecionar localidade | FR-02 | CA-02a, CA-02b, CA-06d | NFR-01 (localização), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-06 (compatibilidade), NFR-08 (integridade dos dados) |
| US-03 — Consultar clima atual | FR-03 | CA-03, CA-06a, CA-06d | NFR-01 (idioma, formato e fuso), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-04 (desempenho), NFR-05 (disponibilidade), NFR-06 (compatibilidade), NFR-08 (integridade), NFR-09 (dependência externa) |
| US-04 — Consultar previsão diária | FR-04 | CA-04a, CA-04b | NFR-01 (idioma e fuso), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-04 (desempenho), NFR-05 (disponibilidade), NFR-06 (compatibilidade), NFR-08 (integridade), NFR-09 (dependência externa) |
| US-05 — Alternar unidade | FR-05 | CA-05a, CA-05b | NFR-01 (formatação), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-06 (compatibilidade), NFR-08 (integridade dos valores) |
| US-06 — Entender carregamento e falhas | FR-06 | CA-04b, CA-06a, CA-06b, CA-06c, CA-06d, CA-06e, CA-06f | NFR-01 (mensagens pt-BR), NFR-02 (responsividade), NFR-03 (acessibilidade), NFR-04 (desempenho), NFR-05 (disponibilidade), NFR-06 (compatibilidade), NFR-08 (integridade), NFR-09 (dependência externa) |

Os critérios CA-04b, CA-06a, CA-06b e CA-06d são transversais: aparecem em mais de uma story porque cobrem, respectivamente, dados parciais, carregamento, busca sem resultados e respostas fora de ordem.

## Edge Cases

- Busca vazia ou só com espaços: não enviar requisição e solicitar um nome de cidade.
- Cidade inexistente ou geocoding sem resultados: mostrar estado sem resultados; não tratar como falha de API nem consultar previsão.
- Nome com acentos, hífen ou apóstrofo: preservar caracteres e enviar consulta válida; não remover pontuação que faça parte do nome.
- Cidades homônimas: distinguir por região e país disponíveis; não selecionar automaticamente uma correspondência ambígua.
- Erro de rede, HTTP 5xx ou timeout: encerrar a consulta, mostrar indisponibilidade e permitir retry manual.
- HTTP 429: não repetir automaticamente; respeitar `Retry-After` antes de permitir nova tentativa.
- HTTP 4xx não transitório: informar falha sem oferecer retry automático.
- Resposta parcial: exibir somente valores válidos, marcar faltantes como indisponíveis e identificar a previsão como incompleta.
- Código meteorológico desconhecido: exibir descrição genérica em pt-BR sem interromper os demais dados válidos.
- Virada de data ou fuso: derivar as cinco datas do calendário local da cidade selecionada.
- Alternância C/F repetida: converter sempre a partir do valor de origem para evitar erro acumulado.
- Respostas fora de ordem: descartar resposta de cidade/busca anterior e manter o resultado da seleção mais recente.

## Assumptions

- A aplicação será web, acessada por navegadores em desktop e dispositivos móveis; não há requisito confirmado para aplicativo nativo ou PWA.
- A busca inicial será por nome de cidade e o usuário escolherá explicitamente um resultado; não haverá geolocalização automática no MVP.
- A previsão diária para hoje mais quatro dias é o baseline proposto; deve ser aprovada antes do desenvolvimento, pois previsão horária está fora do MVP.
- O conteúdo mínimo de clima atual será temperatura e condição; o mínimo da previsão será condição e temperaturas mínima e máxima. Outros indicadores não estão incluídos sem validação.
- Celsius é a unidade inicial; preferências não são persistidas neste baseline.
- Os dados meteorológicos estarão disponíveis conforme cobertura e resposta do Open-Meteo. A aplicação não deve prometer precisão ou atualização em tempo real não garantidas pelo provedor.
- As metas de desempenho, disponibilidade, acessibilidade e a matriz de navegadores são propostas a validar.

## Risks

- **Dependência do Open-Meteo:** indisponibilidade, limite de uso, alteração de contrato, cobertura insuficiente ou requisito de atribuição pode afetar a experiência ou o lançamento. Mitigação: verificar termos e limites, monitorar falhas e manter estados de erro; reavaliar o provedor se necessário.
- **Ambiguidade geográfica:** nome de cidade isolado pode corresponder a várias localidades. Mitigação: incluir região e país nos resultados quando disponíveis e validar o fluxo com consultas ambíguas.
- **Interpretação da previsão:** granularidade diária foi assumida, não confirmada. Mitigação: validar a decisão antes de congelar critérios de aceite e integração.
- **Qualidade e atualidade dos dados:** cobertura, atraso ou campos ausentes podem levar a informação incompleta ou enganosa. Mitigação: verificar cobertura da região-alvo, exibir estados de indisponibilidade e evitar apresentar dados antigos como atuais.
- **Metas não aprovadas:** limites de performance, disponibilidade e acessibilidade são propostas. Mitigação: obter aprovação dos responsáveis antes de usá-los como compromissos de lançamento.
- **Público e região não definidos:** pt-BR não determina que a cobertura seja limitada ao Brasil. Mitigação: confirmar regiões prioritárias e validar a geocodificação nessas localidades.
- **Escopo de dados insuficiente:** os campos mínimos propostos podem não atender às necessidades de usuários finais. Mitigação: validar conteúdo com stakeholders e usuários antes de expandir o escopo.

## Out of Scope

- Autenticação, criação de conta e perfil de usuário.
- Persistência de dados de usuário em servidor.
- Favoritos, histórico de buscas ou sincronização entre dispositivos.
- Geolocalização automática do dispositivo.
- Previsão horária, alertas meteorológicos e notificações.
- Mapas meteorológicos, qualidade do ar e dados climáticos históricos.
- Interface em idiomas diferentes de pt-BR.
- Aplicativos nativos para iOS ou Android; a necessidade de PWA também não está confirmada.
- Garantia de disponibilidade ou precisão dos dados fornecidos pelo serviço externo.

## Open Questions

1. Quais segmentos e regiões são prioritários para o lançamento?
2. Stakeholders aprovam previsão diária como baseline e previsão horária fora do MVP?
3. Temperatura/condição atual e condição/mínima/máxima diária são suficientes para o MVP?
4. As metas propostas de WCAG 2.2 AA, p95 de 3 segundos, disponibilidade de 99,5%, timeout de 8 segundos e matriz de navegadores são aprovadas?
5. Os termos do Open-Meteo permitem o uso previsto e exigem atribuição visível? Quais limites de uso se aplicam?
6. Há um limite máximo de idade dos dados atuais além da exibição do horário de observação?
7. Há restrições de prazo, orçamento, hospedagem ou política corporativa que alterem este baseline?
