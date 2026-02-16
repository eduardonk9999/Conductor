# Explicação do Código — Email Marketing SaaS

Este documento explica **o que cada parte do projeto faz** e **como é feito**.

---

## 1. Visão geral

O sistema tem duas partes:

- **Backend (NestJS):** API REST em `/api`, banco MongoDB, autenticação JWT, processamento de imagens (Sharp, OCR), geração de HTML para email.
- **Frontend (Vue 3):** SPA que consome a API, gerencia login/cadastro, dashboard, editor visual de templates e listagem de templates.

O usuário **cadastra**, **faz login**, **cria templates** (enviando uma imagem), **desenha áreas** na imagem (texto, botão, imagem, espaço), opcionalmente usa **OCR** para detectar textos, **salva** e **gera HTML** para usar em campanhas de email.

---

## 2. Backend — Como entra e como está organizado

### 2.1 Entrada da aplicação: `main.ts`

**O que faz:** É o arquivo que “liga” o servidor. Ele:

1. **Cria a aplicação Nest** a partir do `AppModule` (que agrupa todos os módulos).
2. **Configura arquivos estáticos:** qualquer requisição para `/uploads/...` é atendida pelos arquivos da pasta `uploads/` no servidor (por exemplo, as imagens dos templates).
3. **Habilita CORS:** permite que o frontend (ex.: `http://localhost:5173`) chame a API sem ser bloqueado pelo navegador. O valor vem do `.env` (`CORS_ORIGIN`).
4. **ValidationPipe global:** toda requisição que usa DTOs (ex.: cadastro, login) passa por validação automática (campos obrigatórios, formato de email, etc.). `whitelist: true` remove campos extras; `forbidNonWhitelisted: true` rejeita se vier campo não permitido.
5. **Prefixo global `api`:** todas as rotas da API ficam sob `/api` (ex.: `POST /api/auth/register`, `GET /api/templates`).
6. **Sobe o servidor** na porta definida no `.env` (padrão 3000).

**Resumo:** `main.ts` configura o “container” da API (CORS, validação, prefixo, arquivos estáticos) e sobe o servidor.

---

### 2.2 Módulo raiz: `app.module.ts`

**O que faz:** Agrupa **toda** a aplicação em um único módulo. Cada `import` é um “bloco” de funcionalidade:

- **ConfigModule:** carrega variáveis do `.env` e deixa disponível em qualquer lugar (`isGlobal: true`).
- **MongooseModule:** conecta ao MongoDB usando a URL do `.env` (`MONGODB_URI`). Todos os dados (usuários, templates) ficam nesse banco.
- **AuthModule:** rotas e lógica de login, cadastro e JWT.
- **UsersModule:** modelo e serviço de usuário (criar, buscar por email, etc.).
- **TemplatesModule:** CRUD de templates, upload de imagem, OCR, geração de HTML.
- **ImagesModule:** processamento de imagem (redimensionar, otimizar) e OCR (Tesseract).
- **EmailGeneratorModule:** montagem do HTML do email a partir das “áreas” do template.

**Resumo:** `app.module.ts` diz “quais módulos existem” e como o Nest deve conectar banco e config. Cada módulo cuida de um domínio (auth, users, templates, imagens, email).

---

## 3. Autenticação (Auth)

### 3.1 Fluxo geral

1. Usuário envia **nome, email, senha** (cadastro) ou **email, senha** (login).
2. O **controller** recebe o body e chama o **AuthService**.
3. O **AuthService** usa o **UsersService** (verificar se email existe, criar usuário, comparar senha).
4. Se estiver ok, o **JwtService** gera um **token JWT** e a API devolve `access_token` + dados do `user`.
5. O frontend guarda o token (localStorage e header das requisições) e usa em rotas protegidas.

### 3.2 `auth.controller.ts`

- **POST `/api/auth/register`:** recebe o body, valida com `RegisterDto` (nome, email, senha) e chama `authService.register`.
- **POST `/api/auth/login`:** recebe o body, valida com `LoginDto` (email, senha) e chama `authService.login`.
- **GET `/api/auth/me`:** protegido por `JwtAuthGuard`; devolve os dados do usuário que está no token (útil para “refrescar” o perfil no front).

**Como é feito:** O Nest injeta o body já validado (DTO) e o resultado do service é devolvido direto como JSON.

### 3.3 `auth.service.ts`

- **register:**  
  - Verifica se já existe usuário com aquele email.  
  - Se existir → `BadRequestException` (“email já em uso”).  
  - Se não → chama `usersService.create` (senha é hasheada dentro do UsersService).  
  - Monta o payload do JWT (`email`, `sub: user._id`) e chama `jwtService.sign`.  
  - Devolve `access_token` e `user` (id, email, name).  
  - Qualquer erro (ex.: MongoDB fora, JWT mal configurado) é tratado no `catch`: mensagem amigável e log no servidor.

- **login:**  
  - Busca usuário por email; se não achar ou senha errada → `UnauthorizedException`.  
  - Senão gera JWT e devolve token + user.

- **validateUser(userId):** usado pela **JWT Strategy**: dado o `sub` do token, busca o usuário no banco. Se não achar, o guard considera token inválido.

**Como é feito:** Toda a regra de “pode ou não pode logar/cadastrar” e “o que devolver” fica aqui; controller só repassa.

### 3.4 JWT (token)

- **auth.module.ts:** configura o `JwtModule` com `JWT_SECRET` e `JWT_EXPIRATION` do `.env`. Se `JWT_SECRET` não existir, o módulo falha ao carregar (evita 500 na hora de assinar).
- **jwt.strategy.ts:** em toda rota protegida por `JwtAuthGuard`, o Passport usa essa strategy: extrai o token do header `Authorization`, valida a assinatura, chama `validate(payload)`. O retorno de `validate` (ex.: `{ userId, email, user }`) vira `req.user` no controller.
- **jwt-auth.guard.ts:** aplica a strategy “jwt” do Passport; se o token for inválido ou expirado, a requisição retorna 401.

**Resumo:** Cadastro/login não usam token; só devolvem o token. Rotas como “meus templates” ou “meu perfil” exigem o token no header; o guard valida e preenche `req.user`.

### 3.5 DTOs (`register.dto.ts`, `login.dto.ts`)

- **RegisterDto:** `name` (string, mínimo 2 caracteres), `email` (formato email), `password` (mínimo 6 caracteres). Usados com `class-validator`.
- **LoginDto:** `email` (formato email), `password` (obrigatório).

**Como é feito:** O ValidationPipe do `main.ts` valida o body antes de chegar no service. Se algo estiver fora do padrão, a API responde 400 com a mensagem do validator.

---

## 4. Usuários (Users)

### 4.1 `user.schema.ts`

Define o **modelo** do usuário no MongoDB (Mongoose):

- `email` (obrigatório, único), `password` (obrigatório, será hasheado), `name` (obrigatório).
- `plan`, `isActive`, `preferences` com valores padrão.
- `timestamps: true` → Mongoose preenche `createdAt` e `updatedAt`.

**Como é feito:** Decorators `@Schema` e `@Prop` do `@nestjs/mongoose`; o Mongoose vira isso em coleção e índices (ex.: índice único em `email`).

### 4.2 `users.service.ts`

- **create(name, email, password):** faz hash da senha com `bcrypt`, cria documento no modelo User e salva no MongoDB. Retorna o documento (com `_id`).
- **findByEmail(email):** busca um usuário pelo email (para login e para verificar “email já existe” no cadastro).
- **findById(id):** usado pela JWT strategy para carregar o usuário a partir do `sub` do token.
- **validatePassword(user, password):** compara a senha em texto com o hash guardado (`bcrypt.compare`).

**Resumo:** Toda persistência e lógica de “usuário” (criar, buscar, senha) fica aqui; o Auth usa esse service.

---

## 5. Templates

### 5.1 `template.schema.ts`

Define o **modelo** do template e das **áreas**:

- **Template:**  
  `name`, `description`, `userId` (quem é o dono), `originalImageUrl` (caminho da imagem enviada), `areas` (lista de áreas), `emailWidth`, `backgroundColor`, `htmlContent` (HTML gerado), `isPublic`, `metadata` (dimensões da imagem, textos do OCR, botões detectados, etc.).

- **TemplateArea (interface):**  
  `id`, `type` (image | text | button | spacer), `x`, `y`, `width`, `height`, e opcionais: `content`, `link`, `styles` (fonte, cor, alinhamento, etc.). É isso que o usuário “desenha” no editor e que vira blocos no HTML.

**Como é feito:** O editor no frontend envia/atualiza esse array `areas`; o backend só persiste e usa na geração de HTML.

### 5.2 `templates.controller.ts`

Todas as rotas estão protegidas por **JwtAuthGuard** (precisa estar logado). O `req.user` vem da JWT strategy (ex.: `userId`).

- **POST `/api/templates`:** upload de **uma imagem** + body (ex.: nome). Usa `FileInterceptor('image', multerConfig)` para receber o arquivo. Se não vier arquivo → 400. Chama `templatesService.create(dto, file, req.user.userId)`.
- **GET `/api/templates`:** lista templates do usuário (`findAllByUser(req.user.userId)`).
- **GET `/api/templates/public`:** lista templates públicos (para futuro uso).
- **GET `/api/templates/:id`:** um template; valida ObjectId com `ParseObjectIdPipe`; o service verifica se o template é do usuário ou público.
- **PUT `/api/templates/:id`:** atualiza template (ex.: nome, áreas, largura). Só o dono pode.
- **DELETE `/api/templates/:id`:** remove template e a imagem do disco. Só o dono.
- **POST `/api/templates/:id/generate-html`:** gera o HTML a partir das áreas e salva em `htmlContent`; devolve o HTML.
- **POST `/api/templates/:id/process-ocr`:** lê a imagem do disco, roda OCR (Tesseract), grava os textos detectados em `metadata.detectedTexts`.
- **POST `/api/templates/:id/detect-elements`:** detecta botões (por enquanto retorna vazio) e grava em `metadata.detectedButtons`.

**Como é feito:** Controller só valida parâmetros (incluindo ID), extrai `userId` do token e delega toda a lógica para o **TemplatesService**.

### 5.3 `templates.service.ts`

- **create(dto, file, userId):**  
  1. Chama **ImageProcessingService.processImage(file.buffer)** → recebe buffer otimizado e dimensões.  
  2. Salva a imagem em `uploads/templates/<uuid>.jpg`.  
  3. Cria documento no MongoDB com `originalImageUrl`, `metadata.imageWidth/Height`, e o resto do dto.  
  4. Retorna o template salvo.

- **findAllByUser(userId):** `find({ userId }).sort({ createdAt: -1 })`.
- **findOne(id, userId):** busca por id; se não existir → 404; se existir mas não for do usuário e não for público → 403; senão retorna o documento.
- **update(id, dto, userId):** busca template, verifica dono, faz `Object.assign(template, dto)` e `template.save()`.
- **remove(id, userId):** busca template, verifica dono, apaga o arquivo de imagem do disco (usando o path correto sem `/` no início) e remove o documento do MongoDB.
- **generateHtml(id, userId):** busca o template, chama **EmailHtmlGeneratorService** com `areas`, `emailWidth`, `backgroundColor`; recebe o HTML; salva em `template.htmlContent` e devolve.
- **processOcr(id, userId):** busca template, lê a imagem do disco (path relativo ao `originalImageUrl`), chama **ImageProcessingService.extractTextWithOCR**; garante que `template.metadata` existe e grava `detectedTexts`; salva e devolve.
- **detectElements(id, userId):** mesmo padrão; chama `detectButtons` e grava em `metadata.detectedButtons`.

**Resumo:** Service orquestra imagem em disco, MongoDB e os outros serviços (imagem, OCR, gerador de HTML). Toda regra de “quem pode ver/editar” e “onde salvar arquivo” está aqui.

### 5.4 DTOs e pipe

- **create-template.dto.ts:**  
  **CreateTemplateDto:** nome obrigatório; descrição, emailWidth, backgroundColor, isPublic opcionais.  
  **UpdateTemplateDto:** todos opcionais (nome, descrição, areas, emailWidth, backgroundColor, isPublic). Usado no PUT.

- **parse-objectid.pipe.ts:** recebe o `id` da URL; se não for um ObjectId válido do MongoDB, lança 400 (“ID inválido”). Evita 500 quando alguém manda um id malformado.

---

## 6. Imagens (Images) — `image-processing.service.ts`

- **processImage(buffer):**  
  Usa **Sharp** para abrir a imagem, ler `width`/`height`. Se forem 0 ou indefinidos → 400. Redimensiona (máx. 1200px de largura, sem aumentar), converte para JPEG (qualidade 90), devolve o buffer e as dimensões finais. Objetivo: padronizar e reduzir tamanho para armazenar e usar no OCR.

- **extractTextWithOCR(buffer):**  
  Cria um “worker” do **Tesseract.js** (idiomas por+eng), chama `recognize(buffer)`, mapeia as palavras em objetos com `text`, `confidence`, `bbox` (caixa delimitadora). Filtra por confiança > 60%, encerra o worker e retorna a lista. Usado para “Detectar Textos (OCR)” no editor.

- **detectButtons(buffer):**  
  Por enquanto só retorna array vazio; a ideia futura é detectar regiões que parecem botões na imagem.

**Resumo:** Toda manipulação de imagem (redimensionar, otimizar) e reconhecimento de texto (OCR) está aqui; os templates só passam o buffer e recebem resultado.

---

## 7. Geração de HTML (Email Generator) — `email-html-generator.service.ts`

- **generateEmailHtml(areas, emailWidth, backgroundColor):**  
  1. Ordena as `areas` por posição vertical (`y`).  
  2. Monta o HTML em partes: **cabeçalho** (DOCTYPE, meta, estilos, tabela container), **uma por área** (texto, botão, imagem ou espaçador) e **rodapé** (fechar tabelas/body/html).  
  3. Para cada área chama um método privado que gera o trecho HTML daquele tipo (texto com estilos, botão com link, imagem com src, spacer com altura).  
  4. Usa a biblioteca **Juice** para colar os estilos inline nos elementos (necessário para clientes de email que não suportam `<style>` bem).  
  5. Retorna o HTML final em string.

**Como é feito:** O HTML é montado com tabelas e estilos compatíveis com clientes de email; o Juice garante que o visual seja mantido com CSS inline.

---

## 8. Upload de arquivo — `multer.config.ts`

- **storage:** `memoryStorage()` — o arquivo fica em memória (em `req.file.buffer`), não em disco temporário.
- **limits:** tamanho máximo 10MB.
- **fileFilter:** só aceita MIME types de imagem (jpeg, png, jpg, webp). Se for outro tipo, chama o callback do Multer com `new Error('...')` e `false`, e a requisição falha.

**Resumo:** Define como o Multer trata o campo `image` do multipart no POST de criação de template.

---

## 9. Frontend — Como entra e como está organizado

### 9.1 Entrada: `main.js` e `App.vue`

- **main.js:** Cria a app Vue, importa o CSS global (`main.css` com Tailwind), registra **Pinia** (stores) e o **router**, monta o componente `App` em `#app`.
- **App.vue:** Só tem um container com `min-h-screen` e `<router-view />`. No `onMounted` chama `authStore.checkAuth()` para, se houver token, buscar o perfil em `/api/auth/me` e preencher o usuário na store.

**Resumo:** Um único ponto de montagem; o resto da UI é trocado pelo router (views).

### 9.2 Rotas: `router/index.js`

- **Rotas:**  
  `/` → Home; `/login` → Login; `/register` → Cadastro; `/dashboard` → Dashboard; `/editor/:id?` → Editor (id opcional); `/templates` → Lista de templates.  
  Cada rota tem `meta: { requiresAuth: true/false }`.

- **beforeEach:**  
  - Se a rota exige auth e o usuário não está autenticado (store) → redireciona para `login`.  
  - Se a rota é login ou register e o usuário já está autenticado → redireciona para `dashboard`.  
  - Caso contrário → segue normalmente.

**Como é feito:** O front não “chama API de auth” em toda página; ele confia no token e no `checkAuth` no App; o guard do router só olha `isAuthenticated` da store.

### 9.3 API: `services/api.js`

- **axios.create:** baseURL `/api`, header padrão JSON.
- **Interceptor de request:** antes de cada requisição, lê o token do `localStorage` e, se existir, coloca no header `Authorization: Bearer <token>`.
- **Interceptor de response:** em resposta de erro, se for 401 e a requisição **não** for de login ou register, limpa o token e redireciona para `/login` (sessão expirada ou token inválido). Em login/register, o 401 não redireciona para que a tela mostre a mensagem de erro.

**Resumo:** Todas as chamadas à API passam por esse cliente; token é colocado automaticamente e 401 em rotas protegidas leva ao login.

### 9.4 Store de auth: `stores/auth.js`

- **Estado:** `user` (objeto do usuário ou null), `token` (string ou null).  
- **isAuthenticated:** computed que retorna `!!token.value`.  
- **setToken:** atualiza a ref do token, grava ou remove do localStorage e no `api.defaults.headers.common['Authorization']`.  
- **setUser:** atualiza a ref do usuário.  
- **login(email, password):** POST `/auth/login`, em sucesso chama `setToken` e `setUser` com a resposta.  
- **register(name, email, password):** POST `/auth/register`, mesmo fluxo.  
- **logout:** zera token e user (e, pelo setToken, limpa localStorage e header).  
- **checkAuth:** se tem token, GET `/auth/me` e atualiza o user; se der erro (ex.: 401), chama `logout`.

**Resumo:** Toda a “sessão” do usuário (token + dados) e as ações de login, cadastro e logout ficam na store; as views só chamam a store e usam `isAuthenticated` e `user`.

### 9.5 Store de templates: `stores/template.js`

- **Estado:** `templates` (lista), `currentTemplate` (um template aberto), `loading`.  
- **fetchTemplates:** GET `/templates`, preenche `templates`.  
- **fetchTemplate(id):** GET `/templates/:id`, preenche `currentTemplate` e retorna.  
- **createTemplate(formData):** POST `/templates` com `multipart/form-data` (nome + imagem), adiciona o retorno no início da lista e retorna.  
- **updateTemplate(id, data):** PUT `/templates/:id`, atualiza o item na lista e em `currentTemplate` se for o mesmo.  
- **deleteTemplate(id):** DELETE `/templates/:id`, remove da lista e limpa `currentTemplate` se for o mesmo.  
- **generateHtml(id):** POST `.../generate-html`, retorna o HTML.  
- **processOcr(id):** POST `.../process-ocr`, retorna os textos detectados.  
- **detectElements(id):** POST `.../detect-elements`, retorna os botões detectados.

**Resumo:** A store concentra todas as chamadas de API relacionadas a templates; as views (Dashboard, Editor, Templates) usam essas funções e reagem ao estado (templates, currentTemplate, loading).

---

## 10. Fluxos principais (resumidos)

### Cadastro

1. Usuário preenche nome, email, senha em **RegisterView** e envia.
2. **authStore.register** → POST `/api/auth/register` com o body.
3. Backend: **AuthController** → **AuthService.register** → **UsersService** (findByEmail, create com bcrypt) → **JwtService.sign** → resposta com `access_token` e `user`.
4. Front: store chama `setToken` e `setUser`, redireciona para `/dashboard`.

### Criar template

1. No **Dashboard**, usuário clica em “Novo Template”, preenche nome e escolhe imagem; envia o formulário.
2. **templateStore.createTemplate(formData)** → POST `/api/templates` com multipart (nome + imagem).
3. Backend: **TemplatesController** (Multer coloca o arquivo em `req.file`) → **TemplatesService.create** → **ImageProcessingService.processImage** → salva imagem em `uploads/templates/` → salva documento no MongoDB.
4. Front: recebe o template, redireciona para `/editor/:id`.

### Editor: salvar e gerar HTML

1. Usuário edita áreas no **EditorView** (desenha, altera texto/link/estilos) e clica em “Salvar”.
2. **templateStore.updateTemplate(id, { areas, emailWidth })** → PUT `/api/templates/:id`.
3. Backend: **TemplatesService.update** atualiza o documento (áreas e largura).
4. Ao clicar em “Gerar HTML”, **templateStore.generateHtml(id)** → POST `.../generate-html`.
5. Backend: **TemplatesService.generateHtml** busca o template, chama **EmailHtmlGeneratorService.generateEmailHtml** com as áreas, salva o HTML no template e devolve. O front mostra no painel de preview e permite copiar/download.

---

## 11. Onde está cada “pedaço” (mapa rápido)

| O que você quer entender      | Onde está |
|------------------------------|-----------|
| Como o servidor sobe e configura CORS/validação | `backend/src/main.ts` |
| Quais módulos existem        | `backend/src/app.module.ts` |
| Cadastro e login (API)       | `backend/src/auth/` (controller, service, DTOs) |
| Quem é o usuário no token    | `backend/src/auth/strategies/jwt.strategy.ts` |
| Modelo de usuário e senha    | `backend/src/users/` (schema, service) |
| Modelo de template e áreas   | `backend/src/templates/schemas/template.schema.ts` |
| Rotas de templates (CRUD, OCR, HTML) | `backend/src/templates/templates.controller.ts` |
| Lógica de criar/atualizar template e chamar imagem/HTML | `backend/src/templates/templates.service.ts` |
| Processar imagem e OCR       | `backend/src/images/services/image-processing.service.ts` |
| Montar HTML do email         | `backend/src/email-generator/services/email-html-generator.service.ts` |
| Rotas do front e proteção por login | `frontend/src/router/index.js` |
| Chamadas HTTP e token        | `frontend/src/services/api.js` |
| Login/cadastro/sessão no front | `frontend/src/stores/auth.js` |
| Listar/criar/editar templates no front | `frontend/src/stores/template.js` |
| Telas (Home, Login, Dashboard, Editor, Templates) | `frontend/src/views/*.vue` |

Com isso você consegue seguir “o que cada parte do código faz” e “como é feito” em cada fluxo.
