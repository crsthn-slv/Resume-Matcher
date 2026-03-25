# Phase 7: Bundled Runtime & Persistent Data - Discussion Log

**Date:** 2026-03-25
**Status:** Complete

## Summary

Discussed the implementation decisions that materially affect packaged runtime delivery in Phase 7: how the app should bundle frontend/backend runtimes, where persistent data should live, how PDF/Chromium dependencies should be handled, and how upgrades should preserve local data safely. The user accepted the pragmatic recommendation in all four areas.

## Questions and Answers

### Area: Bundled runtime

**Question:** How should Phase 7 package the runtime for desktop distribution?

**Options presented:**
- `Frontend buildado + backend compilado + Electron chamando artefatos locais` — Recommended. Preserves the current architecture while removing the need for installed dev runtimes on the target machine.
- `Embute código-fonte e instala dependências no primeiro boot` — Not recommended because it increases fragility and first-run complexity.
- `Container/runtime local pesado` — Out of scope and too heavy for the target user experience.

**User selection:** `Frontend buildado + backend compilado + Electron chamando artefatos locais`

**Captured decision:** Package built frontend and compiled backend artifacts, launched locally by Electron.

### Area: Persistent data

**Question:** Where should user data and config live in the desktop app?

**Options presented:**
- `Salvar tudo em AppData/Local do usuário` — Recommended. Standard desktop behavior and safer for upgrades.
- `Salvar ao lado do executável` — Not recommended because installs, permissions, and reinstalls become fragile.
- `Perguntar pasta no primeiro boot` — Not recommended because it adds friction without solving the real distribution problem.

**User selection:** `Salvar tudo em AppData/Local do usuário`

**Captured decision:** Move persistent app data to a stable per-user AppData location outside the install directory.

### Area: PDF/runtime extras

**Question:** How should the packaged desktop app handle PDF rendering dependencies?

**Options presented:**
- `Empacotar o Chromium necessário junto com a app` — Recommended. Heavier, but predictable and independent of the target machine.
- `Usar Chrome/Edge já instalados` — Not recommended because availability and behavior vary by machine.
- `Desligar PDF no desktop inicial` — Not recommended because the core product flows must remain available.

**User selection:** `Empacotar o Chromium necessário junto com a app`

**Captured decision:** Bundle the Chromium runtime required for Playwright/PDF generation with the desktop app.

### Area: Upgrade-safe migration

**Question:** How should upgrades preserve and migrate local data?

**Options presented:**
- `Diretório version-stable + migrações leves e backup antes de mudanças estruturais` — Recommended.
- `Reutilizar arquivos existentes sem camada de migração` — Simpler, but risky when schemas evolve.
- `Resetar dados incompatíveis` — Not acceptable for a local-first personal app.

**User selection:** `Diretório version-stable + migrações leves e backup antes de mudanças estruturais`

**Captured decision:** Use stable per-user storage plus explicit lightweight migrations with backup before structural change.

## Deferred Items

- Windows installer generation and shortcut delivery remain deferred to Phase 8.
- Release publishing and update-delivery mechanics remain deferred to later phases.

---
*Phase: 07-bundled-runtime-persistent-data*
*Discussion logged: 2026-03-25*
