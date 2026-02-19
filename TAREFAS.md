# Lista de Tarefas do Projeto – Email Marketing SaaS

Tarefas em formato de checklist. Marque com `[x]` quando concluir. Podemos ir fazendo aos poucos, task por task.

---

## 1. Backend

- [ ] **1.1** Validar tamanho máximo da imagem no upload (ex.: 5MB) e retornar erro amigável
- [ ] **1.2** Adicionar rate limit nos endpoints de IA (evitar abuso)
- [x] **1.3** Endpoint de health check (`GET /api/health`) para monitoramento
- [ ] **1.4** Logs estruturados (ex.: Winston/Pino) em vez de só `console.log`
- [ ] **1.5** Variável de ambiente para desabilitar IA em produção (fallback gracioso)

---

## 2. Frontend – Editor

- [x] **2.1** Indicador visual de “área selecionada” mais claro (borda/contorno)
- [x] **2.2** Atalho de teclado: Delete para remover área selecionada
- [ ] **2.3** Undo/Redo para ações no editor (adicionar, mover, excluir área)
- [x] **2.4** Ajustar largura do email (`emailWidth`) com input numérico na sidebar
- [ ] **2.5** Preview do HTML em aba “Mobile” (iframe com viewport estreito) além do desktop

---

## 3. IA e Reconhecimento

- [ ] **3.1** Botão “Analisar de novo” que mantém áreas atuais e só preenche texto (OCR + IA) nas áreas tipo text
- [ ] **3.2** Opção de escolher modelo de visão no frontend (lista de modelos do Ollama)
- [ ] **3.3** Timeout e retry na chamada à IA (Ollama pode demorar)
- [ ] **3.4** Mensagem de progresso durante “Analisar imagem com IA” (ex.: “Analisando… pode levar 30s”)

---

## 4. Geração de HTML / Email

- [ ] **4.1** Garantir que imagens no HTML tenham `alt` descritivo (acessibilidade)
- [ ] **4.2** Opção no frontend: “Usar URL absoluta para imagens” (checkbox com base URL)
- [ ] **4.3** Testar HTML gerado em clientes reais (Gmail, Outlook, Apple Mail) e anotar ajustes
- [ ] **4.4** Suporte a “assunto do email” no template (campo opcional salvo no schema)

---

## 5. UX e Polish

- [ ] **5.1** Substituir `alert()` por toasts ou notificações in-page (sucesso/erro)
- [ ] **5.2** Loading states em todos os botões que disparam requisição (Salvar, Gerar HTML, OCR, IA)
- [ ] **5.3** Confirmação antes de excluir template (“Tem certeza?”)
- [ ] **5.4** Empty state na lista de templates (“Nenhum template ainda – criar primeiro”)
- [ ] **5.5** Página 404 amigável no frontend

---

## 6. Autenticação e Segurança

- [ ] **6.1** Refresh token (renovar sessão sem fazer login de novo)
- [ ] **6.2** “Esqueci minha senha” (fluxo de reset por email)
- [ ] **6.3** Validação de força de senha no registro (ex.: mínimo 8 caracteres, número)

---

## 7. Documentação e DevOps

- [ ] **7.1** Atualizar README com seção “Tarefas” linkando para este TAREFAS.md
- [ ] **7.2** Docker Compose: backend + frontend + MongoDB em um só `docker-compose up`
- [ ] **7.3** Script de seed (opcional): criar usuário e template de exemplo para demo
- [ ] **7.4** CI mínimo: lint + build do backend e frontend no GitHub Actions

---

## 8. Ideias futuras (backlog)

- [ ] **8.1** Exportar template como JSON (backup/import)
- [ ] **8.2** Temas pré-definidos (paleta de cores para botões/texto)
- [ ] **8.3** Envio de email de teste (enviar o HTML gerado para um email)
- [ ] **8.4** Histórico de versões do template (salvar snapshots das áreas)

---

**Como usar:** escolha uma task (ex.: 2.1), marque como em progresso no seu fluxo e, ao terminar, marque `[x]` aqui. Podemos ir pegando as próximas aos poucos.
