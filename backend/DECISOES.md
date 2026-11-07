# DECISOES — estacionamento-backend

Projeto Maven **Java 25 / Spring Boot 4.1.2**, pacote `br.com.estacionamento`, criado
seguindo a skill `java-spring` (arquitetura `config` / `core` / `entrypoint.rest`,
injeção por construtor, records para DTOs, `ApiError` + `@RestControllerAdvice`,
falhas de domínio explícitas). Reescrita moderna do sistema Delphi/Paradox de
controle de estacionamento presente na pasta pai.

## Persistência

Spring Data JPA + PostgreSQL (`kamehouse_main`, mesmo servidor do profileadmin,
configurável via `POSTGRES_URI`/`POSTGRES_USERNAME`/`POSTGRES_PASSWORD`).
`@EntityGraph` evita lazy loading fora de transação (`open-in-view=false`).

## Autenticação

OAuth2 Resource Server validando JWTs emitidos pelo Authentik
(`spring.security.oauth2.resourceserver.jwt.issuer-uri`, default
`https://auth.kamehouse.com.br/application/o/estacionamento/`), mesmo padrão do
profileadmin. Todos os endpoints `/api/**` exigem Bearer token;
`OidcJwtAuthenticationConverter` mapeia claims `groups`/`roles` para
`ROLE_*` e usa `preferred_username` como principal. CORS é tratado na
`SecurityFilterChain` (`estacionamento.cors.origins`).

## Mapeamento do legado

| Paradox | Entidade JPA | Observação |
|---|---|---|
| tbServico | `Servico` | data+hora unificadas em `dataHoraEntrada`/`dataHoraSaida`; `vencimentoPrePago` substitui `VencPago` |
| tbCliente | `Cliente` | `CodCliente` → `id` identity |
| tbValor | `Configuracao` | linha única (id=1): empresa, mensagens e tabela de preços |
| tbRecebimentos | `Recebimento` | `natureza`: PARTICULAR, PRE_PAGO, FATURA |
| tbReceber | `ContaReceber` | faturas de convênio, `situacao` ABERTA/PAGA |
| tbExclusoes | `Exclusao` | auditoria de exclusões |
| tbCaixa | — | substituída por resumo calculado em `/api/caixa/resumo` |

`Tipo` (P/G/C) → `TipoServico` (PARTICULAR/PRE_PAGO/CONVENIO); `Especie` (H/D) →
`EspecieCobranca` (HORA/DIARIA); `Itens` (lavação) → `TipoLavacao`
(INTERNA/EXTERNA/COMPLETA).

## Regras portadas (uservico.pas / UDataModulo.pas)

- **Entrada**: número sequencial (`entradaN` = max+1), placa+veículo obrigatórios
  (Bean Validation). Regra nova: impede duas contas abertas para a mesma placa.
- **Fechamento por hora** (`FechaHoraExecute`): mínimo 1h; fração restante
  **> 10 min** cobra hora inteira (`estacionamento.tolerancia-minutos`).
- **Fechamento por diária** (`FechaDiaExecute`): dias cheios + horas do restante
  quando resto > 10 min.
- **Lavação** (`LavacaoExecute`): permanência > 130 min bonifica 2h de
  estacionamento; permanência menor não cobra estacionamento. No legado o
  recálculo usava sempre o valor cadastrado; aqui usa-se o valor unitário
  efetivo (override ou cadastro).
- **Pré-pago** (`EntraPagoExecute`/`FechaPagoExecute`): pago na entrada, gera
  `vencimentoPrePago`; saída após vencimento+10min abre conta complementar
  PARTICULAR/HORA a partir do vencimento e a fecha.
- **Convênio** (`FechaConvenioExecute`): fechamento gera `ContaReceber` (ABERTA)
  em vez de recebimento; pagamento (`/pagamento`) marca PAGA e gera recebimento
  FATURA.
- **SubTotal/Total**: soma dos itens menos desconto (`GeraPagoExecute`).
- **Valores**: override por transação tem precedência sobre o cadastro; ausência
  de valor unitário necessário falha explicitamente (`NegocioException`).
- **Exclusão** (`TBServicoBeforeDelete`): justificativa obrigatória → `Exclusao`
  + remoção dos recebimentos vinculados à `entradaN`.

## Erros

`ApiError` (instante, status, mensagem, caminho, violações): 400 validação/corpo,
404 `RecursoNaoEncontradoException`, 422 `NegocioException`/
`ServicoJaFechadoException`, 500 demais.

## Observações técnicas

- Jackson 3: `FAIL_ON_NULL_FOR_PRIMITIVES` vem ligado — DTOs usam `Boolean` e
  wrappers, nunca primitivos em records de request.
- Lombok (`@RequiredArgsConstructor`, `@Getter/@Setter`) nas classes Spring e
  entidades; MapStruct omitido (conversões pontuais via `of()` nos DTOs).

## Propriedades

| Propriedade | Default | Uso |
|---|---|---|
| `estacionamento.cors.origins` | `http://localhost:*,http://127.0.0.1:*` | CORS do frontend Angular |
| `estacionamento.tolerancia-minutos` | `10` | tolerância de arredondamento de hora |
| `POSTGRES_URI` / `spring.datasource.url` | `jdbc:postgresql://144.91.72.60:5432/kamehouse_main` | banco Postgres |
| `POSTGRES_USERNAME` / `POSTGRES_PASSWORD` | `kamehouse` | credenciais do banco |
| `KEYCLOAK_URI` / `...jwt.issuer-uri` | `https://auth.kamehouse.com.br/application/o/estacionamento/` | issuer OIDC Authentik |

## Endpoints

`GET/POST /api/servicos`, `GET/DELETE /api/servicos/{id}`,
`POST /api/servicos/{id}/fechamento`; CRUD `/api/clientes`;
`GET/PUT /api/configuracao`; `GET /api/recebimentos`, `GET /api/caixa/resumo`,
`GET /api/contas-receber`, `POST /api/contas-receber/{id}/pagamento`;
`GET /api/exclusoes`. Todos exigem Bearer token (Authentik).

## Validação

`./mvnw test` — 22 testes (CalculoTarifaTest, ServicoUsecaseTest,
ServicoControllerTest @WebMvcTest com `.with(jwt())` + `@Import(SecurityConfig)`).
Smoke test manual: `spring-boot:run` conecta no Postgres e exige JWT
(GET /api/servicos sem token → 401).
