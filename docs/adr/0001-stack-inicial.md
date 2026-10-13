# ADR 0001 — Stack inicial

- **Data:** 2026-10-13
- **Status:** Aceito

## Contexto
Definir a stack base do WYNX para o MVP.

## Decisão
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage, RLS)
- Empacotamento desktop: Electron (atual) / Tauri (futuro)

## Consequências
- App web reaproveitado no desktop.
- RLS obrigatório em todas as tabelas de negócio.
