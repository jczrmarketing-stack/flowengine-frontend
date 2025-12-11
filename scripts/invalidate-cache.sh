#!/bin/bash
# Script para invalidar caché local y preparar build limpio
# Uso: ./scripts/invalidate-cache.sh

set -e

echo "=========================================="
echo "🧹 INVALIDACIÓN DE CACHÉ - FlowEngine"
echo "=========================================="
echo ""

# 1. Eliminar .next
echo "1️⃣ Eliminando directorio .next..."
if [ -d ".next" ]; then
  rm -rf .next
  echo "   ✅ .next eliminado"
else
  echo "   ⚠️  .next no existe"
fi

# 2. Eliminar node_modules/.cache si existe
echo ""
echo "2️⃣ Limpiando caché de node_modules..."
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "   ✅ Caché de node_modules eliminado"
else
  echo "   ⚠️  No hay caché en node_modules"
fi

# 3. Limpiar TypeScript cache
echo ""
echo "3️⃣ Limpiando caché de TypeScript..."
if [ -f "tsconfig.tsbuildinfo" ]; then
  rm -f tsconfig.tsbuildinfo
  echo "   ✅ tsconfig.tsbuildinfo eliminado"
else
  echo "   ⚠️  No hay tsconfig.tsbuildinfo"
fi

# 4. Verificar archivos fuente
echo ""
echo "4️⃣ Verificando archivos fuente críticos..."
if [ -f "lib/messaging/whatsappClient.ts" ]; then
  echo "   ✅ whatsappClient.ts existe"
  
  # Verificar que MOCK esté implementado
  if grep -q 'if (provider === "MOCK")' lib/messaging/whatsappClient.ts; then
    echo "   ✅ MOCK está implementado"
  else
    echo "   ❌ MOCK NO está implementado correctamente"
    exit 1
  fi
  
  # Verificar que no tenga el mensaje de error
  if grep -q "MOCK.*not.*supported.*yet" lib/messaging/whatsappClient.ts; then
    echo "   ❌ El archivo contiene el mensaje de error"
    exit 1
  else
    echo "   ✅ El archivo NO contiene el mensaje de error"
  fi
else
  echo "   ❌ whatsappClient.ts NO existe"
  exit 1
fi

# 5. Rebuild
echo ""
echo "5️⃣ Reconstruyendo proyecto..."
echo "   Ejecutando: npm run build"
npm run build

# 6. Verificar build
echo ""
echo "6️⃣ Verificando build..."
if [ -d ".next" ]; then
  echo "   ✅ Build completado"
  
  # Verificar que no tenga el mensaje de error en el build
  if grep -r "MOCK.*not.*supported.*yet" .next 2>/dev/null; then
    echo "   ❌ El build contiene el mensaje de error"
    echo "   💡 Revisa el código fuente"
    exit 1
  else
    echo "   ✅ El build NO contiene el mensaje de error"
  fi
else
  echo "   ❌ Build falló"
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ INVALIDACIÓN COMPLETA"
echo "=========================================="
echo ""
echo "💡 Próximos pasos:"
echo "   1. Verifica que el código esté commiteado"
echo "   2. Push a main: git push origin main"
echo "   3. En Vercel: Clear Build Cache + Redeploy"
echo ""

