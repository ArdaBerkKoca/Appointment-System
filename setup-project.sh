#!/bin/bash

# 🤖 AI Destekli Randevu Sistemi - Proje Kurulum Script'i

echo "🚀 AI Destekli Randevu Sistemi kurulumu başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Node.js versiyon kontrolü
check_node_version() {
    print_status "Node.js versiyonu kontrol ediliyor..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node -v) bulundu"
        else
            print_error "Node.js 18+ gerekli. Mevcut versiyon: $(node -v)"
            exit 1
        fi
    else
        print_error "Node.js bulunamadı. Lütfen Node.js 18+ kurun."
        exit 1
    fi
}

# Docker kontrolü
check_docker() {
    print_status "Docker kontrol ediliyor..."
    if command -v docker &> /dev/null; then
        print_success "Docker bulundu"
    else
        print_warning "Docker bulunamadı. Manuel kurulum gerekebilir."
    fi
}

# Proje klasörlerini oluştur
create_project_structure() {
    print_status "Proje klasör yapısı oluşturuluyor..."
    
    # Ana klasörler
    mkdir -p backend/src/{controllers,models,routes,middleware,services,utils,config,types}
    mkdir -p frontend/src/{components,pages,hooks,services,utils,types,styles,assets}
    mkdir -p database/{migrations,seeds}
    mkdir -p docs
    mkdir -p docker
    
    print_success "Klasör yapısı oluşturuldu"
}

# Backend kurulumu
setup_backend() {
    print_status "Backend kurulumu başlıyor..."
    
    cd backend
    
    # package.json oluştur
    cat > package.json << EOF
{
  "name": "randevu-sistemi-backend",
  "version": "1.0.0",
  "description": "AI Destekli Randevu Sistemi Backend",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "migrate": "knex migrate:latest",
    "seed": "knex seed:run"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "openai": "^4.20.1",
    "stripe": "^14.7.0",
    "twilio": "^4.19.0",
    "nodemailer": "^6.9.7",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/pg": "^8.10.9",
    "@types/nodemailer": "^6.4.14",
    "@types/node": "^20.9.0",
    "typescript": "^5.2.2",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "eslint": "^8.53.0",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0"
  },
  "keywords": ["randevu", "ai", "appointment", "consulting"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

    # TypeScript konfigürasyonu
    cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

    # Nodemon konfigürasyonu
    cat > nodemon.json << EOF
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "ts-node src/index.ts"
}
EOF

    # Ana server dosyası
    cat > src/index.ts << EOF
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import appointmentRoutes from './routes/appointments';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});
EOF

    # Environment dosyası
    cat > .env.example << EOF
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/appointment_system

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Google Calendar
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
EOF

    print_success "Backend kurulumu tamamlandı"
    cd ..
}

# Frontend kurulumu
setup_frontend() {
    print_status "Frontend kurulumu başlıyor..."
    
    cd frontend
    
    # package.json oluştur
    cat > package.json << EOF
{
  "name": "randevu-sistemi-frontend",
  "version": "1.0.0",
  "description": "AI Destekli Randevu Sistemi Frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.8.4",
    "axios": "^1.6.2",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.9.0",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "typescript": "^5.2.2",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "eslint": "^8.53.0",
    "eslint-config-next": "^14.0.3"
  }
}
EOF

    # Next.js konfigürasyonu
    cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
EOF

    # TypeScript konfigürasyonu
    cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    # Tailwind CSS konfigürasyonu
    cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
EOF

    # PostCSS konfigürasyonu
    cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

    print_success "Frontend kurulumu tamamlandı"
    cd ..
}

# Docker kurulumu
setup_docker() {
    print_status "Docker konfigürasyonu oluşturuluyor..."
    
    cd docker
    
    # Docker Compose
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  backend:
    build: 
      context: ../backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/appointment_system
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ../backend:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - backend
    volumes:
      - ../frontend:/app
      - /app/node_modules
    command: npm run dev

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: appointment_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

    # Backend Dockerfile
    cat > ../backend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
EOF

    # Frontend Dockerfile
    cat > ../frontend/Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
EOF

    print_success "Docker konfigürasyonu tamamlandı"
    cd ..
}

# Bağımlılıkları yükle
install_dependencies() {
    print_status "Bağımlılıklar yükleniyor..."
    
    # Backend bağımlılıkları
    cd backend
    npm install
    cd ..
    
    # Frontend bağımlılıkları
    cd frontend
    npm install
    cd ..
    
    print_success "Bağımlılıklar yüklendi"
}

# Git kurulumu
setup_git() {
    print_status "Git repository kurulumu..."
    
    if [ ! -d ".git" ]; then
        git init
        cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Database
*.sqlite
*.db
EOF

        git add .
        git commit -m "Initial commit: AI Destekli Randevu Sistemi"
        print_success "Git repository oluşturuldu"
    else
        print_warning "Git repository zaten mevcut"
    fi
}

# Ana kurulum fonksiyonu
main() {
    echo "🤖 AI Destekli Randevu Sistemi Kurulum Script'i"
    echo "================================================"
    
    # Kontroller
    check_node_version
    check_docker
    
    # Kurulum
    create_project_structure
    setup_backend
    setup_frontend
    setup_docker
    install_dependencies
    setup_git
    
    echo ""
    echo "🎉 Kurulum tamamlandı!"
    echo ""
    echo "📋 Sonraki adımlar:"
    echo "1. Backend klasörüne gidin: cd backend"
    echo "2. .env dosyasını oluşturun: cp .env.example .env"
    echo "3. Gerekli API key'leri .env dosyasına ekleyin"
    echo "4. Veritabanını kurun: docker-compose up db"
    echo "5. Backend'i başlatın: npm run dev"
    echo "6. Yeni terminal açın ve frontend'i başlatın: cd frontend && npm run dev"
    echo ""
    echo "🌐 Uygulama adresleri:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo "   Database: localhost:5432"
    echo ""
    echo "📚 Dokümantasyon:"
    echo "   README.md - Genel bilgiler"
    echo "   project-structure.md - Proje yapısı"
    echo "   ai-integration-plan.md - AI entegrasyonu"
    echo "   development-roadmap.md - Geliştirme planı"
}

# Script'i çalıştır
main "$@" 