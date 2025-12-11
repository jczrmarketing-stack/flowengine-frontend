#!/bin/bash
# Script para verificar el contenido del bundle en producción
# Uso: ./scripts/verify-production.sh [URL_DESPLIEGUE]

set -e

DEPLOY_URL="${1:-https://engine.organicstack.io}"

echo "=========================================="
echo "🔍 VERIFICACIÓN DE PRODUCCIÓN"
echo "=========================================="
echo "URL: $DEPLOY_URL"
echo ""

# 1. Verificar que la ruta de Inngest responde
echo "1️⃣ Verificando ruta /api/inngest..."
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/inngest" | grep -q "200\|404"; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/inngest")
  echo "   Status: $HTTP_CODE"
  if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Ruta responde correctamente"
  else
    echo "   ⚠️  Ruta responde con $HTTP_CODE"
  fi
else
  echo "   ❌ No se pudo conectar"
fi

# 2. Verificar archivo local
echo ""
echo "2️⃣ Verificando implementación MOCK en archivo local..."
if grep -q 'if (provider === "MOCK")' lib/messaging/whatsappClient.ts; then
  echo "   ✅ MOCK está implementado correctamente"
  
  # Verificar que retorna success
  if grep -q 'success: true' lib/messaging/whatsappClient.ts && grep -A 2 'if (provider === "MOCK")' lib/messaging/whatsappClient.ts | grep -q 'success: true'; then
    echo "   ✅ MOCK retorna success: true"
  else
    echo "   ⚠️  MOCK podría no retornar success: true"
  fi
else
  echo "   ❌ MOCK no está implementado correctamente"
fi

# 3. Verificar que no existe el mensaje de error
echo ""
echo "3️⃣ Verificando que NO existe el mensaje de error..."
if grep -r "MOCK.*not.*supported.*yet" . --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".next"; then
  echo "   ❌ SE ENCONTRÓ el mensaje de error en el código fuente"
  echo "   Archivos afectados:"
  grep -r "MOCK.*not.*supported.*yet" . --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v ".next"
else
  echo "   ✅ No se encontró el mensaje de error en el código fuente"
fi

# 4. Verificar build local
echo ""
echo "4️⃣ Verificando build local..."
if [ -d ".next" ]; then
  echo "   ✅ Directorio .next existe"
  if grep -r "MOCK.*not.*supported.*yet" .next 2>/dev/null; then
    echo "   ❌ SE ENCONTRÓ el mensaje en el build local"
    echo "   💡 Ejecuta: rm -rf .next && npm run build"
  else
    echo "   ✅ No se encontró el mensaje en el build local"
  fi
else
  echo "   ⚠️  No hay build local (ejecuta 'npm run build')"
fi

# 5. Resumen y recomendaciones
echo ""
echo "=========================================="
echo "📊 RESUMEN Y RECOMENDACIONES"
echo "=========================================="
echo ""
echo "✅ Verificaciones completadas"
echo ""
echo "💡 Si el error persiste en producción:"
echo "   1. Asegúrate de que el código local esté commiteado"
echo "   2. Push a main/master: git push origin main"
echo "   3. En Vercel Dashboard:"
echo "      - Ve a tu proyecto"
echo "      - Settings > Build & Development Settings"
echo "      - Click en 'Clear Build Cache'"
echo "      - Ve a Deployments y haz 'Redeploy' del último commit"
echo "   4. Espera a que el build termine y verifica los logs"
echo ""
echo "🔍 Para verificar el código en producción:"
echo "   - Revisa los logs de Vercel durante el build"
echo "   - Verifica que el archivo compilado no tenga el mensaje de error"
echo ""

