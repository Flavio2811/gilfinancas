@echo off
cd /d "C:\Users\flavi\AppData\Roaming\Claude\scratch-workspaces\eda600ec-a7cf-43d0-9987-c0420beb1775\f1cbbc00-2439-4209-a7e7-9bbe95530fe6\scratch-2026-10-10-e5beaf"
echo.
echo ========================================
echo   GIL.FINANCAS - INICIANDO SERVIDOR
echo ========================================
echo.
echo Verificando dependencias...
if not exist node_modules (
    echo Instalando pacotes npm...
    call npm install
) else (
    echo Pacotes ja instalados!
)
echo.
echo ========================================
echo   INICIANDO SERVIDOR...
echo ========================================
echo.
echo Servidor rodando em: http://localhost:5000
echo Abra seu navegador e acesse!
echo.
call npm start
pause
