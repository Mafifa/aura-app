import { Notification } from 'electron'
import icon from '../../../resources/aura-image.png?asset'

/**
 * Muestra una notificación con un ícono fijo.
 * @param {string} title - Título de la notificación.
 * @param {string} body - Cuerpo de la notificación.
 */
export function showNotification(title = 'Aura', body = 'Sin mensaje.') {
  const notificationOptions = {
    title,
    body,
    icon: icon // Ícono fijo
  }

  // Crear y mostrar la notificación
  const notification = new Notification(notificationOptions)
  notification.show()
}
