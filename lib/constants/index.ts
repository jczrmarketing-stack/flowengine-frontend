/**
 * Constantes de la aplicación
 */

export const APP_NAME = 'FlowEngine EdgeCore';
export const APP_DESCRIPTION = 'Plataforma SaaS para gestión de flujos de trabajo';

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  MISSING_ENV_VARS: 'Faltan variables de entorno requeridas',
  INVALID_REQUEST: 'Solicitud inválida',
  UNAUTHORIZED: 'No autorizado',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error interno del servidor',
} as const;

// Mensajes de éxito comunes
export const SUCCESS_MESSAGES = {
  CREATED: 'Creado con éxito',
  UPDATED: 'Actualizado con éxito',
  DELETED: 'Eliminado con éxito',
} as const;

