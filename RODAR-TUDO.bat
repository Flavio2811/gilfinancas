@echo off
chcp 65001 >nul
title GIL.FINANCAS - INSTALACAO AUTOMATICA

REM Solicitar elevação de privilégios
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║                                                            ║
    echo ║   SOLICITANDO PERMISSAO DE ADMINISTRADOR...               ║
    echo ║                                                            ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.

    REM Re-executar como admin
    powershell -Command "Start-Process -Verb RunAs -FilePath '%~f0'"
    exit /b
)

cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║    🚀 GIL.FINANCAS - INSTALACAO COMPLETA AUTOMATICA 🚀        ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
echo ⏳ Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instalando...

    REM Instalar Chocolatey se não existir
    where choco >nul 2>&1
    if errorlevel 1 (
        echo ⏳ Instalando Chocolatey...
        powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        if errorlevel 1 (
            echo ❌ Erro ao instalar Chocolatey
            pause
            exit /b 1
        )
        refreshenv
    )

    REM Instalar Node.js
    echo ⏳ Instalando Node.js (pode levar 3-5 minutos)...
    choco install nodejs -y --force
    if errorlevel 1 (
        echo ❌ Erro ao instalar Node.js
        pause
        exit /b 1
    )
    refreshenv
    echo ✅ Node.js instalado!
) else (
    echo ✅ Node.js já está instalado
)
echo.

REM Verificar versões
echo ⏳ Verificando versões...
node --version
npm --version
echo.

REM Ir para a pasta do projeto
cd /d "C:\Users\flavi\AppData\Roaming\Claude\scratch-workspaces\eda600ec-a7cf-43d0-9987-c0420beb1775\f1cbbc00-2439-4209-a7e7-9bbe95530fe6\scratch-2026-10-10-e5beaf"

REM Instalar dependências
echo ⏳ Instalando dependências (pode levar 2-3 minutos)...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas!
echo.

REM Iniciar servidor
cls
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║    ✅ TUDO PRONTO! SERVIDOR INICIANDO...                      ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Servidor rodando em: http://localhost:5000
echo.
echo 📊 Para usar a aplicacao:
echo    1. Abra seu navegador
echo    2. Acesse: file:///C:/Users/flavi/AppData/Roaming/Claude/scratch-workspaces/eda600ec-a7cf-43d0-9987-c0420beb1775/f1cbbc00-2439-4209-a7e7-9bbe95530fe6/scratch-2026-10-10-e5beaf/app-expanded.html
echo    3. Registre e faça login
echo    4. Crie clientes, emprestimos e pagamentos!
echo.
echo ⏱️  Este terminal vai ficar aberto enquanto o servidor estiver rodando.
echo.

call npm start
