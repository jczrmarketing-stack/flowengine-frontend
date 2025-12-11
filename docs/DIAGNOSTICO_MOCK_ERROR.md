# 🔍 Diagnóstico Profesional: Error "Provider MOCK not supported yet"

## 📋 Resumen Ejecutivo

**Problema:** El flujo de Inngest falla con el error `WhatsApp send failed: Provider MOCK not supported yet`, a pesar de que el código local está correctamente implementado.

**Causa Raíz:** El código desplegado en Vercel es diferente al código local debido a caché de build o bundle desactualizado.

**Solución:** Invalidar caché completa y redeploy con código actualizado.

---

## 🔬 Análisis Técnico

### 1. Estado del Código Local

✅ **Archivo:** `lib/messaging/whatsappClient.ts`
- MOCK está implementado correctamente
- Retorna `{ success: true, messageId: "mock-message-id" }` sin validaciones
- NO contiene el mensaje "Provider MOCK not supported yet"
- El código es correcto y funcional

✅ **Archivo:** `src/inngest/functions.ts`
- Provider por defecto: `"MOCK"`
- Manejo correcto de errores
- Steps implementados correctamente

### 2. Por Qué Aparece el Error

El error `"Provider MOCK not supported yet"` **NO existe en el código fuente actual**. Esto indica:

1. **Caché de Build en Vercel:** Vercel está usando un bundle compilado de un commit anterior
2. **Caché Local:** El directorio `.next/` contiene código compilado antiguo
3. **Deploy Incompleto:** El último deploy no incluyó los cambios más recientes

### 3. Dónde Proviene el Mensaje

El mensaje de error proviene de una **versión anterior** del archivo `whatsappClient.ts` que probablemente tenía:

```typescript
// CÓDIGO ANTIGUO (NO EXISTE EN CÓDIGO ACTUAL)
if (provider === "MOCK") {
  return {
    success: false,
    error: "Provider MOCK not supported yet"
  };
}
```

Este código fue reemplazado por la implementación actual que siempre retorna `success: true` para MOCK.

### 4. Por Qué el Archivo Viejo Sigue en el Build

- **Next.js Cache:** Next.js cachea builds incrementales en `.next/`
- **Vercel Cache:** Vercel cachea builds entre deploys para acelerar compilación
- **Module Resolution:** TypeScript/Next.js pueden estar resolviendo módulos desde caché

---

## 🛠️ Plan de Corrección

### Fase 1: Invalidación Local

```bash
# 1. Eliminar caché local
rm -rf .next
rm -rf node_modules/.cache
rm -f tsconfig.tsbuildinfo

# 2. Verificar código fuente
grep -r "MOCK.*not.*supported" lib/ src/ --include="*.ts"

# 3. Rebuild limpio
npm run build

# 4. Verificar build
grep -r "MOCK.*not.*supported" .next/ || echo "✅ Build limpio"
```

### Fase 2: Invalidación en Vercel

1. **Dashboard de Vercel:**
   - Ve a tu proyecto
   - Settings → Build & Development Settings
   - Click en **"Clear Build Cache"**
   - Confirma la acción

2. **Redeploy:**
   - Ve a Deployments
   - Encuentra el último commit con los cambios
   - Click en "..." → **"Redeploy"**
   - Espera a que el build termine

3. **Verificación:**
   - Revisa los logs del build en Vercel
   - Verifica que no aparezca el mensaje de error
   - Prueba el endpoint `/api/inngest` con tu curl

### Fase 3: Validación

```bash
# Ejecutar script de verificación
./scripts/verify-production.sh https://engine.organicstack.io
```

---

## 📝 Checklist de Prevención

### Antes de Cada Deploy

- [ ] Verificar que `lib/messaging/whatsappClient.ts` tenga MOCK implementado
- [ ] Buscar "not supported" en el código: `grep -r "not supported" lib/ src/`
- [ ] Ejecutar `npm run build` localmente y verificar que compile
- [ ] Verificar que `.next/` no contenga código antiguo
- [ ] Commit y push del código actualizado

### Durante el Deploy

- [ ] Verificar logs de build en Vercel
- [ ] Confirmar que el build usa el commit correcto
- [ ] Verificar que no hay errores de compilación

### Después del Deploy

- [ ] Probar el endpoint `/api/inngest` con curl
- [ ] Verificar que el run de Inngest termine en "Completed"
- [ ] Confirmar que `dispatch-whatsapp-message` retorna `success: true`

---

## 🔧 Scripts de Utilidad

### 1. Diagnóstico de Bundle
```bash
./scripts/diagnose-bundle.sh
```
Verifica el estado del código fuente y build local.

### 2. Verificación de Producción
```bash
./scripts/verify-production.sh [URL]
```
Verifica que el código en producción sea correcto.

### 3. Invalidación de Caché
```bash
./scripts/invalidate-cache.sh
```
Elimina caché local y reconstruye el proyecto.

---

## 🎯 Validación Final

Para confirmar que el problema está resuelto:

1. **Código Local:**
   ```bash
   grep -A 5 'if (provider === "MOCK")' lib/messaging/whatsappClient.ts
   ```
   Debe mostrar: `return { success: true, messageId: "mock-message-id" }`

2. **Build Local:**
   ```bash
   npm run build
   grep -r "not supported" .next/ || echo "✅ Build limpio"
   ```

3. **Producción:**
   - Ejecutar curl de prueba
   - Verificar que el run termine en "Completed"
   - Confirmar output: `{ "success": true, "messageId": "mock-message-id" }`

---

## 📚 Referencias

- **Archivo Crítico:** `lib/messaging/whatsappClient.ts`
- **Función Inngest:** `src/inngest/functions.ts`
- **Ruta API:** `app/api/inngest/route.ts`
- **Documentación:** `docs/SPEC_FLOWENGINE.md`

---

## ✅ Conclusión

El código local es **correcto y funcional**. El problema es de **caché y deployment**. Siguiendo el plan de corrección, el error debería desaparecer después de invalidar caché y redeploy.

**Tiempo estimado de resolución:** 10-15 minutos (invalidación + redeploy + verificación)

