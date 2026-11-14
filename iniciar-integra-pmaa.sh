#!/bin/bash
cd "$(dirname "$0")"
echo "============================================="
echo "   Integra PMAA - Prefeitura de Barcarena"
echo "============================================="
echo ""
if ! command -v java >/dev/null 2>&1; then
    echo "[ERRO] Java 17 nao encontrado. Instale em https://adoptium.net"
    exit 1
fi
if [ ! -f "target/integra-pmaa-1.0.0.jar" ]; then
    echo "Primeira execucao: preparando o sistema (alguns minutos)..."
    ./mvnw clean package -DskipTests || exit 1
fi
echo "Acesse http://localhost:8080 - login admin / admin123"
echo "Para encerrar, pressione Ctrl+C"
echo ""
java -jar target/integra-pmaa-1.0.0.jar
