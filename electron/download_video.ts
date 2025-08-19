import { spawn } from 'node:child_process';
import { BrowserWindow } from 'electron';
import fs from 'node:fs';
import { randomUUID } from 'crypto';
import { app } from "electron";
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// @ts-ignore

export default async function download(args: any[], title: any, file_saved_at: any) {
  let videoSize = "";
  const id = randomUUID();
  const windows = BrowserWindow.getAllWindows();
  let win: Electron.BrowserWindow



  if (windows.length > 0) {
    win = windows[0]; // first created window
    win?.webContents.send("console-log", "download.ts is working fine ");
    win?.webContents.send("progress_data",
      {
        id: id,
        status: `Processing ⏳`,
        transfer_rate: "",
        time_left: "",
        file_saved_at: file_saved_at,

      })

  }


  const isDev = !app.isPackaged;

  const exeBasePath = isDev
    ? path.join(__dirname, "..") // dev: project root
    : process.resourcesPath;     // prod: resources folder

  const ytdlpPath = path.join(exeBasePath, "yt-dlp.exe");

  const ytdlp = spawn(ytdlpPath, args, { detached: false });

  let lastUpdate = 0;
  const UPDATE_INTERVAL = 500; // ms

  ytdlp.stdout.on("data", async (data) => {
    const now = Date.now();

    const message = data.toString().trim();
    win.webContents.send("console-log", message)
    //console.log(message)

    if (message.startsWith("[download]")) {
      const match = message.match(/(\d+\.\d+)%.*?of\s+([\d.]+[KMG]iB).*?at\s+([\d.]+[KMG]iB\/s).*?ETA\s+(\d+:\d+)/);
      if (match) {
        const [, percent, size, speed, eta] = match;
        videoSize = size;

        if (now - lastUpdate > UPDATE_INTERVAL) {
          lastUpdate = now;

          const windows = BrowserWindow.getAllWindows();
          if (windows.length > 0) {
            const win = windows[0];
            win?.webContents.send("progress_data", {
              id,
              title: title || "unknown video",
              size,
              status: `${percent}%`,
              transfer_rate: speed,
              time_left: eta
            });
          }
        }
      }
    } else {
      // Send non-progress info without spamming
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const win = windows[0];
        win?.webContents.send("download_info", message);
      }
    }
  });


  ytdlp.stderr.on("data", (data) => {
    const errorMsg = data.toString();
    console.error("yt-dlp error:", errorMsg);
    win?.webContents.send("download_error", errorMsg);
  });

  ytdlp.on("error", (err) => {
    console.error("Failed to start yt-dlp:", err.message);
    win?.webContents.send("download_error", err.message);
  });

  ytdlp.on("close", (code) => {
    // @ts-ignore
    let status
    if (code === 0) {
      status = 'Completed ✅'
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const win = windows[0]; // first created window
        win?.webContents.send("download_complete", id)
      }
    } else {
      status = "failed ❌"


      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const win = windows[0]; // first created window
        win?.webContents.send("download_complete", id);
      }
    }
    const date = new Date()
    const new_obj = {
      id: id,
      title: title || "unknown video",
      size: videoSize || "unknown",
      status: status,
      time_left: "",
      transfer_rate: "",
      downloaded_at: date,
      file_saved_at: file_saved_at
    }



    fs.readFile("./video_data.json", (_, data: any) => {
      let existing_array = JSON.parse(data)
      existing_array.push(new_obj)
      fs.writeFile("./video_data.json", JSON.stringify(existing_array), (_) => {})
    })



  });

}
