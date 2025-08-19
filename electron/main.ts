import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { readFile } from 'node:fs/promises'
import download from './download_video'
import './get_video_information'
import './get_all_video_details'
import './background_task'
import {spawn } from 'node:child_process'





const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null


try {
  fs.accessSync("./file_saved_at.txt", fs.constants.F_OK)
} catch {
  fs.writeFile("./file_saved_at.txt", app.getPath("downloads"), () => { })
}

ipcMain.on("pick-download-folder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  })

  if (canceled || filePaths.length === 0) {
    return null
  }

  // change the url to ../url in the dev mode 
  //  cause in dev mode vite watches file in the directory to reload
  // if vite founds this changes then vite reloads the whole app
  fs.writeFile("./file_saved_at.txt", filePaths[0], (err) => {
    if (err) console.error("Failed to save folder path:", err)
  })
})

// change the url to ../url in the dev mode 
//  cause in dev mode vite watches file in the directory to reload
// if vite founds this changes then vite reloads the whole app

ipcMain.on("remove_all_video_data", () => {
  fs.writeFile("./video_data.json", "[]", () => { })
})

ipcMain.on("open-folder", (_, path) => {
  shell.openPath(path)
})

ipcMain.on("download_video", async (_, f) => {
  const url = f.video_url
  const format_note = f.format_note || "best"


  // change the url to ../url in the dev mode 
  //  cause in dev mode vite watches file in the directory to reload
  // if vite founds this changes then vite reloads the whole app
  const file_saved_at = await readFile("./file_saved_at.txt", "utf-8")

  const args = [
    url,
    "-f", format_note,
    "--newline",
    "-o", `${file_saved_at}/%(title)s.%(ext)s`
  ]
  download(args, f.title, file_saved_at)
})

const isDev = !app.isPackaged;

const exeBasePath = isDev
  ? path.join(__dirname, "..") // dev: project root
  : process.resourcesPath;     // prod: resources folder

const ytdlpPath = path.join(exeBasePath, "yt-dlp.exe");

ipcMain.on("update-yt-dlp", (event) => {
  try {
    const updater = spawn(ytdlpPath, ["-U"], {
      detached: false, // no orphan process
      stdio: ["ignore", "pipe", "pipe"], // capture stdout & stderr
    });

    let output = "";
    let errors = "";

    updater.stdout.on("data", (data) => {
      output += data.toString();
    });

    updater.stderr.on("data", (data) => {
      errors += data.toString();
    });

    updater.on("close", (code) => {
      if (code === 0) {
        event.reply("update-yt-dlp-result", { success: true, output });
      } else {
        event.reply("update-yt-dlp-result", { success: false, error: errors || "Unknown error" });
      }
    });

    updater.on("error", (err) => {
      event.reply("update-yt-dlp-result", { success: false, error: err.message });
    });
  } catch (err: any) {
    event.reply("update-yt-dlp-result", { success: false, error: err.message });
  }
});


function createWindow() {
  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    icon: path.join(__dirname, "../public/icon.ico"), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })
  win.maximize()
  win.setMenuBarVisibility(false)

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send("console-log", "main.ts is working fine ")
    console.log("main.ts is working fine")
  })




  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(async () => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Optionally, kill background process on app quit:
// app.on('before-quit', () => {
//   if (backgroundProcess) backgroundProcess.kill()
// })
