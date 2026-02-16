# Email Marketing SaaS - Editor de Templates HTML Responsivos

Sistema completo para criação de templates de email marketing a partir de imagens, com editor visual interativo, OCR, detecção automática de elementos e geração de HTML responsivo.

## 🚀 Funcionalidades

### ✨ Principais Recursos

- **Upload de Imagens**: Faça upload de designs de email em formato de imagem
- **Editor Visual Interativo**: Selecione áreas da imagem com o mouse para criar elementos
- **OCR (Reconhecimento de Texto)**: Extrai automaticamente textos da imagem
- **Detecção de Botões**: Identifica automaticamente botões e call-to-actions
- **Editor de Código HTML**: Visualize e edite o código HTML gerado
- **Templates Salvos**: Sistema completo de gerenciamento de templates
- **Preview em Tempo Real**: Visualize o email final antes de exportar
- **HTML Responsivo**: Gera código compatível com todos os principais clientes de email
- **Autenticação**: Sistema completo de login e registro de usuários

### 🎨 Tipos de Elementos

- **Texto**: Adicione blocos de texto com formatação personalizada
- **Botões**: Crie botões com links e estilos customizados
- **Imagens**: Insira imagens com URLs
- **Espaçadores**: Adicione espaçamento vertical

### 🛠️ Tecnologias

**Backend:**
- NestJS (Framework Node.js)
- MongoDB (Banco de dados)
- Tesseract.js (OCR)
- Sharp (Processamento de imagens)
- Juice (Inline CSS)
- JWT (Autenticação)

**Frontend:**
- Vue.js 3 (Composition API)
- Pinia (State Management)
- Tailwind CSS (Estilização)
- Axios (HTTP Client)
- Vite (Build Tool)

## 📋 Pré-requisitos

- Node.js 18+ 
- MongoDB 6+
- NPM ou Yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd email-marketing-saas
```

### 2. Backend - Configuração

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações
# MONGODB_URI=mongodb://localhost:27017/email-marketing-saas
# JWT_SECRET=sua-chave-secreta-super-segura
# PORT=3000
```

### 3. Frontend - Configuração

```bash
cd ../frontend

# Instalar dependências
npm install
```

### 4. Iniciar MongoDB

```bash
# Se estiver usando Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou inicie seu MongoDB local
mongod
```

## 🚀 Executando o Projeto

### Backend

```bash
cd backend
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📖 Como Usar

### 1. Criar Conta

1. Acesse `http://localhost:5173`
2. Clique em "Cadastre-se"
3. Preencha seus dados e crie sua conta

### 2. Criar um Template

1. No dashboard, clique em "Novo Template"
2. Dê um nome ao template
3. Faça upload da imagem do seu email marketing
4. Clique em "Criar"

### 3. Editar no Editor Visual

1. **Adicionar Elementos Manualmente:**
   - Clique no tipo de elemento (Texto, Botão, Imagem, Espaço)
   - Desenhe com o mouse na área da imagem onde quer adicionar
   - Configure as propriedades no painel lateral

2. **Usar OCR (Detecção Automática):**
   - Clique em "Detectar Textos (OCR)"
   - Aguarde o processamento
   - Textos detectados aparecerão no painel lateral
   - Clique em um texto para adicioná-lo ao template

3. **Editar Propriedades:**
   - Selecione um elemento clicando nele
   - Modifique conteúdo, cores, fontes e estilos no painel
   - Redimensione arrastando as alças de canto
   - Mova o elemento arrastando

4. **Gerar HTML:**
   - Clique em "Gerar HTML"
   - Visualize o preview visual e o código
   - Copie o código ou faça download

### 4. Gerenciar Templates

- Visualize todos os templates na página "Meus Templates"
- Edite templates existentes
- Exclua templates não utilizados

## 🏗️ Estrutura do Projeto

```
email-marketing-saas/
├── backend/
│   ├── src/
│   │   ├── auth/              # Autenticação e JWT
│   │   ├── users/             # Gerenciamento de usuários
│   │   ├── templates/         # CRUD de templates
│   │   ├── images/            # Processamento de imagens e OCR
│   │   ├── email-generator/   # Geração de HTML
│   │   ├── config/            # Configurações
│   │   ├── main.ts           
│   │   └── app.module.ts
│   ├── uploads/               # Imagens enviadas
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── assets/            # CSS e recursos
    │   ├── components/        # Componentes reutilizáveis
    │   ├── views/             # Páginas
    │   │   ├── LoginView.vue
    │   │   ├── DashboardView.vue
    │   │   ├── EditorView.vue  # Editor principal
    │   │   └── TemplatesView.vue
    │   ├── stores/            # Pinia stores
    │   ├── services/          # API services
    │   ├── router/            # Vue Router
    │   ├── App.vue
    │   └── main.js
    ├── package.json
    └── vite.config.js
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Templates
- `GET /api/templates` - Listar templates do usuário
- `GET /api/templates/:id` - Obter template específico
- `POST /api/templates` - Criar novo template
- `PUT /api/templates/:id` - Atualizar template
- `DELETE /api/templates/:id` - Excluir template
- `POST /api/templates/:id/generate-html` - Gerar HTML
- `POST /api/templates/:id/process-ocr` - Processar OCR
- `POST /api/templates/:id/detect-elements` - Detectar elementos

## 🎯 Roadmap / Melhorias Futuras

- [ ] Biblioteca de templates prontos
- [ ] Integração com APIs de email (SendGrid, Mailchimp, etc)
- [ ] Editor de código HTML avançado com syntax highlighting
- [ ] Testes A/B de templates
- [ ] Analytics e métricas de performance
- [ ] Colaboração em tempo real
- [ ] Versionamento de templates
- [ ] Exportação para diferentes plataformas
- [ ] Biblioteca de componentes reutilizáveis
- [ ] IA para sugestões de design

## 🐛 Solução de Problemas

### Erro ao conectar no MongoDB
```bash
# Verifique se o MongoDB está rodando
mongod --version

# Verifique a string de conexão no .env
MONGODB_URI=mongodb://localhost:27017/email-marketing-saas
```

### Erro no OCR
O OCR requer que os idiomas sejam baixados. O Tesseract.js faz isso automaticamente, mas pode levar alguns segundos na primeira execução.

### Erro de CORS
Verifique se o `CORS_ORIGIN` no backend está configurado corretamente:
```
CORS_ORIGIN=http://localhost:5173
```

## 📝 Licença

MIT License - Sinta-se livre para usar este projeto como base para seus próprios projetos!

## 👨‍💻 Autor

Desenvolvido com ❤️ usando NestJS e Vue.js

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request
