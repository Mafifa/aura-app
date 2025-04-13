import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { showNotification } from './core/notificationManager'
import { TrayManager } from './core/trayManager'

let mainWindow: BrowserWindow | null = null
let trayManager: TrayManager | null = null

// Variable para controlar si la aplicación está cerrándose
let isQuiting = false

/**
 * Crea la ventana principal.
 * @returns Una promesa que resuelve la instancia de BrowserWindow cuando está lista.
 */
async function createWindow(): Promise<BrowserWindow> {
  return new Promise<BrowserWindow>((resolve) => {
    const window = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    window.on('ready-to-show', () => {
      window.show()
      resolve(window)
    })

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // Cargar la URL o archivo HTML correspondiente
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      window.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Ocultar la ventana en lugar de cerrarla
    window.on('close', (event) => {
      if (!isQuiting) {
        event.preventDefault()
        window.hide()
      }
    })
  })
}

// Este método se llama cuando Electron ha terminado la inicialización
app.whenReady().then(async () => {
  try {
    // Configurar el ID del modelo de usuario de la aplicación para Windows
    electronApp.setAppUserModelId('com.electron')

    // Crear la ventana principal
    mainWindow = await createWindow()

    // Mostrar una notificación de prueba
    showNotification('Aura', 'Este es un mensaje con Electron')

    // Inicializar el gestor de bandeja
    trayManager = new TrayManager(mainWindow)
    trayManager.createTray()

    // Observar atajos de teclado para ventanas nuevas
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    // Re-crear la ventana en macOS si no hay otras abiertas
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // Manejar el evento de cierre de la aplicación
    app.on('before-quit', () => {
      isQuiting = true // Marcar que la aplicación está cerrándose
    })
  } catch (error) {
    console.error('Error durante la inicialización:', error)
  }
})

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
