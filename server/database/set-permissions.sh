#!/bin/bash

# Script para configurar permissões do banco de dados
# Uso: ./set-permissions.sh

echo "🔧 Configurando permissões do banco de dados..."

# Diretório do banco
DB_DIR="$(dirname "$0")"
DB_FILES="$DB_DIR/*.db"

# Verificar se existem arquivos .db
if ls $DB_FILES 1> /dev/null 2>&1; then
    echo "📁 Encontrados arquivos de banco:"
    ls -la $DB_FILES
    
    echo ""
    echo "🔐 Aplicando permissões..."
    
    # Aplicar permissões 666 (leitura e escrita para todos)
    chmod 666 $DB_FILES
    echo "✅ Permissões 666 aplicadas"
    
    # Verificar se estamos rodando como root ou com sudo
    if [ "$EUID" -eq 0 ]; then
        echo "🔑 Aplicando proprietário www-data..."
        chown www-data:www-data $DB_FILES
        echo "✅ Proprietário alterado para www-data:www-data"
    else
        echo "⚠️  Executando como usuário normal. Para alterar proprietário, execute:"
        echo "   sudo chown www-data:www-data $DB_FILES"
    fi
    
    echo ""
    echo "📊 Status final das permissões:"
    ls -la $DB_FILES
    
    echo ""
    echo "✅ Permissões configuradas com sucesso!"
    echo "🎉 Agora você pode usar o phpLiteAdmin para deletar/modificar registros"
    
else
    echo "❌ Nenhum arquivo .db encontrado em $DB_DIR"
    echo "   Execute primeiro: node migrate.js"
    exit 1
fi
