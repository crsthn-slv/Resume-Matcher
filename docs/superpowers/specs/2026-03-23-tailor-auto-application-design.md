# Tailor Auto Application Creation Design

## Goal

Quando um novo tailored resume for confirmado, a application deve ser criada automaticamente com os dados já preenchidos no tailor, sem abrir o formulário no resume viewer.

## Chosen Approach

Manter o handoff atual `tailor -> /resumes/[id]` e trocar o comportamento no resume viewer:

- o `tailor` continua enviando `createApplication=1`, `company`, `role`, `jobUrl` e `jobId`
- a página do resume detecta esse handoff e cria a application automaticamente
- se já existir uma application vinculada ao `resume_id`, não cria duplicata
- a URL é limpa logo após processar o handoff para evitar recriação em refresh

## Why This Approach

- Preserva a arquitetura já existente
- Evita mover lógica de criação para o `tailor`
- Minimiza risco de regressão no fluxo atual
- Permite tratar o auto-create como comportamento de entrada do resume viewer

## Error Handling

- Se `company` ou `role` vierem vazios, o auto-create não roda e a página mostra erro de validação
- Se a criação falhar, o resume viewer mostra erro de save e não tenta recriar em loop

## Testing

- Cobrir parsing do handoff
- Cobrir montagem do payload de auto-create
- Cobrir limpeza dos query params de handoff
