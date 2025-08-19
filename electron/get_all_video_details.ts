import { access, readFile, writeFile } from 'fs/promises';
import { constants } from 'fs';
import { ipcMain } from 'electron';
// @ts-ignore
export async function readOrCreateFile(filePath) {
  try {
    // Check if file exists
    await access(filePath, constants.F_OK);
  } catch {
    // If not exist, create empty file
    await writeFile(filePath, '[]');
  }

  // Now read file content
  const data = await readFile(filePath, 'utf8');
  return data;
}

ipcMain.on("get_all_video_details", (event, _) => {

  // Usage
  // change the url to ../url in the dev mode 
  //  cause in dev mode vite watches file in the directory to reload
  // if vite founds this changes then vite reloads the whole app
  readOrCreateFile('./video_data.json')
    .then(data => {

      event.sender.send("all_video_details", data)
    })
    .catch(err => {
      console.error('Error:', err);
    });
})

