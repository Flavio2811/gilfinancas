# Script para instalar Node.js e rodar o backend
# Clique com botão direito e escolha "Executar com PowerShell como administrador"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║                                                            ║"
Write-Host "║    🚀 INSTALANDO NODE.JS E BACKEND GIL.FINANÇAS 🚀         ║"
Write-Host "║                                                            ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""

# Verificar se está como admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ Este script PRECISA rodar como Administrador!"
    Write-Host ""
    Write-Host "📝 Para isso:"
    Write-Host "1. Clique com botão DIREITO neste arquivo"
    Write-Host "2. Escolha: 'Executar com PowerShell como administrador'"
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Rodando como administrador!"
Write-Host ""

# Instalar Chocolatey
Write-Host "⏳ Passo 1/3: Instalando Chocolatey..."
$ChocoInstalled = $null
try {
    $ChocoInstalled = choco --version 2>$null
} catch {
    $ChocoInstalled = $null
}

if (-not $ChocoInstalled) {
    Write-Host "   Baixando Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "✅ Chocolatey instalado!"
} else {
    Write-Host "✅ Chocolatey já está instalado"
}

Write-Host ""

# Instalar Node.js
Write-Host "⏳ Passo 2/3: Instalando Node.js (pode levar 3-5 minutos)..."
choco install nodejs -y --force
Write-Host ""
Write-Host "✅ Node.js instalado!"

# Refreshar variáveis de ambiente
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "⏳ Verificando instalação..."
node --version
npm --version

Write-Host ""
Write-Host "⏳ Passo 3/3: Instalando dependências npm (pode levar 2-3 minutos)..."

# Ir para a pasta correta
cd "C:\Users\flavi\AppData\Roaming\Claude\scratch-workspaces\eda600ec-a7cf-43d0-9987-c0420beb1775\f1cbbc00-2439-4209-a7e7-9bbe95530fe6\scratch-2026-10-10-e5beaf"

# Instalar dependências
npm install

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║                                                            ║"
Write-Host "║    ✅ TUDO INSTALADO! INICIANDO SERVIDOR...               ║"
Write-Host "║                                                            ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "🚀 Servidor iniciando..."
Write-Host ""

# Rodar o servidor
npm start
