#!/bin/bash
# Script para testar se o aplicativo compila sem erros

echo "🔧 Verificando se o aplicativo compila corretamente..."

cd "e:\tpm\StickerSmash"

echo "📦 Instalando dependências se necessário..."
npm install --silent

echo "🛠️ Verificando erros de TypeScript..."
npx tsc --noEmit

echo "✅ Verificação completa!"
