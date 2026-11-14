@echo off
setlocal
cd /d "%~dp0"
title Integra PMAA - Prefeitura de Barcarena
color 0A

echo =============================================================
echo    INTEGRA PMAA
echo    Programa Municipal de Aquisicao de Alimentos
echo    Prefeitura Municipal de Barcarena / PA
echo =============================================================
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

rem Se o sistema ja estiver rodando, nao sobe uma segunda copia:
rem a porta 8080 e o arquivo do banco so aceitam um processo por vez.
set "JA_RODANDO="
netstat -an | findstr /C:"0.0.0.0:8080" >nul 2>nul && set "JA_RODANDO=1"
netstat -an | findstr /C:"[::]:8080" >nul 2>nul && set "JA_RODANDO=1"
if defined JA_RODANDO (
    color 0E
    echo  O sistema JA ESTA EM EXECUCAO nesta maquina.
    echo  Procure a janela preta que ficou aberta.
    echo.
    echo  Abrindo o navegador em http://localhost:8080 ...
    start "" "http://localhost:8080"
    echo.
    timeout /t 5 >nul
    exit /b 0
)

echo  Versao do Java instalada nesta maquina:
java -version 2>&1
echo.

if not exist "target\integra-pmaa-1.0.0.jar" (
    echo  Primeira execucao detectada.
    echo  Preparando o sistema... isso leva alguns minutos.
    echo  E necessaria conexao com a internet. Nao feche esta janela.
    echo.
    call mvnw.cmd clean package -DskipTests
    if errorlevel 1 (
        color 0C
        echo.
        echo  [ERRO] Falha ao compilar o sistema.
        echo.
        echo  Role a janela para cima e leia a PRIMEIRA linha [ERROR].
        echo  Causas mais comuns:
        echo.
        echo   - Versao do Java incompativel. O sistema foi feito para o
        echo     Java 17. Se a versao mostrada acima for 23 ou maior,
        echo     instale o Java 17 em https://adoptium.net e tente de novo.
        echo.
        echo   - Sem internet na primeira execucao, que e quando as
        echo     bibliotecas sao baixadas.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  Preparacao concluida.
    echo.
)

echo  Iniciando o sistema...
echo  O navegador abrira sozinho em http://localhost:8080
echo.
echo  Login inicial:  admin  /  admin123
echo.
echo  ATENCAO: para ENCERRAR o sistema, feche esta janela.
echo =============================================================
echo.

java -jar "target\integra-pmaa-1.0.0.jar"

echo.
echo  O sistema foi encerrado.
pause
