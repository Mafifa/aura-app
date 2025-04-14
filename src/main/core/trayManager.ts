import { app, Tray, Menu, BrowserWindow } from 'electron'
import icon from '../../../resources/icon.png?asset'

export class TrayManager {
  private tray: Tray | null = null

  constructor(private mainWindow: BrowserWindow) {}

  /**
   * Crea el ícono de la bandeja y configura su comportamiento.
   */
  public createTray(): void {
    if (this.tray) return

    // Ruta al ícono fijo
    const iconPath = icon

    this.tray = new Tray(iconPath)

    // Configurar el menú contextual
    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Abrir',
        click: () => this.restoreWindow(),
        type: 'normal' // Tipo permitido por Electron
      },
      { type: 'separator' }, // Separador
      {
        label: 'Cerrar',
        click: () => app.quit(),
        type: 'normal' // Tipo permitido por Electron
      }
    ]

    const contextMenu = Menu.buildFromTemplate(menuTemplate)
    this.tray.setContextMenu(contextMenu)

    // Configurar el tooltip inicial
    this.updateTooltip('Mi Aplicación\nHaz clic derecho para más opciones.')

    // Evento de doble clic para restaurar la ventana
    this.tray.on('double-click', () => this.restoreWindow())

    // Limpiar el tray antes de cerrar la aplicación
    app.on('before-quit', () => {
      this.tray?.destroy()
    })
  }

  /**
   * Actualiza el tooltip del ícono de la bandeja.
   * @param {string} tooltip - Texto que se mostrará como tooltip.
   */
  public updateTooltip(tooltip: string): void {
    if (!this.tray) return
    this.tray.setToolTip(tooltip)
  }

  /**
   * Restaura la ventana principal.
   */
  private restoreWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.show()
      this.mainWindow.focus()
    }
  }
}
