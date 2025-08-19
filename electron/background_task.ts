// server.js
import { createRequire } from 'node:module'
import download from './download_video';
import { readFile } from 'node:fs/promises';
import { BrowserWindow } from 'electron';

const require = createRequire(import.meta.url)
const express = require('express')
const app = express();
const cors = require('cors')
app.use(cors())
const PORT = 3000;


// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Example endpoint

app.get("/", (_: any, res: { send: (arg0: string) => void; }) => {
  res.send("mew mew ")
})

app.post('/download', async (req: { body: { url: any; format_note: any; }; }, res:any) => {
  try{
  const url = req.body.url;
  const format_note = req.body.format_note || "best";
  // change the url to ../url in the dev mode 
  //  cause in dev mode vite watches file in the directory to reload
  // if vite founds this changes then vite reloads the whole app
  const file_saved_at = await readFile("./file_saved_at.txt", "utf-8")


  const args = [
    url,
    "-f", format_note,
    "--newline",
    "-o", `${file_saved_at}/%(title)s.%(ext)s`
  ];

  download(args, null, file_saved_at)
  

  res.json({ status: 'success' });
  } catch (err:any) {
    console.error("POST /download error:", err);
    res.status(500).json({ error: err.message });
    const window = BrowserWindow.getAllWindows()
    if (window.length > 0) {
      let win = window[0]
      win.webContents.send("console-log", `${err}`)
    }
  }
});



// Start server
app.listen(PORT, () => {
  setTimeout(() => {
    const window = BrowserWindow.getAllWindows()
    if (window.length > 0) {
      let win = window[0]
      win.webContents.send("console-log", `Background service listening on port ${PORT}`)
    }
    console.log(`Background service listening on port ${PORT}`);
  }, 10000);

});
