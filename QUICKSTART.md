# 🚀 Guia de Início Rápido - Email Marketing SaaS

## ⚡ Instalação Rápida (5 minutos)

### Passo 1: Clone e Execute o Setup

```bash
# Clone o repositório
git clone <seu-repositorio>
cd email-marketing-saas

# Execute o script de setup (Linux/Mac)
chmod +x setup.sh
./setup.sh

# Ou manualmente (Windows/todos)
cd backend && npm install
cd ../frontend && npm install
```

### Passo 2: Configure o Backend

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
MONGODB_URI=mongodb://localhost:27017/email-marketing-saas
JWT_SECRET=mude-para-uma-chave-super-secreta-aleatoria
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Passo 3: Inicie o MongoDB

**Opção A - Docker (Recomendado):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Opção B - MongoDB Local:**
```bash
mongod
```

### Passo 4: Inicie os Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

Aguarde ver: `🚀 Application is running on: http://localhost:3000/api`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Aguarde ver: `Local: http://localhost:5173/`

### Passo 5: Acesse a Aplicação

Abra seu navegador em: **http://localhost:5173**

---

## 📝 Primeiro Uso

### 1. Criar Conta

1. Clique em **"Cadastre-se"**
2. Preencha:
   - Nome
   - Email
   - Senha (mínimo 6 caracteres)
3. Clique em **"Criar Conta"**

### 2. Criar Seu Primeiro Template

1. No Dashboard, clique em **"Novo Template"**
2. Dê um nome (ex: "Newsletter Semanal")
3. Faça upload de uma imagem do seu design de email
4. Clique em **"Criar"**

### 3. Editar no Editor Visual

Você será redirecionado para o editor. Aqui você pode:

#### Adicionar Elementos Manualmente:

1. Clique no tipo de elemento (Texto, Botão, Imagem, Espaço)
2. Desenhe com o mouse na imagem onde quer o elemento
3. Configure propriedades no painel lateral

#### Usar OCR (Detecção Automática):

1. Clique em **"Detectar Textos (OCR)"**
2. Aguarde o processamento (pode levar alguns segundos)
3. Textos detectados aparecerão no painel lateral
4. Clique em um texto para adicioná-lo automaticamente

#### Editar Elementos:

- **Mover**: Clique e arraste o elemento
- **Redimensionar**: Arraste as alças nos cantos
- **Editar**: Selecione e modifique no painel lateral
- **Excluir**: Selecione e clique em "Excluir Elemento"

### 4. Gerar o HTML

1. Clique em **"Gerar HTML"**
2. Visualize o preview na aba "Visual"
3. Veja o código na aba "Código"
4. **Copiar** ou **Download** do HTML

---

## 🎯 Casos de Uso Comuns

### Criar Email de Newsletter

1. Faça upload do design da newsletter
2. Use OCR para detectar títulos e textos
3. Adicione botões manualmente para CTAs
4. Ajuste cores e fontes no painel
5. Gere o HTML e copie para sua plataforma de email

### Criar Email Promocional

1. Upload da imagem promocional
2. Adicione áreas de texto para título e descrição
3. Crie botões com links para produtos
4. Adicione espaçadores para melhor layout
5. Exporte o HTML

### Criar Email Transacional

1. Upload do template base
2. Use elementos de texto para informações dinâmicas
3. Configure estilos consistentes
4. Salve como template reutilizável

---

## 🔧 Comandos Úteis

### Backend

```bash
# Desenvolvimento (hot-reload)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Linting
npm run lint
```

### Frontend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### MongoDB

```bash
# Iniciar com Docker
docker start mongodb

# Parar
docker stop mongodb

# Ver logs
docker logs mongodb

# Acessar shell
mongosh
```

---

## 🆘 Problemas Comuns

### Backend não inicia

**Erro:** `Cannot connect to MongoDB`

**Solução:**
```bash
# Verifique se MongoDB está rodando
docker ps
# ou
mongod --version

# Inicie o MongoDB
docker start mongodb
```

### Frontend não carrega API

**Erro:** `Network Error` ou `CORS Error`

**Solução:**
1. Verifique se o backend está rodando
2. Confira `CORS_ORIGIN` no backend/.env
3. Deve ser `http://localhost:5173`

### Upload de imagem falha

**Erro:** `File too large`

**Solução:**
- Limite é 10MB por padrão
- Comprima a imagem antes de fazer upload
- Ou ajuste `MAX_FILE_SIZE` no backend/.env

### OCR não detecta textos

**Possíveis Causas:**
- Imagem com texto muito pequeno
- Texto em fonte muito estilizada
- Baixa qualidade da imagem

**Solução:**
- Use imagens de alta resolução
- Fontes mais legíveis funcionam melhor
- Você pode adicionar textos manualmente

---

## 📊 Estrutura de Pastas Rápida

```
email-marketing-saas/
├── backend/          # API NestJS
│   ├── src/         # Código fonte
│   ├── uploads/     # Imagens enviadas
│   └── .env         # Configurações
│
├── frontend/         # App Vue.js
│   ├── src/         # Código fonte
│   └── dist/        # Build de produção
│
└── README.md        # Este arquivo
```

---

## 🎓 Próximos Passos

Agora que você está rodando:

1. **Explore o Editor**: Teste todos os tipos de elementos
2. **Use OCR**: Experimente com diferentes imagens
3. **Salve Templates**: Crie uma biblioteca de templates
4. **Personalize Estilos**: Ajuste cores, fontes e tamanhos
5. **Exporte HTML**: Use em suas campanhas reais

---

## 📚 Documentação Adicional

- [README.md](./README.md) - Documentação completa
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento
- [API Docs](./backend/README.md) - Documentação da API

---

## 💡 Dicas Pro

1. **Organize Templates**: Use nomes descritivos
2. **Reutilize**: Duplique templates existentes para economizar tempo
3. **Teste**: Sempre teste o HTML em diferentes clientes de email
4. **Backup**: Faça download dos HTMLs importantes
5. **Experimente**: O OCR é poderoso, mas nem sempre perfeito - ajuste manualmente

---

## 🎉 Pronto!

Você está pronto para criar emails incríveis! 

Se tiver dúvidas, abra uma issue no repositório.

Happy coding! 🚀
