Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║                                                            ║"
Write-Host "║    🚀 INICIANDO SERVIDOR GIL.FINANÇAS (Supabase) 🚀        ║"
Write-Host "║                                                            ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""

# Ir para a pasta do projeto
Set-Location "C:\Users\flavi\AppData\Roaming\Claude\scratch-workspaces\eda600ec-a7cf-43d0-9987-c0420beb1775\f1cbbc00-2439-4209-a7e7-9bbe95530fe6\scratch-2026-10-10-e5beaf"

Write-Host "⏳ Verificando Node.js..."
node --version
Write-Host ""

Write-Host "⏳ Instalando dependências..."
npm install
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════╗"
Write-Host "║                                                            ║"
Write-Host "║    ✅ SERVIDOR INICIANDO...                               ║"
Write-Host "║                                                            ║"
Write-Host "╚════════════════════════════════════════════════════════════╝"
Write-Host ""
Write-Host "🚀 Servidor rodando em: http://localhost:5000"
Write-Host "📊 Frontend: Abra app-expanded.html no navegador"
Write-Host ""
Write-Host "Aguarde alguns segundos para o servidor iniciar..."
Write-Host ""

npm start
