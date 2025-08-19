// server.js
import { createRequire } from 'node:module'
import download from '../download_video';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url)
const express = require('express')
const app = express();
const cors = require('cors')
app.use(cors())
const PORT = 3000;


// Middleware to parse JSON
app.use(express.json());

// Example endpoint
app.post('/download', async (req, res)  => {
  console.log('Received:', req.body);

    const url = req.body.url;
    const format_note = req.body.format_note || "best";
    const file_saved_at = await readFile("../file_saved_at.txt", "utf-8")

  
    const args = [
      url,
      "-f", format_note,
      "--newline",
      "-o", `${file_saved_at}/%(title)s.%(ext)s`
    ];

    download(args, null, file_saved_at)

  res.json({ status: 'success' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Background service listening on port ${PORT}`);
});
