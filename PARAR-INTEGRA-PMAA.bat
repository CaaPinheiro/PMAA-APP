@echo off
setlocal
title Integra PMAA - Parar o sistema
color 0E

echo =============================================================
echo    PARAR O INTEGRA PMAA
echo =============================================================
echo.
echo  Use este script quando o sistema se recusar a abrir dizendo
echo  que o banco de dados ja esta em uso, mas voce nao encontrar
echo  nenhuma janela do Integra PMAA aberta.
echo.
echo  Ele encerra apenas o Integra PMAA. Outros programas Java
echo  que estejam rodando nao sao afetados.
echo.
pause
echo.

set "ACHOU="

rem 1) Encerra quem estiver ocupando a porta 8080.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /C:"0.0.0.0:8080"') do (
    echo  Encerrando o processo %%p (porta 8080)...
    taskkill /F /PID %%p >nul 2>nul
    set "ACHOU=1"
)

rem 2) Encerra qualquer Java que esteja executando o Integra PMAA,
rem    mesmo que ja tenha soltado a porta mas ainda segure o banco.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$alvos = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'java.exe' -and $_.CommandLine -like '*integra-pmaa*' }; if ($alvos) { $alvos | ForEach-Object { Write-Host ('  Encerrando o processo ' + $_.ProcessId + ' (Integra PMAA)...'); Stop-Process -Id $_.ProcessId -Force }; exit 10 } else { exit 0 }"
if errorlevel 10 set "ACHOU=1"

echo.
if defined ACHOU (
    color 0A
    echo  Pronto. O sistema foi encerrado.
    echo  Agora voce ja pode abrir o EXECUTAR-INTEGRA-PMAA.bat
) else (
    echo  Nenhum processo do Integra PMAA estava rodando.
    echo.
    echo  Se mesmo assim o banco aparecer como travado, reinicie o
    echo  computador. Isso libera qualquer arquivo preso.
)
echo.
pause
