import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { showNotification } from './core/notificationManager'
import { TrayManager } from './core/trayManager'
import * as fs from 'fs'
import { initializeUpdater } from './core/updateManager'

let mainWindow: BrowserWindow
let trayManager: TrayManager | null = null

// Variable para controlar si la aplicación está cerrándose
let isQuiting = false

// Cargar las frases desde el archivo JSON
function loadPhrases(): { id: number; text: string }[] {
  const phrasesPath = join(__dirname, '../../resources/quotes.json')
  try {
    const data = fs.readFileSync(phrasesPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error al cargar las frases:', error)
    return []
  }
}

// Obtener una frase aleatoria
function getRandomPhrase(phrases: { id: number; text: string }[]): string {
  if (phrases.length === 0) return 'No hay frases disponibles.'
  const randomIndex = Math.floor(Math.random() * phrases.length)
  return phrases[randomIndex].text
}

async function createWindow(): Promise<BrowserWindow> {
  return new Promise<BrowserWindow>((resolve) => {
    const window = new BrowserWindow({
      width: 462,
      height: 647,
      maxWidth: 462,
      maxHeight: 647,
      minWidth: 462,
      minHeight: 647,
      show: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    // No mostrar la ventana al iniciar
    window.on('ready-to-show', () => {
      resolve(window) // Solo resolvemos la promesa, pero no mostramos la ventana
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

    resolve(window)
  })
}

// Este método se llama cuando Electron ha terminado la inicialización
app.whenReady().then(async () => {
  try {
    // Configurar el ID del modelo de usuario de la aplicación para Windows
    electronApp.setAppUserModelId('com.electron')

    // Habilitar el arranque automático
    app.setLoginItemSettings({
      openAtLogin: true, // Habilita el inicio automático
      openAsHidden: true // Inicia la aplicación oculta (macOS)
    })

    // Crear la ventana principal
    mainWindow = await createWindow()

    // Inicializar el gestor de bandeja
    trayManager = new TrayManager(mainWindow)
    trayManager.createTray()

    // Observar atajos de teclado para ventanas nuevas
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Re-crear la ventana en macOS si no hay otras abiertas
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow() // Crea la ventana pero no la muestra
      }
    })

    // Manejar el evento de cierre de la aplicación
    app.on('before-quit', () => {
      isQuiting = true // Marcar que la aplicación está cerrándose
    })

    // Configurar el sistema de notificaciones
    const phrases = loadPhrases() // Cargar las frases

    // Función para mostrar una notificación con una frase aleatoria
    function showRandomNotification() {
      const phrase = getRandomPhrase(phrases)
      showNotification('Aura', phrase)

      // Enviar la frase al frontend
      if (mainWindow) {
        mainWindow.webContents.send('phrase-update', phrase)
      }

      // Actualizar el tooltip del tray
      if (trayManager) {
        trayManager.updateTooltip(`Aura\n${phrase}`)
      }
    }

    // Mostrar una notificación cada 45 minutos (45 * 60 * 1000 ms)
    setInterval(showRandomNotification, 29 * 60 * 1000)

    // Mostrar una notificación inmediatamente al iniciar
    showRandomNotification()
  } catch (error) {
    console.error('Error durante la inicialización:', error)
  }
  initializeUpdater(mainWindow)
})

// Salir cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
