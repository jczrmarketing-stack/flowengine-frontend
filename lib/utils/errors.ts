/**
 * Utilidades para manejo de errores
 */

/**
 * Extrae un mensaje de error legible de un error de Supabase o genérico
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    
    // Error de Supabase
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Error con código
    if ('code' in errorObj && 'message' in errorObj) {
      return `${errorObj.code}: ${errorObj.message}`;
    }
  }

  return 'Ha ocurrido un error desconocido';
}

/**
 * Verifica si un error es de un tipo específico
 */
export function isErrorType<T extends Error>(
  error: unknown,
  errorClass: new (...args: unknown[]) => T
): error is T {
  return error instanceof errorClass;
}

