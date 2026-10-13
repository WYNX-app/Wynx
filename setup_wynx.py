"""
setup_wynx.py
Cria a estrutura ideal de pastas e arquivos-base para o projeto WYNX.

Como usar:
    1. Coloque este arquivo na raiz do projeto (junto do package.json).
    2. Rode: python setup_wynx.py
    3. Confirme com 's' quando pedir.

O script NÃO sobrescreve arquivos existentes. Se um arquivo já existe,
ele é preservado e uma mensagem é exibida.
"""

from pathlib import Path
import sys

ROOT = Path(__file__).parent.resolve()

# ---------------------------------------------------------------
# Estrutura: dict { caminho_relativo: conteúdo_ou_None }
# None = apenas cria a pasta
# ---------------------------------------------------------------

ESTRUTURA: dict[str, str | None] = {

    # ============================================================
    # src/features/ — módulos por domínio
    # ============================================================
    "src/features/auth/.gitkeep": None,
    "src/features/auth/README.md": "# Módulo: Auth\n\nLogin, cadastro, recuperação de senha.\n",
    "src/features/dashboard/.gitkeep": None,
    "src/features/dashboard/README.md": "# Módulo: Dashboard\n\nKPIs, gráficos e resumo operacional.\n",
    "src/features/produtos/.gitkeep": None,
    "src/features/produtos/README.md": "# Módulo: Produtos\n\nCRUD, listagem, categorias.\n",
    "src/features/estoque/.gitkeep": None,
    "src/features/estoque/README.md": "# Módulo: Estoque\n\nSaldo, entradas, saídas, alertas.\n",
    "src/features/movimentacoes/.gitkeep": None,
    "src/features/movimentacoes/README.md": "# Módulo: Movimentações\n\nHistórico e auditoria.\n",
    "src/features/relatorios/.gitkeep": None,
    "src/features/relatorios/README.md": "# Módulo: Relatórios\n\nGráficos e exportação.\n",
    "src/features/ia/.gitkeep": None,
    "src/features/ia/README.md": "# Módulo: IA\n\nInsights via Edge Function (nunca no cliente).\n",
    "src/features/equipe/.gitkeep": None,
    "src/features/equipe/README.md": "# Módulo: Equipe\n\nMembros, papéis e permissões.\n",
    "src/features/configuracoes/.gitkeep": None,
    "src/features/configuracoes/README.md": "# Módulo: Configurações\n\nPerfil, empresa, locais, preferências.\n",
    "src/features/planos/.gitkeep": None,
    "src/features/planos/README.md": "# Módulo: Planos\n\nAssinatura e limites (sem cobrança real no MVP).\n",

    # ============================================================
    # src/components/ — UI reutilizável
    # ============================================================
    "src/components/ui/.gitkeep": None,
    "src/components/layout/.gitkeep": None,
    "src/components/feedback/.gitkeep": None,
    "src/components/data/.gitkeep": None,

    # ============================================================
    # src/lib/ — utilitários e integrações
    # ============================================================
    "src/lib/utils.ts": (
        "export function cn(...parts: Array<string | false | null | undefined>) {\n"
        "  return parts.filter(Boolean).join(\" \");\n"
        "}\n"
    ),
    "src/lib/supabase/.gitkeep": None,
    "src/lib/supabase/client.ts": (
        "// Cliente Supabase — configurar com variáveis de ambiente.\n"
        "// import { createClient } from \"@supabase/supabase-js\";\n"
        "// export const supabase = createClient(\n"
        "//   import.meta.env.VITE_SUPABASE_URL,\n"
        "//   import.meta.env.VITE_SUPABASE_ANON_KEY\n"
        "// );\n"
        "export {};\n"
    ),
    "src/lib/validators/.gitkeep": None,
    "src/lib/formatters/.gitkeep": None,

    # ============================================================
    # src/app/ — roteamento e shell (opcional, mas recomendado)
    # ============================================================
    "src/app/router.tsx": (
        "// Rotas principais do WYNX.\n"
        "// Configure aqui React Router (BrowserRouter/Routes/Route).\n"
        "export {};\n"
    ),

    # ============================================================
    # src-tauri/ — empacotamento Tauri (FASE FUTURA)
    # ============================================================
    "src-tauri/README.md": (
        "# src-tauri/\n\n"
        "**Fase futura.** O projeto atualmente usa Electron (`electron/main.cjs`).\n"
        "Migre para Tauri apenas depois que a versão web estiver estável.\n\n"
        "Consulte: https://tauri.app/start/\n"
    ),
    "src-tauri/.gitkeep": None,

    # ============================================================
    # supabase/ — banco, migrations, Edge Functions
    # ============================================================
    "supabase/README.md": (
        "# supabase/\n\n"
        "Banco PostgreSQL, autenticação, RLS, Edge Functions.\n\n"
        "## Estrutura\n"
        "- `migrations/` — migrations versionadas (timestamp)\n"
        "- `functions/` — Edge Functions (IA, relatórios pesados)\n"
        "- `seed.sql` — dados fictícios para desenvolvimento\n"
        "- `config.toml` — configuração local do Supabase CLI\n"
    ),
    "supabase/migrations/.gitkeep": None,
    "supabase/migrations/00000000000000_init.sql": (
        "-- Migration inicial do WYNX.\n"
        "-- Adicione aqui as tabelas: companies, profiles, members,\n"
        "-- categories, products, movements, alerts, audit_logs.\n"
        "--\n"
        "-- REGRAS:\n"
        "-- - toda tabela de negócio tem company_id\n"
        "-- - RLS habilitado em todas as tabelas expostas\n"
        "-- - service_role NUNCA no cliente\n"
    ),
    "supabase/functions/.gitkeep": None,
    "supabase/functions/ai-insights/index.ts": (
        "// Edge Function: ai-insights\n"
        "// Recebe dados agregados da empresa, chama o modelo de IA\n"
        "// e retorna estrutura validada (título, evidência, recomendação).\n"
        "//\n"
        "// IMPORTANTE: nunca exponha a chave da API no cliente.\n"
        "export {};\n"
    ),
    "supabase/seed.sql": (
        "-- Dados fictícios para desenvolvimento local.\n"
        "-- Nunca use em produção.\n"
    ),

    # ============================================================
    # tests/ — unit, integration, e2e
    # ============================================================
    "tests/README.md": (
        "# tests/\n\n"
        "- `unit/` — funções puras (cálculo de saldo, validadores)\n"
        "- `integration/` — integração com Supabase local\n"
        "- `e2e/` — fluxos completos (Playwright)\n"
    ),
    "tests/unit/.gitkeep": None,
    "tests/unit/estoque.test.ts": (
        "// Testes das regras de estoque.\n"
        "// - entrada soma ao saldo\n"
        "// - saída subtrai\n"
        "// - saída acima do saldo é bloqueada\n"
        "// - alerta dispara quando saldo <= mínimo\n"
        "export {};\n"
    ),
    "tests/integration/.gitkeep": None,
    "tests/e2e/.gitkeep": None,

    # ============================================================
    # docs/ — requisitos, arquitetura, segurança, UX/UI
    # ============================================================
    "docs/README.md": (
        "# Documentação WYNX\n\n"
        "| Arquivo | Conteúdo |\n"
        "|---|---|\n"
        "| REQUISITOS_MVP.md | Requisitos e critérios de aceite |\n"
        "| ARQUITETURA.md | Stack, modelo de dados, RLS |\n"
        "| SEGURANCA.md | Chaves, permissões, backup |\n"
        "| UX_UI.md | Especificação de telas e componentes |\n"
        "| PLANO_MESTRE.md | Plano de desenvolvimento |\n"
        "| RELATORIO_DE_LANCAMENTO.md | Checklist final do MVP |\n"
        "| adr/ | Architecture Decision Records |\n"
    ),
    "docs/REQUISITOS_MVP.md": "# Requisitos do MVP\n\n(preencher com PROMPT 1)\n",
    "docs/ARQUITETURA.md": "# Arquitetura\n\n(preencher com PROMPT 3)\n",
    "docs/SEGURANCA.md": "# Segurança\n\n(preencher)\n",
    "docs/UX_UI.md": "# UX/UI\n\n(preencher)\n",
    "docs/PLANO_MESTRE.md": "# Plano Mestre\n\n(colar o documento completo)\n",
    "docs/RELATORIO_DE_LANCAMENTO.md": "# Relatório de Lançamento\n\n(preencher no final)\n",
    "docs/adr/.gitkeep": None,
    "docs/adr/0001-stack-inicial.md": (
        "# ADR 0001 — Stack inicial\n\n"
        "- **Data:** 2026-10-13\n"
        "- **Status:** Aceito\n\n"
        "## Contexto\n"
        "Definir a stack base do WYNX para o MVP.\n\n"
        "## Decisão\n"
        "- Frontend: React + TypeScript + Vite + Tailwind CSS\n"
        "- Backend: Supabase (PostgreSQL, Auth, Storage, RLS)\n"
        "- Empacotamento desktop: Electron (atual) / Tauri (futuro)\n\n"
        "## Consequências\n"
        "- App web reaproveitado no desktop.\n"
        "- RLS obrigatório em todas as tabelas de negócio.\n"
    ),

    # ============================================================
    # .github/workflows/ — CI
    # ============================================================
    ".github/workflows/ci.yml": (
        "name: CI\n\n"
        "on:\n"
        "  push:\n"
        "    branches: [main, develop]\n"
        "  pull_request:\n"
        "    branches: [main, develop]\n\n"
        "jobs:\n"
        "  build:\n"
        "    runs-on: ubuntu-latest\n"
        "    steps:\n"
        "      - uses: actions/checkout@v4\n"
        "      - uses: actions/setup-node@v4\n"
        "        with:\n"
        "          node-version: 20\n"
        "          cache: npm\n"
        "      - run: npm ci\n"
        "      - run: npm run lint --if-present\n"
        "      - run: npm run typecheck --if-present\n"
        "      - run: npm test --if-present\n"
    ),
    ".github/PULL_REQUEST_TEMPLATE.md": (
        "## O que mudou\n\n\n"
        "## Como testar\n\n\n"
        "## Checklist\n"
        "- [ ] Rodei `npm run dev` e testei localmente\n"
        "- [ ] Rodei os testes\n"
        "- [ ] Não commitei segredos (.env, chaves)\n"
        "- [ ] Atualizei a documentação se necessário\n"
    ),

    # ============================================================
    # Raiz — arquivos de projeto
    # ============================================================
    ".env.example": (
        "# Copie para .env e preencha com valores reais.\n"
        "# NUNCA commite o .env.\n\n"
        "VITE_SUPABASE_URL=\n"
        "VITE_SUPABASE_ANON_KEY=\n\n"
        "# NÃO coloque service_role aqui.\n"
        "# Segredos de IA ficam em Edge Function (server-side).\n"
    ),
    "WYNX_CONTEXT.md": (
        "# WYNX — Contexto do Projeto\n\n"
        "## Produto\n"
        "Plataforma de gestão inteligente de estoque para MEIs e pequenas empresas.\n\n"
        "## Slogan\n"
        "Transformando o controle de estoque em inteligência para o seu negócio.\n\n"
        "## Equipe\n"
        "- Heitor — CEO/fundador, desenvolvimento\n"
        "- Enzo — Co-CEO, marketing\n"
        "- Lara — Designer, UX/UI\n\n"
        "## Stack\n"
        "- React + TypeScript + Vite\n"
        "- Tailwind CSS v4\n"
        "- Supabase (PostgreSQL, Auth, Storage, RLS)\n"
        "- Electron (atual) / Tauri (futuro)\n\n"
        "## Regras\n"
        "1. Toda tabela de negócio tem company_id e RLS.\n"
        "2. Segredos nunca no cliente.\n"
        "3. Movimentação sempre registrada no histórico.\n"
        "4. IA nunca inventa números — só explica dados.\n"
    ),
}


def criar_estrutura() -> None:
    criados = []
    preservados = []

    for caminho_rel, conteudo in ESTRUTURA.items():
        destino = ROOT / caminho_rel
        destino.parent.mkdir(parents=True, exist_ok=True)

        if conteudo is None:
            # só garante a pasta
            continue

        if destino.exists():
            preservados.append(caminho_rel)
            continue

        destino.write_text(conteudo, encoding="utf-8")
        criados.append(caminho_rel)

    print(f"\n✅ Arquivos criados: {len(criados)}")
    for c in criados:
        print(f"   + {c}")

    if preservados:
        print(f"\n⚠️  Preservados (já existiam): {len(preservados)}")
        for p in preservados:
            print(f"   = {p}")

    print("\n📁 Pastas garantidas.")
    print(f"\nRaiz do projeto: {ROOT}")


def main() -> None:
    print("=" * 60)
    print(" WYNX — Setup de estrutura")
    print("=" * 60)
    print(f"\nRaiz detectada: {ROOT}")
    print("\nEste script:")
    print("  • Cria pastas e arquivos-base que ainda não existem.")
    print("  • NUNCA sobrescreve arquivos existentes.")
    print("  • NÃO instala dependências (você roda npm install depois).")
    print("  • NÃO migra Electron → Tauri (isso é decisão sua).")

    resposta = input("\nContinuar? (s/N): ").strip().lower()
    if resposta != "s":
        print("Cancelado.")
        sys.exit(0)

    criar_estrutura()

    print("\n" + "=" * 60)
    print(" Próximos passos")
    print("=" * 60)
    print("""
1. Revisar os arquivos criados.

2. Instalar dependências (se ainda não tiver):
       npm install react-router-dom @supabase/supabase-js
       npm install -D vitest @testing-library/react @testing-library/jest-dom

3. Adicionar scripts no package.json:
       "typecheck": "tsc --noEmit",
       "test": "vitest run",
       "test:watch": "vitest"

4. Rodar:
       npm run dev

5. Commit inicial:
       git add .
       git commit -m "chore: estrutura inicial do projeto"
""")


if __name__ == "__main__":
    main()