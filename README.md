# WYNX — Gestão Inteligente de Estoque (Windows)

Aplicativo desktop completo da WYNX: cadastro, estoque, alertas, relatórios, equipe, planos e insights de IA com base nos dados reais. Os dados ficam neste computador e não exigem internet para o funcionamento principal.

## Executável

Depois do build:

`Wynx-app/release/WYNX-Gestao-de-Estoque.exe`

## Conta de demonstração

- E-mail: `mariana@wynx.app`
- Senha: `demo1234`
- Colaboradora: `ana@wynx.app` / `equipe123`

## Desenvolvimento

```bash
cd Wynx-app
npm install
npm run dev
```

## Gerar o .exe

```bash
npm run build
```

O instalador NSIS opcional fica em `npm run build:installer`.
