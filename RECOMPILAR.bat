@echo off
setlocal
cd /d "%~dp0"
title Integra PMAA - Recompilar
color 0E

echo =============================================================
echo    RECOMPILAR O INTEGRA PMAA
echo =============================================================
echo.
echo  Use este script sempre que os arquivos do sistema forem
echo  atualizados. Ele apaga a versao compilada antiga e gera
echo  uma nova a partir do codigo atual.
echo.

rem --- Se houver um JDK 17 portatil na pasta jdk17, usa ele ---
if exist "%~dp0jdk17\bin\java.exe" (
    set "JAVA_HOME=%~dp0jdk17"
    set "PATH=%~dp0jdk17\bin;%PATH%"
)

where java >nul 2>nul
if errorlevel 1 (
    color 0C
    echo  [ERRO] O Java nao foi encontrado nesta maquina.
    echo.
    echo  Baixe e instale o Java 17 em:  https://adoptium.net
    echo  Marque a opcao "Add to PATH" durante a instalacao.
    echo  Depois feche esta janela e execute novamente.
    echo.
    pause
    exit /b 1
)

rem --- Descobre a versao principal do Java ---
set "JAVA_VER="
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do if not defined JAVA_VER set "JAVA_VER=%%v"
set "JAVA_VER=%JAVA_VER:"=%"
set "JAVA_MAJOR="
for /f "delims=. tokens=1,2" %%a in ("%JAVA_VER%") do (
    if "%%a"=="1" (set "JAVA_MAJOR=%%b") else (set "JAVA_MAJOR=%%a")
)

if not defined JAVA_MAJOR goto :java_ok
if %JAVA_MAJOR% GEQ 17 goto :java_ok

color 0C
echo =============================================================
echo    JAVA INCOMPATIVEL
echo =============================================================
echo.
echo  Esta maquina tem o Java %JAVA_VER% instalado.
echo  O Integra PMAA precisa do Java 17 ou superior.
echo.
echo  Isso nao tem como contornar: o Spring Boot 3 nao roda em
echo  versoes anteriores a 17. O sistema nao vai compilar aqui.
echo.
echo  COMO RESOLVER
echo.
echo   1. Instalador: baixe o Java 17 em https://adoptium.net
echo      e marque "Add to PATH". Precisa de permissao de admin.
echo.
echo   2. Sem permissao de admin: baixe o pacote .zip do Java 17
echo      no mesmo site, extraia, e renomeie a pasta extraida
echo      para  jdk17  dentro desta pasta aqui:
echo      %~dp0
echo      Depois execute este arquivo de novo. Ele usa o jdk17
echo      automaticamente, sem instalar nada no Windows.
echo.
pause
exit /b 1

:java_ok

if exist "target" (
    echo  Removendo a compilacao anterior...
    rmdir /s /q "target"
)

echo  Compilando... isso leva alguns minutos.
echo.
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    color 0C
    echo.
    echo  [ERRO] A compilacao falhou.
    echo  Role a janela para cima e leia a PRIMEIRA linha [ERROR].
    echo.
    pause
    exit /b 1
)

color 0A
echo.
echo  Compilacao concluida com sucesso.
echo  Agora execute o EXECUTAR-INTEGRA-PMAA.bat
echo.
pause
