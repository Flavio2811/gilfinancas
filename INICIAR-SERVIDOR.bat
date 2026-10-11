@echo off
chcp 65001 >nul
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║    🚀 INICIANDO SERVIDOR GIL.FINANÇAS 🚀                  ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
echo ⏳ Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo 📥 Baixe em: https://nodejs.org (versão LTS)
    pause
    exit /b 1
)
echo ✅ Node.js detectado!
echo.

REM Ir para a pasta do projeto
cd /d "C:\Users\flavi\AppData\Roaming\Claude\scratch-workspaces\eda600ec-a7cf-43d0-9987-c0420beb1775\f1cbbc00-2439-4209-a7e7-9bbe95530fe6\scratch-2026-10-10-e5beaf"

REM Instalar dependências
echo ⏳ Instalando dependências npm...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)
echo ✅ Dependências instaladas!
echo.

REM Iniciar servidor
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║    ✅ SERVIDOR INICIANDO...                               ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Servidor rodando em: http://localhost:5000
echo.
echo 📊 Abra no navegador: app-expanded.html
echo.
echo ⏱️  Este terminal fica aberto enquanto o servidor está rodando.
echo.

call npm start
