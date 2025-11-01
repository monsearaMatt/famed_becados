#!/bin/bash

# Script para verificar la configuración de Docker

echo "🔍 Verificando configuración de Docker..."

# Verificar archivos necesarios
FILES=(
  "Dockerfile"
  ".dockerignore"
  "next.config.ts"
  "package.json"
)

MISSING=0
for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Falta el archivo: $file"
    MISSING=$((MISSING+1))
  else
    echo "✅ $file existe"
  fi
done

# Verificar next.config.ts tiene output: standalone
if grep -q "output: 'standalone'" next.config.ts; then
  echo "✅ next.config.ts configurado correctamente"
else
  echo "⚠️  next.config.ts no tiene output: 'standalone'"
fi

# Verificar .env.local o .env.example
if [ -f ".env.local" ] || [ -f ".env.example" ]; then
  echo "✅ Archivo de variables de entorno encontrado"
else
  echo "⚠️  No se encontró .env.local ni .env.example"
fi

echo ""
if [ $MISSING -eq 0 ]; then
  echo "✅ Todo listo para Docker!"
  echo "🚀 Ejecuta: cd .. && docker-compose up -d --build"
else
  echo "❌ Faltan $MISSING archivos necesarios"
  exit 1
fi
