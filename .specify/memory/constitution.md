<!--
## Sync Impact Report
- **Version change**: N/A → 1.0.0
- **Added principles**:
  1. Cobertura de Testes Obrigatória
  2. DRY (Don't Repeat Yourself)
  3. README Completo
  4. Regras de Negócio Documentadas
  5. Cenários de Teste E2E Documentados
- **Added sections**: Principles (5), Governance
- **Removed sections**: None
- **Templates requiring updates**: N/A (no templates exist yet)
- **Follow-up TODOs**: None
-->

# Project Constitution — jogo-carta-fodinha

**Version**: 1.0.0
**Ratification Date**: 2026-04-12
**Last Amended Date**: 2026-04-12

---

## Principles

### 1. Cobertura de Testes Obrigatória

Toda alteração de código MUST ter cobertura de testes correspondente.
Nenhum pull request será aceito sem testes que validem as mudanças introduzidas.

- Novas funcionalidades MUST incluir testes unitários e/ou de integração.
- Correções de bugs MUST incluir testes que reproduzam o cenário corrigido.
- Refatorações MUST manter ou aumentar a cobertura de testes existente.

**Rationale**: Testes garantem a estabilidade do projeto e previnem regressões,
permitindo evolução contínua com confiança.

### 2. DRY (Don't Repeat Yourself)

O código MUST seguir o princípio DRY — toda lógica MUST ter uma única
representação no sistema.

- Duplicação de lógica MUST ser eliminada através de abstrações adequadas.
- Funções utilitárias MUST ser reutilizadas em vez de reescritas.
- Configurações MUST ser centralizadas, não espalhadas pelo código.

**Rationale**: Código duplicado aumenta o custo de manutenção e a probabilidade
de bugs por alterações inconsistentes.

### 3. README Completo

O arquivo `README.md` MUST conter todas as informações necessárias para
qualquer desenvolvedor entender e executar o projeto.

- MUST incluir descrição do projeto e suas regras de jogo.
- MUST incluir instruções de como executar o projeto localmente.
- MUST incluir links para documentação complementar.
- MUST ser atualizado sempre que houver mudanças relevantes.

**Rationale**: Um README completo reduz a barreira de entrada para novos
colaboradores e serve como ponto central de documentação.

### 4. Regras de Negócio Documentadas

Todas as regras de negócio do projeto MUST estar mapeadas no arquivo
`docs/business-rules.md` e linkadas no README.

- Cada regra MUST ter identificador único, descrição e comportamento esperado.
- Novas regras MUST ser documentadas antes ou junto com a implementação.
- Alterações em regras existentes MUST ser refletidas no documento.

**Rationale**: Documentação explícita de regras de negócio garante alinhamento
entre especificação e implementação, e facilita validação e auditoria.

### 5. Cenários de Teste E2E Documentados

Todos os cenários de teste end-to-end MUST estar mapeados no arquivo
`docs/e2e-test-scenarios.md` e linkados no README.

- Cada cenário MUST descrever pré-condições, passos e resultado esperado.
- Novos fluxos de usuário MUST ter cenários E2E correspondentes documentados.
- Cenários MUST ser mantidos em sincronia com as regras de negócio.

**Rationale**: Cenários E2E documentados garantem que o sistema funciona
corretamente de ponta a ponta e servem como especificação executável.

---

## Governance

### Amendment Procedure

1. Propor alteração via pull request modificando este arquivo.
2. Descrever a mudança e justificativa na descrição do PR.
3. Aprovação de pelo menos um mantenedor do projeto.
4. Atualizar a versão conforme política de versionamento abaixo.

### Versioning Policy

Este documento segue versionamento semântico:

- **MAJOR**: Remoção ou redefinição incompatível de princípios.
- **MINOR**: Adição de novos princípios ou expansão material de existentes.
- **PATCH**: Correções de escrita, clarificações sem impacto semântico.

### Compliance Review

- Todo pull request MUST ser verificado contra os princípios desta constituição.
- Violações de princípios MUST ser corrigidas antes do merge.
- Revisões periódicas da constituição SHOULD ocorrer a cada ciclo de release.
