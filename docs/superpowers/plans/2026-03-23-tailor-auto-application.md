# Tailor Auto Application Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar automaticamente a application após confirmar um tailored resume, sem abrir o formulário.

**Architecture:** O `tailor` continua passando os dados via query string para o resume viewer. O resume viewer passa a consumir esse handoff para criar a application automaticamente, com proteção contra duplicidade e limpeza da URL após o processamento.

**Tech Stack:** Next.js, React, TypeScript, Vitest

---

### Task 1: Extrair helpers do handoff pós-tailoring

**Files:**
- Modify: `apps/frontend/lib/applications/post-tailor-prefill.ts`
- Test: `apps/frontend/tests/post-tailor-prefill.test.ts`

- [ ] Adicionar helper para montar payload de auto-create a partir do prefill
- [ ] Adicionar helper para remover os params transitórios da URL
- [ ] Cobrir os helpers com testes unitários

### Task 2: Trocar o comportamento do resume viewer

**Files:**
- Modify: `apps/frontend/app/(default)/resumes/[id]/page.tsx`

- [ ] Detectar handoff pós-tailoring
- [ ] Se já existir application vinculada, não criar duplicata
- [ ] Se não existir, criar automaticamente via `createApplication`
- [ ] Atualizar estado local e limpar os query params
- [ ] Mostrar erro consistente se o auto-create falhar

### Task 3: Verificação

**Files:**
- Test: `apps/frontend/tests/post-tailor-prefill.test.ts`

- [ ] Rodar `vitest` no teste alterado
- [ ] Rodar `eslint` e `prettier --check` nos arquivos tocados
