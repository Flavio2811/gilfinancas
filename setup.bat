@echo off
chcp 65001 >nul
cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     🚀 GIL.FINANÇAS - SETUP AUTOMÁTICO 🚀                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
echo ⏳ Verificando se Node.js está instalado...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Node.js não foi encontrado!
    echo.
    echo 📥 Baixe e instale Node.js em: https://nodejs.org
    echo    Escolha a versão LTS (recomendada)
    echo.
    pause
    exit /b 1
)

node --version
echo ✅ Node.js detectado!
echo.

REM Criar arquivo .env
echo ⏳ Criando arquivo .env...
if exist .env (
    echo ✅ Arquivo .env já existe
) else (
    (
        echo # SERVIDOR
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # JWT
        echo JWT_SECRET=sua_chave_secreta_super_segura_aqui_2026
        echo.
        echo # SUPABASE
        echo SUPABASE_URL=https://rslhrihbvzoeilkmjbwh.supabase.co
        echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbGhyaWhidnpvZWlsa21qYndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwMDg5OTAsImV4cCI6MjA0MDU4NDk5MH0.test_key_supabase
        echo.
        echo # LOGS
        echo LOG_LEVEL=debug
    ) > .env
    echo ✅ Arquivo .env criado com sucesso!
)
echo.

REM Instalar dependências
echo ⏳ Instalando dependências npm (pode levar alguns minutos)...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)
echo.
echo ✅ Dependências instaladas com sucesso!
echo.

REM Iniciar servidor
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║     ✅ SETUP CONCLUÍDO! INICIANDO SERVIDOR...                 ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Servidor iniciando em http://localhost:5000
echo.
echo ⏳ Aguarde alguns segundos...
echo.

call npm start
