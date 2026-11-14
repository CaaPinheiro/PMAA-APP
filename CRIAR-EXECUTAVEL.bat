@echo off
setlocal
cd /d "%~dp0"
title Gerar executavel - Integra PMAA
color 0B

echo =============================================================
echo    GERADOR DE EXECUTAVEL - Integra PMAA
echo =============================================================
echo.
echo  Cria um programa .EXE independente, que roda em qualquer
echo  computador Windows mesmo SEM Java instalado.
echo.

where jpackage >nul 2>nul
if errorlevel 1 (
    color 0C
    echo  [ERRO] A ferramenta "jpackage" nao foi encontrada.
    echo.
    echo  Ela vem com o JDK 17 (kit de desenvolvimento), e nao
    echo  com o Java comum. Baixe o JDK em https://adoptium.net
    echo  marcando a opcao "Add to PATH".
    echo.
    pause
    exit /b 1
)

if not exist "target\integra-pmaa-1.0.0.jar" (
    echo  Compilando o sistema... aguarde alguns minutos.
    echo.
    call mvnw.cmd clean package -DskipTests
    if errorlevel 1 (
        color 0C
        echo  [ERRO] Falha na compilacao.
        pause
        exit /b 1
    )
)

if exist "dist" rmdir /s /q "dist"
mkdir "dist"
copy /y "target\integra-pmaa-1.0.0.jar" "dist\" >nul

if exist "instalador" rmdir /s /q "instalador"

echo.
echo  Gerando o executavel... isso pode levar alguns minutos.
echo.

jpackage ^
  --type app-image ^
  --name "Integra PMAA" ^
  --app-version 1.0.0 ^
  --vendor "Prefeitura Municipal de Barcarena" ^
  --description "Programa Municipal de Aquisicao de Alimentos" ^
  --input "dist" ^
  --main-jar "integra-pmaa-1.0.0.jar" ^
  --icon "integra-pmaa.ico" ^
  --win-console ^
  --dest "instalador"

if errorlevel 1 (
    color 0C
    echo.
    echo  [ERRO] Falha ao gerar o executavel.
    pause
    exit /b 1
)

rmdir /s /q "dist"

powershell -NoProfile -Command ^
  "$alvo = Join-Path (Get-Location) 'instalador\Integra PMAA\Integra PMAA.exe';" ^
  "$area = [Environment]::GetFolderPath('Desktop');" ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $area 'Integra PMAA.lnk'));" ^
  "$s.TargetPath = $alvo;" ^
  "$s.WorkingDirectory = (Split-Path $alvo);" ^
  "$s.Description = 'Integra PMAA - Prefeitura de Barcarena';" ^
  "$s.Save()" 2>nul

color 0A
echo.
echo =============================================================
echo    EXECUTAVEL CRIADO COM SUCESSO
echo =============================================================
echo.
echo  Local:  instalador\Integra PMAA\Integra PMAA.exe
echo.
echo  Um atalho foi criado na sua Area de Trabalho.
echo.
echo  Para instalar em outro computador, copie a pasta
echo  "Integra PMAA" inteira - nao precisa de Java na maquina.
echo.
pause
