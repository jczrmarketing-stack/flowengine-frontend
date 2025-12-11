#!/bin/bash
# Script de diagnóstico para verificar el bundle de producción
# Uso: ./scripts/diagnose-bundle.sh

set -e

echo "=========================================="
echo "🔍 DIAGNÓSTICO DE BUNDLE - FlowEngine"
echo "=========================================="
echo ""

# 1. Verificar archivo fuente
echo "1️⃣ Verificando archivo fuente local..."
if [ -f "lib/messaging/whatsappClient.ts" ]; then
  echo "✅ Archivo encontrado: lib/messaging/whatsappClient.ts"
  echo ""
  echo "📄 Contenido del archivo (primeras 40 líneas):"
  head -40 lib/messaging/whatsappClient.ts
  echo ""
  echo "🔎 Buscando 'MOCK' en el archivo:"
  grep -n "MOCK" lib/messaging/whatsappClient.ts || echo "❌ No se encontró 'MOCK'"
  echo ""
  echo "🔎 Buscando 'not supported' en el archivo:"
  grep -n "not supported" lib/messaging/whatsappClient.ts || echo "✅ No se encontró 'not supported'"
  echo ""
else
  echo "❌ Archivo no encontrado: lib/messaging/whatsappClient.ts"
  exit 1
fi

# 2. Verificar build de Next.js
echo "2️⃣ Verificando build de Next.js..."
if [ -d ".next" ]; then
  echo "✅ Directorio .next existe"
  
  # Buscar archivos compilados relacionados
  echo ""
  echo "🔎 Buscando archivos compilados con 'whatsapp':"
  find .next -name "*whatsapp*" -type f 2>/dev/null | head -5 || echo "No se encontraron archivos"
  
  echo ""
  echo "🔎 Buscando 'MOCK not supported' en .next:"
  grep -r "MOCK.*not.*supported" .next 2>/dev/null | head -3 || echo "✅ No se encontró el mensaje de error"
else
  echo "⚠️  Directorio .next no existe (ejecuta 'npm run build' primero)"
fi

# 3. Verificar imports
echo ""
echo "3️⃣ Verificando imports..."
echo "🔎 Archivos que importan whatsappClient:"
grep -r "from.*whatsappClient" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules || echo "No se encontraron imports"

# 4. Verificar duplicados
echo ""
echo "4️⃣ Verificando archivos duplicados..."
echo "🔎 Buscando todos los archivos whatsappClient:"
find . -name "*whatsappClient*" -type f 2>/dev/null | grep -v node_modules

# 5. Verificar node_modules (por si hay algo raro)
echo ""
echo "5️⃣ Verificando node_modules (solo estructura)..."
if [ -d "node_modules" ]; then
  echo "⚠️  node_modules existe (no se revisará contenido por tamaño)"
else
  echo "✅ node_modules no existe"
fi

# 6. Resumen
echo ""
echo "=========================================="
echo "📊 RESUMEN"
echo "=========================================="
echo "✅ Diagnóstico completado"
echo ""
echo "💡 PRÓXIMOS PASOS:"
echo "   1. Si encontraste 'not supported' en .next: ejecuta 'rm -rf .next && npm run build'"
echo "   2. Si el error persiste en Vercel:"
echo "      - Verifica que el commit esté pusheado"
echo "      - En Vercel: Settings > Build & Development Settings > Clear Build Cache"
echo "      - Redeploy manual"
echo "   3. Verifica que el archivo en producción sea idéntico al local"
echo ""

