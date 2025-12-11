import { NextResponse } from 'next/server';

/**
 * Utilidades para respuestas de API consistentes
 */

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  message?: string;
  data: T;
}

/**
 * Crea una respuesta de error estandarizada
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json({ error, details }, { status });
}

/**
 * Crea una respuesta de éxito estandarizada
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, message }, { status });
}

/**
 * Valida que los campos requeridos estén presentes
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: Partial<T>,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => !data[field] || data[field] === ''
  );

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields as string[],
  };
}

