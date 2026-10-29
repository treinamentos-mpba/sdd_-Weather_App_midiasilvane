# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação para consultar informações meteorológicas por cidade. Usuários devem poder pesquisar cidades, visualizar o clima atual e a previsão para cinco dias, alternar entre Celsius e Fahrenheit e utilizar a aplicação em dispositivos móveis.

O briefing estabelece as capacidades centrais do produto. As decisões já tomadas estão registradas na seção **Decisões**; ainda faltam definições sobre público-alvo, detalhes da busca, conteúdo meteorológico a exibir e requisitos operacionais.

## Personas

Estas personas são hipóteses para orientar a descoberta e ainda precisam ser validadas com usuários.

- **Pessoa em deslocamento diário:** quer verificar rapidamente as condições antes de sair. Usa principalmente o celular; considera sucesso encontrar a previsão da cidade certa e decidir como se preparar em menos de 30 segundos.
- **Planejadora de viagem curta:** quer consultar os próximos dias para planejar atividades e bagagem. Usa desktop durante o planejamento e celular durante a viagem; considera sucesso encontrar as condições da cidade e das datas desejadas sem confundir localidades ou unidades.
- **Pessoa que trabalha ao ar livre:** quer verificar as condições atuais e próximas para organizar atividades externas. Usa principalmente o celular, possivelmente em campo e com conexão limitada; considera sucesso consultar informações atualizadas e entender quando foram obtidas.

## Requisitos Funcionais

- Permitir que o usuário busque cidades.
- Exibir o clima atual da cidade selecionada.
- Exibir a previsão do tempo para cinco dias.
- Permitir alternar a unidade de temperatura entre Celsius e Fahrenheit.
- Oferecer uma experiência utilizável em dispositivos móveis.

## Requisitos Não-Funcionais

- **Responsividade:** a interface deve se adaptar a dispositivos móveis.
- **Usabilidade:** busca, consulta da previsão e troca de unidade devem ser fáceis de compreender e utilizar.
- **Desempenho:** os resultados devem ser apresentados em tempo adequado; a meta ainda precisa ser definida.
- **Confiabilidade:** a aplicação deve tratar falhas da fonte de dados e indisponibilidade de rede de forma compreensível.
- **Acessibilidade:** o nível de conformidade e os critérios específicos ainda precisam ser definidos.

## Riscos

- A fonte de dados meteorológicos pode sofrer indisponibilidade, latência ou impor limites de uso.
- Cidades com nomes iguais ou semelhantes podem gerar resultados ambíguos.
- A cobertura ou atualização dos dados meteorológicos pode variar por região.
- A granularidade da previsão (diária, horária ou ambas) ainda pode gerar interpretações diferentes.
- A experiência em dispositivos móveis pode ser afetada por conexões lentas e diferentes tamanhos de tela.
- A ausência de critérios de acessibilidade pode resultar em uma experiência excludente.

## Perguntas em Aberto

- Quem é o público-alvo e quais regiões geográficas serão atendidas?
- A busca aceitará nomes de cidades apenas ou também estados, países e códigos postais?
- Como o usuário escolherá entre cidades com nomes iguais ou semelhantes?
- Quais informações devem aparecer no clima atual e na previsão?
- A previsão de hoje mais os quatro dias seguintes será diária, horária ou terá as duas visualizações? Como serão tratados fuso horário e dia parcial?
- Quais limites de uso, requisitos de atribuição, licença ou cobertura do Open-Meteo precisam ser considerados?
- A unidade escolhida deve ser mantida no navegador entre visitas ou sessões?
- Deve haver uma cidade padrão, localização automática ou opção para salvar cidades favoritas?
- Como a aplicação deve responder a buscas sem resultados, falhas de conexão ou dados indisponíveis?
- Quais navegadores e dispositivos precisam ser suportados?
- Quais metas de desempenho, disponibilidade e acessibilidade devem ser atendidas?

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Justificativa: seleciona uma fonte que não exige chave de API. Resolve a escolha inicial do provedor; ainda devem ser verificados limites de uso, requisitos de atribuição, licença e cobertura.
- **Período da previsão: hoje mais os quatro dias seguintes.** Justificativa: define de forma objetiva o intervalo de cinco dias. Resolve a interpretação do período; a granularidade diária ou horária e o tratamento de fuso horário continuam em aberto.
- **Unidade padrão: Celsius.** Justificativa: estabelece um valor inicial consistente para a interface em pt-BR. Resolve a definição da unidade apresentada na primeira consulta; persistir a preferência do usuário no navegador continua em aberto.
- **Sem autenticação e sem persistência de servidor.** Justificativa: mantém o escopo sem contas de usuário e sem armazenamento de dados de usuário no servidor. Resolve se haverá login ou dados persistidos no servidor; armazenamento local no navegador não foi definido.
- **Idioma da interface: pt-BR.** Justificativa: define o idioma inicial da experiência. Resolve a escolha do idioma da UI; formatos de data, hora e outras convenções de localização ainda devem ser especificados.

## Suposições

- A busca será feita pelo nome da cidade.
- O usuário selecionará uma cidade antes de consultar as informações meteorológicas.
- O período da previsão corresponde a hoje mais os quatro dias seguintes.
- Celsius e Fahrenheit se aplicam aos valores de temperatura exibidos.
- A aplicação será acessada por navegador em desktop e dispositivos móveis.
- A interface será apresentada em pt-BR.
