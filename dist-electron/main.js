import { BrowserWindow as w, app as g, ipcMain as P, dialog as N, shell as L } from "electron";
import { createRequire as W } from "node:module";
import { fileURLToPath as A } from "node:url";
import i from "node:path";
import v from "node:fs";
import { readFile as U } from "node:fs/promises";
import { spawn as O } from "node:child_process";
import { randomUUID as M } from "crypto";
import { access as J, writeFile as K, readFile as q } from "fs/promises";
import { constants as G } from "fs";
const H = i.dirname(A(import.meta.url));
async function $(o, e, t) {
  let s = "";
  const r = M(), f = w.getAllWindows();
  let a;
  f.length > 0 && (a = f[0], a == null || a.webContents.send("console-log", "download.ts is working fine "), a == null || a.webContents.send(
    "progress_data",
    {
      id: r,
      status: "Processing ⏳",
      transfer_rate: "",
      time_left: "",
      file_saved_at: t
    }
  ));
  const b = !g.isPackaged ? i.join(H, "..") : process.resourcesPath, x = i.join(b, "yt-dlp.exe"), u = O(x, o, { detached: !1 });
  let l = 0;
  const p = 500;
  u.stdout.on("data", async (_) => {
    const n = Date.now(), h = _.toString().trim();
    if (a.webContents.send("console-log", h), h.startsWith("[download]")) {
      const y = h.match(/(\d+\.\d+)%.*?of\s+([\d.]+[KMG]iB).*?at\s+([\d.]+[KMG]iB\/s).*?ETA\s+(\d+:\d+)/);
      if (y) {
        const [, d, c, C, T] = y;
        if (s = c, n - l > p) {
          l = n;
          const F = w.getAllWindows();
          if (F.length > 0) {
            const R = F[0];
            R == null || R.webContents.send("progress_data", {
              id: r,
              title: e || "unknown video",
              size: c,
              status: `${d}%`,
              transfer_rate: C,
              time_left: T
            });
          }
        }
      }
    } else {
      const y = w.getAllWindows();
      if (y.length > 0) {
        const d = y[0];
        d == null || d.webContents.send("download_info", h);
      }
    }
  }), u.stderr.on("data", (_) => {
    const n = _.toString();
    console.error("yt-dlp error:", n), a == null || a.webContents.send("download_error", n);
  }), u.on("error", (_) => {
    console.error("Failed to start yt-dlp:", _.message), a == null || a.webContents.send("download_error", _.message);
  }), u.on("close", (_) => {
    let n;
    if (_ === 0) {
      n = "Completed ✅";
      const d = w.getAllWindows();
      if (d.length > 0) {
        const c = d[0];
        c == null || c.webContents.send("download_complete", r);
      }
    } else {
      n = "failed ❌";
      const d = w.getAllWindows();
      if (d.length > 0) {
        const c = d[0];
        c == null || c.webContents.send("download_complete", r);
      }
    }
    const y = {
      id: r,
      title: e || "unknown video",
      size: s || "unknown",
      status: n,
      time_left: "",
      transfer_rate: "",
      downloaded_at: /* @__PURE__ */ new Date(),
      file_saved_at: t
    };
    v.readFile("./video_data.json", (d, c) => {
      let C = JSON.parse(c);
      C.push(y), v.writeFile("./video_data.json", JSON.stringify(C), (T) => {
      });
    });
  });
}
const Q = i.dirname(A(import.meta.url));
P.on("get_video_information", (o, e) => {
  const t = w.getAllWindows();
  let s;
  t.length > 0 && (s = t[0], s == null || s.webContents.send("console-log", "get_video_information is working fine"));
  const f = !g.isPackaged ? i.join(Q, "..") : process.resourcesPath, a = i.join(f, "yt-dlp.exe"), b = O(a, [
    "--no-playlist",
    "-j",
    "--skip-download",
    e
  ], { detached: !1 });
  let x = "", u = "";
  b.stdout.on("data", (l) => {
    x += l.toString();
  }), b.stderr.on("data", (l) => {
    u += l.toString(), console.error("yt-dlp stderr:", l.toString());
  }), b.on("error", (l) => {
    console.error("yt-dlp spawn error:", l), s.webContents.send("console-log", l.message), o.sender.send("data_from_main", "video_not_found");
  }), b.on("close", (l) => {
    if (l !== 0) {
      console.error("yt-dlp exited with code", l, u), s.webContents.send("console-log", u), o.sender.send("data_from_main", "video_not_found");
      return;
    }
    let p;
    try {
      p = JSON.parse(x);
    } catch (n) {
      console.error("JSON parse error:", n.message), s.webContents.send("console-log", n.message), o.sender.send("data_from_main", "parse_error");
      return;
    }
    const _ = {
      title: p.title,
      thumbnail: p.thumbnail,
      duration: p.duration,
      video_url: e,
      uploader: p.uploader,
      view_count: p.view_count,
      like_count: p.like_count,
      formats: (p.formats ?? []).filter((n) => n.vcodec !== "none" && n.ext === "mp4" && n.filesize > 0).sort((n, h) => (h.filesize ?? 0) - (n.filesize ?? 0)).map((n) => ({
        filesize: n.filesize,
        format_note: n.format_note,
        format_id: n.format_id
      }))
    };
    o.sender.send("data_from_main", _);
  });
});
async function X(o) {
  try {
    await J(o, G.F_OK);
  } catch {
    await K(o, "[]");
  }
  return await q(o, "utf8");
}
P.on("get_all_video_details", (o, e) => {
  X("./video_data.json").then((t) => {
    o.sender.send("all_video_details", t);
  }).catch((t) => {
    console.error("Error:", t);
  });
});
const z = W(import.meta.url), E = z("express"), j = E(), Y = z("cors");
j.use(Y());
const S = 3e3;
j.use(E.json());
j.use(E.urlencoded({ extended: !0 }));
j.get("/", (o, e) => {
  e.send("mew mew ");
});
j.post("/download", async (o, e) => {
  try {
    const t = o.body.url, s = o.body.format_note || "best", r = await U("./file_saved_at.txt", "utf-8"), f = [
      t,
      "-f",
      s,
      "--newline",
      "-o",
      `${r}/%(title)s.%(ext)s`
    ];
    $(f, null, r), e.json({ status: "success" });
  } catch (t) {
    console.error("POST /download error:", t), e.status(500).json({ error: t.message });
    const s = w.getAllWindows();
    s.length > 0 && s[0].webContents.send("console-log", `${t}`);
  }
});
j.listen(S, () => {
  setTimeout(() => {
    const o = w.getAllWindows();
    o.length > 0 && o[0].webContents.send("console-log", `Background service listening on port ${S}`), console.log(`Background service listening on port ${S}`);
  }, 1e4);
});
const Z = W(import.meta.url), D = i.dirname(A(import.meta.url));
process.env.APP_ROOT = i.join(D, "..");
const k = process.env.VITE_DEV_SERVER_URL, me = i.join(process.env.APP_ROOT, "dist-electron"), B = i.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = k ? i.join(process.env.APP_ROOT, "public") : B;
let m;
try {
  v.accessSync("./file_saved_at.txt", v.constants.F_OK);
} catch {
  v.writeFile("./file_saved_at.txt", g.getPath("downloads"), () => {
  });
}
P.on("pick-download-folder", async () => {
  const { canceled: o, filePaths: e } = await N.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (o || e.length === 0)
    return null;
  v.writeFile("./file_saved_at.txt", e[0], (t) => {
    t && console.error("Failed to save folder path:", t);
  });
});
P.on("remove_all_video_data", () => {
  v.writeFile("./video_data.json", "[]", () => {
  });
});
P.on("open-folder", (o, e) => {
  L.openPath(e);
});
P.on("download_video", async (o, e) => {
  const t = e.video_url, s = e.format_note || "best", r = await U("./file_saved_at.txt", "utf-8"), f = [
    t,
    "-f",
    s,
    "--newline",
    "-o",
    `${r}/%(title)s.%(ext)s`
  ];
  $(f, e.title, r);
});
const ee = !g.isPackaged, oe = ee ? i.join(D, "..") : process.resourcesPath, te = i.join(oe, "yt-dlp.exe");
P.on("update-yt-dlp", (o) => {
  try {
    const e = O(te, ["-U"], {
      detached: !1,
      // no orphan process
      stdio: ["ignore", "pipe", "pipe"]
      // capture stdout & stderr
    });
    let t = "", s = "";
    e.stdout.on("data", (r) => {
      t += r.toString();
    }), e.stderr.on("data", (r) => {
      s += r.toString();
    }), e.on("close", (r) => {
      r === 0 ? o.reply("update-yt-dlp-result", { success: !0, output: t }) : o.reply("update-yt-dlp-result", { success: !1, error: s || "Unknown error" });
    }), e.on("error", (r) => {
      o.reply("update-yt-dlp-result", { success: !1, error: r.message });
    });
  } catch (e) {
    o.reply("update-yt-dlp-result", { success: !1, error: e.message });
  }
});
function I() {
  const { screen: o } = Z("electron"), e = o.getPrimaryDisplay(), { width: t, height: s } = e.workAreaSize;
  m = new w({
    width: t,
    height: s,
    x: 0,
    y: 0,
    icon: i.join(D, "../public/icon.ico"),
    webPreferences: {
      preload: i.join(D, "preload.mjs")
    }
  }), m.maximize(), m.setMenuBarVisibility(!1), m.webContents.on("did-finish-load", () => {
    m == null || m.webContents.send("console-log", "main.ts is working fine "), console.log("main.ts is working fine");
  }), k ? m.loadURL(k) : m.loadFile(i.join(B, "index.html"));
}
g.whenReady().then(async () => {
  I();
});
g.on("window-all-closed", () => {
  process.platform !== "darwin" && (g.quit(), m = null);
});
g.on("activate", () => {
  w.getAllWindows().length === 0 && I();
});
export {
  me as MAIN_DIST,
  B as RENDERER_DIST,
  k as VITE_DEV_SERVER_URL
};
