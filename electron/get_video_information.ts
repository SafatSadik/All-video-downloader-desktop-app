import { BrowserWindow, ipcMain } from "electron";
import {spawn } from "node:child_process";
import { app } from "electron";
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))



ipcMain.on("get_video_information", (event, video_url) => {
  const window = BrowserWindow.getAllWindows();
  let win: Electron.BrowserWindow
  if (window.length > 0) {
    win = window[0]
    win?.webContents.send("console-log", "get_video_information is working fine")
  }

  const isDev = !app.isPackaged;

  const exeBasePath = isDev
    ? path.join(__dirname, "..") // dev: project root
    : process.resourcesPath;     // prod: resources folder

  const ytdlpPath = path.join(exeBasePath, "yt-dlp.exe");


  const args = [
    "--no-playlist",
    "-j",
    "--skip-download",
    video_url
  ];

  const ytProcess = spawn(ytdlpPath, args, { detached: false });

  let stdoutData = "";
  let stderrData = "";

  ytProcess.stdout.on("data", (data) => {
    stdoutData += data.toString();
  });

  ytProcess.stderr.on("data", (data) => {
    stderrData += data.toString();
    console.error("yt-dlp stderr:", data.toString());
  });

  ytProcess.on("error", (err) => {
    console.error("yt-dlp spawn error:", err);
    win.webContents.send("console-log", err.message);
    event.sender.send("data_from_main", "video_not_found");
  });

  ytProcess.on("close", (code) => {
    if (code !== 0) {
      console.error("yt-dlp exited with code", code, stderrData);
      win.webContents.send("console-log", stderrData);
      event.sender.send("data_from_main", "video_not_found");
      return;
    }

    // parse JSON output
    let info;
    try {
      info = JSON.parse(stdoutData);
    } catch (e: any) {
      console.error("JSON parse error:", e.message);
      win.webContents.send("console-log", e.message);
      event.sender.send("data_from_main", "parse_error");
      return;
    }

    const filtered = {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      video_url,
      uploader: info.uploader,
      view_count: info.view_count,
      like_count: info.like_count,
      formats: (info.formats ?? [])
        .filter((f: any) => f.vcodec !== "none" && f.ext === "mp4" && f.filesize > 0)
        .sort((a: any, b: any) => (b.filesize ?? 0) - (a.filesize ?? 0))
        .map((f: any) => ({
          filesize: f.filesize,
          format_note: f.format_note,
          format_id: f.format_id,
        })),
    };

    event.sender.send("data_from_main", filtered);
  });

});