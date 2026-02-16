# Guia de Desenvolvimento - Email Marketing SaaS

## 🏗️ Arquitetura do Sistema

### Backend (NestJS)

O backend segue uma arquitetura modular baseada em:

1. **Auth Module**: Autenticação JWT e gerenciamento de sessões
2. **Users Module**: CRUD de usuários e perfis
3. **Templates Module**: Gerenciamento de templates de email
4. **Images Module**: Processamento de imagens e OCR
5. **Email Generator Module**: Geração de HTML responsivo

### Frontend (Vue.js)

O frontend utiliza:

1. **Composition API**: Para lógica de componentes reutilizável
2. **Pinia**: State management centralizado
3. **Vue Router**: Navegação entre páginas
4. **Tailwind CSS**: Estilização utilitária

## 📁 Estrutura de Arquivos Detalhada

### Backend

```
backend/src/
├── auth/
│   ├── auth.controller.ts      # Endpoints de autenticação
│   ├── auth.service.ts         # Lógica de negócio auth
│   ├── auth.module.ts          # Módulo de autenticação
│   ├── strategies/
│   │   └── jwt.strategy.ts     # Estratégia JWT do Passport
│   └── guards/
│       └── jwt-auth.guard.ts   # Guard de proteção de rotas
│
├── users/
│   ├── users.service.ts        # CRUD de usuários
│   ├── users.module.ts
│   └── schemas/
│       └── user.schema.ts      # Schema MongoDB
│
├── templates/
│   ├── templates.controller.ts # Endpoints de templates
│   ├── templates.service.ts    # Lógica de negócio
│   ├── templates.module.ts
│   ├── schemas/
│   │   └── template.schema.ts  # Schema do template
│   └── dto/
│       └── create-template.dto.ts # Validação de dados
│
├── images/
│   ├── images.module.ts
│   └── services/
│       └── image-processing.service.ts # OCR e processamento
│
├── email-generator/
│   ├── email-generator.module.ts
│   └── services/
│       └── email-html-generator.service.ts # Gera HTML
│
├── config/
│   └── multer.config.ts        # Configuração de upload
│
├── main.ts                      # Entry point
└── app.module.ts                # Módulo raiz
```

### Frontend

```
frontend/src/
├── views/
│   ├── HomeView.vue            # Landing page
│   ├── LoginView.vue           # Página de login
│   ├── RegisterView.vue        # Página de registro
│   ├── DashboardView.vue       # Dashboard principal
│   ├── EditorView.vue          # Editor visual (principal)
│   └── TemplatesView.vue       # Listagem de templates
│
├── stores/
│   ├── auth.js                 # Store de autenticação
│   └── template.js             # Store de templates
│
├── services/
│   └── api.js                  # Cliente Axios configurado
│
├── router/
│   └── index.js                # Configuração de rotas
│
├── assets/
│   └── main.css                # Estilos globais
│
├── App.vue                      # Componente raiz
└── main.js                      # Entry point
```

## 🔧 Funcionalidades Principais

### 1. Sistema de Autenticação

**Backend:**
```typescript
// auth/auth.service.ts
async login(email: string, password: string) {
  // Validação de credenciais
  // Geração de token JWT
  // Retorno do token e dados do usuário
}
```

**Frontend:**
```javascript
// stores/auth.js
async login(email, password) {
  // Chamada à API
  // Armazenamento do token
  // Redirecionamento
}
```

### 2. Upload e Processamento de Imagens

**Fluxo:**
1. Usuário faz upload da imagem
2. Backend valida formato e tamanho
3. Sharp processa e otimiza a imagem
4. Imagem é salva em `/uploads/templates/`
5. Template é criado no MongoDB

**Código:**
```typescript
// images/services/image-processing.service.ts
async processImage(buffer: Buffer) {
  const image = sharp(buffer);
  const processedBuffer = await image
    .resize(1200, null, { withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  return { processedBuffer, width, height };
}
```

### 3. Editor Visual com Seleção de Áreas

**Funcionalidades:**
- Desenhar áreas com o mouse
- Arrastar e redimensionar elementos
- Editar propriedades em tempo real
- Preview ao vivo

**Implementação:**
```javascript
// EditorView.vue
function startDrawing(e) {
  // Captura ponto inicial
  // Inicia modo de desenho
}

function drawing(e) {
  // Atualiza tamanho da área sendo desenhada
}

function stopDrawing() {
  // Cria novo elemento com área desenhada
  // Adiciona ao array de áreas
}
```

### 4. OCR (Reconhecimento de Texto)

**Tecnologia:** Tesseract.js

**Fluxo:**
1. Usuário clica em "Detectar Textos"
2. Backend processa imagem com Tesseract
3. Textos detectados são retornados com coordenadas
4. Frontend exibe textos detectados
5. Usuário pode adicionar textos ao template com um clique

**Código:**
```typescript
// images/services/image-processing.service.ts
async extractTextWithOCR(buffer: Buffer) {
  const worker = await createWorker('por+eng');
  const { data } = await worker.recognize(buffer);
  
  return data.words.map(word => ({
    text: word.text,
    confidence: word.confidence,
    bbox: word.bbox
  }));
}
```

### 5. Geração de HTML Responsivo

**Princípios:**
- Uso de tabelas para compatibilidade
- Inline CSS (via juice)
- Media queries para responsividade
- Estrutura compatível com Gmail, Outlook, etc.

**Código:**
```typescript
// email-generator/services/email-html-generator.service.ts
generateEmailHtml(areas, emailWidth, backgroundColor) {
  // Gera estrutura base
  // Itera sobre áreas criando elementos
  // Aplica inline CSS
  return juice(htmlContent);
}
```

## 🚀 Desenvolvimento

### Adicionar Nova Funcionalidade

1. **Backend:**
```bash
# Criar novo módulo
nest g module feature-name
nest g service feature-name
nest g controller feature-name
```

2. **Frontend:**
```bash
# Criar nova view
touch src/views/FeatureView.vue

# Adicionar rota em router/index.js
# Criar store se necessário
```

### Estrutura de um Módulo NestJS

```typescript
// feature.module.ts
@Module({
  imports: [MongooseModule.forFeature([...])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

### Estrutura de uma Store Pinia

```javascript
// stores/feature.js
export const useFeatureStore = defineStore('feature', () => {
  const items = ref([])
  
  async function fetchItems() {
    const response = await api.get('/feature')
    items.value = response.data
  }
  
  return { items, fetchItems }
})
```

## 🧪 Testes

### Backend (Em desenvolvimento)
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage
```

### Frontend (Em desenvolvimento)
```bash
npm run test:unit   # Vitest
npm run test:e2e    # Playwright
```

## 📊 Banco de Dados

### Schema do Template

```javascript
{
  name: String,
  description: String,
  userId: ObjectId,
  originalImageUrl: String,
  areas: [{
    id: String,
    type: 'text' | 'button' | 'image' | 'spacer',
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    content: String,
    link: String,
    styles: Object
  }],
  emailWidth: Number,
  backgroundColor: String,
  htmlContent: String,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Segurança

1. **Autenticação**: JWT com tempo de expiração
2. **Upload**: Validação de tipo e tamanho de arquivo
3. **CORS**: Configurado para frontend específico
4. **Senhas**: Hash com bcrypt (salt rounds: 10)
5. **Validação**: Pipes do NestJS + class-validator

## 🎨 Estilização

### Tailwind Classes Comuns
- Layout: `flex`, `grid`, `container`
- Spacing: `p-4`, `m-2`, `space-x-4`
- Colors: `bg-blue-600`, `text-white`
- Hover: `hover:bg-blue-700`
- Responsive: `md:grid-cols-2`, `lg:flex`

### CSS Customizado
Estilos específicos para editor em `/frontend/src/assets/main.css`

## 🐛 Debug

### Backend
```typescript
console.log('Debug:', variable);
// Ou use o debugger do VSCode
```

### Frontend
```javascript
console.log('Debug:', data);
// Ou use Vue DevTools
```

## 📦 Build para Produção

### Backend
```bash
npm run build
npm run start:prod
```

### Frontend
```bash
npm run build
# Arquivos em /dist
```

## 🔄 Workflow Git

```bash
# Feature branch
git checkout -b feature/nome-da-feature

# Commits
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug no editor"

# Merge
git checkout main
git merge feature/nome-da-feature
```

## 📚 Recursos Adicionais

- [NestJS Docs](https://docs.nestjs.com)
- [Vue.js Docs](https://vuejs.org)
- [MongoDB Docs](https://www.mongodb.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Tesseract.js](https://tesseract.projectnaptha.com)

## 🆘 Troubleshooting Comum

### "Cannot connect to MongoDB"
- Verifique se MongoDB está rodando
- Confira MONGODB_URI no .env

### "CORS Error"
- Verifique CORS_ORIGIN no backend
- Deve ser http://localhost:5173

### "Image upload fails"
- Verifique permissões da pasta /uploads
- Confirme limite de tamanho (MAX_FILE_SIZE)

### "JWT Token Invalid"
- Token pode ter expirado
- Faça logout e login novamente
