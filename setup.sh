#!/bin/bash

echo "🚀 Email Marketing SaaS - Setup Script"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
echo -e "${YELLOW}Verificando Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

# Verificar npm
echo -e "${YELLOW}Verificando npm...${NC}"
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm não encontrado.${NC}"
    exit 1
fi

# Verificar MongoDB
echo -e "${YELLOW}Verificando MongoDB...${NC}"
if command_exists mongod; then
    MONGO_VERSION=$(mongod --version | grep "db version" | cut -d' ' -f3)
    echo -e "${GREEN}✓ MongoDB instalado: $MONGO_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB não encontrado. Você precisará instalar ou usar Docker.${NC}"
    echo "  Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
fi

echo ""
echo "======================================"
echo "📦 Instalando Dependências"
echo "======================================"
echo ""

# Backend
echo -e "${YELLOW}Instalando dependências do Backend...${NC}"
cd backend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies instaladas${NC}"
    else
        echo -e "${RED}✗ Erro ao instalar dependências do backend${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ package.json não encontrado em /backend${NC}"
    exit 1
fi

# Criar .env se não existir
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Criando arquivo .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado. Por favor, configure suas variáveis.${NC}"
fi

cd ..

# Frontend
echo -e "${YELLOW}Instalando dependências do Frontend...${NC}"
cd frontend
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies instaladas${NC}"
    else
        echo -e "${RED}✗ Erro ao instalar dependências do frontend${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ package.json não encontrado em /frontend${NC}"
    exit 1
fi

cd ..

echo ""
echo "======================================"
echo "✅ Setup Completo!"
echo "======================================"
echo ""
echo -e "${GREEN}Próximos passos:${NC}"
echo ""
echo "1. Configure o arquivo backend/.env com suas variáveis"
echo "   - MONGODB_URI (default: mongodb://localhost:27017/email-marketing-saas)"
echo "   - JWT_SECRET (gere uma chave segura)"
echo ""
echo "2. Inicie o MongoDB:"
echo "   mongod"
echo "   ou"
echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
echo ""
echo "3. Inicie o backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "4. Em outro terminal, inicie o frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. Acesse http://localhost:5173"
echo ""
echo -e "${YELLOW}Dica:${NC} Use 'npm run dev' em ambos os diretórios para hot-reload durante desenvolvimento"
echo ""
