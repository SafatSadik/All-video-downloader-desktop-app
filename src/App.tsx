import './App.css'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { SetStateAction, useEffect, useRef, useState } from 'react'
import Video_details from './components/ui/Video_details'

import { columns } from "./columns"
import { DataTable } from "./table"

//@ts-ignore


function App() {
  const download_button = useRef<HTMLButtonElement>(null)
  const [downloadButtonStatus, setDownloadButtonStatus] = useState(false)
  const [inputText, setInputText] = useState("")
  const [showInfo, setShowInfo] = useState(false)
  const [videoData, setVideoData] = useState({})
  const [showTable, setShowTable] = useState(false)
  const [tableData, setTableData] = useState<any[]>([])
  const [dark, setDark] = useState(false)
  const [updatingYtdlp, setUpdatingYtdlp] = useState(false)


  useEffect(() => {
    const handleUpdateYtdlpResult = (_: any, data: { success: any; output: any; error: any }) => {
      setUpdatingYtdlp(false);
      if (data.success) {
        alert("yt-dlp updated successfully!\n" + data.output);
      } else {
        alert("Failed to update yt-dlp: " + data.error);
      }
    };

    const handleConsoleLog = (_: any, data: any) => {
      console.log(data);
    };

    const handleAllVideoDetails = (_: any, data: any) => {
      if (data === "[]") {
        setShowTable(false);
      } else {
        setShowTable(true);
        setTableData(JSON.parse(data));
      }
    };

    const handleProgressData = (_: any, details: { id: any }) => {
      setTableData(prevarray => {
        const exists = prevarray.some(node => node.id === details.id);
        const newData = exists
          ? prevarray.map(item =>
            item.id === details.id ? { ...item, ...details } : item
          )
          : [...prevarray, details];

        if (!showTable && newData.length > 0) setShowTable(true);

        return newData;
      });
    };

    const handleDownloadComplete = (_: any, info: any) => {
      setTableData(prevarray => prevarray.filter(item => item.id !== info));
      window.ipcRenderer.send("get_all_video_details");
    };

    const handleDataFromMain = (_: any, data: SetStateAction<{}>) => {
      if (data === "video_not_found") {
        alert("video not found");
        setDownloadButtonStatus(false);
        setShowInfo(false);
        setVideoData({});
        return;
      }
      setVideoData(data);
      setShowInfo(true);
      setInputText("");
      setDownloadButtonStatus(false);
    };

    // Register listeners
    window.ipcRenderer.on("update-yt-dlp-result", handleUpdateYtdlpResult);
    window.ipcRenderer.on("console-log", handleConsoleLog);
    window.ipcRenderer.on("all_video_details", handleAllVideoDetails);
    window.ipcRenderer.on("progress_data", handleProgressData);
    window.ipcRenderer.on("download_complete", handleDownloadComplete);
    window.ipcRenderer.on("data_from_main", handleDataFromMain);

    // Initial request
    window.ipcRenderer.send("get_all_video_details");

    // Cleanup
    return () => {
      window.ipcRenderer.off("update-yt-dlp-result", handleUpdateYtdlpResult);
      window.ipcRenderer.off("console-log", handleConsoleLog);
      window.ipcRenderer.off("all_video_details", handleAllVideoDetails);
      window.ipcRenderer.off("progress_data", handleProgressData);
      window.ipcRenderer.off("download_complete", handleDownloadComplete);
      window.ipcRenderer.off("data_from_main", handleDataFromMain);
    };
  }, []);



  function handleRemoveAll() {
    window.ipcRenderer.send("remove_all_video_data")
    window.ipcRenderer.send("get_all_video_details")
  }


  function handleDownload() {
    if (!downloadButtonStatus) {
      setDownloadButtonStatus(true)
      window.ipcRenderer.send("get_video_information", inputText)
    }
  }


  return (
    <div
      className={`flex flex-col items-center justify-center w-screen min-h-screen transition-colors duration-300 overflow-x-hidden ${dark
        ? "bg-gradient-to-br from-[#000814] via-[#001d3d] to-[#003566] text-[#caf0f8]"
        : "bg-gradient-to-br from-gray-100 via-gray-50 to-white text-gray-900"
        }`}
    >
      <div className="wrapper flex flex-col items-center w-full max-w-4xl p-6 sm:p-10 rounded-2xl shadow-xl">

        {/* Top Bar */}
        <div className="top_bar w-full flex gap-1.5 justify-end">

          <div className={`flex items-center justify-center rounded-full h-9 w-9 cursor-pointer shadow-md p-2 
         ${updatingYtdlp ? "!opacity-50 !cursor-not-allowed hover:scale-100 " : "hover:scale-110 transition-transform"} 
          ${dark ? "bg-[#0077b6] text-[#caf0f8]" : "bg-gray-200 text-gray-800"}
     focus:outline-none border-0`}
            title={updatingYtdlp ? "Updating packages please wait" : "Click here to update packages"}
            onClick={() => {
              if (!updatingYtdlp) {
                window.ipcRenderer.send("update-yt-dlp")
                setUpdatingYtdlp(true)
              }

            }}
          >
            <svg viewBox="0 0 640 640"><path d="M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z" /></svg>
          </div>

          <div className={`flex items-center justify-center rounded-full h-9 w-9 cursor-pointer shadow-md hover:scale-110 transition-transform ${dark ? "bg-[#0077b6] text-[#caf0f8]" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setDark(prev => !prev)}
            title="Toggle theme">
            {dark ? "☀️" : "🌙"}
          </div>
          <div className={`flex items-center justify-center rounded-full h-9 w-9 cursor-pointer shadow-md hover:scale-110 transition-transform p-2 ${dark ? "bg-[#0077b6] text-[#caf0f8]" : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => {
              // Renderer
              window.ipcRenderer.send("pick-download-folder")

            }}
          >
            <svg viewBox="0 0 512 512"><path d="M0 96C0 60.7 28.7 32 64 32l132.1 0c19.1 0 37.4 7.6 50.9 21.1L289.9 96 448 96c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-256c0-8.8-7.2-16-16-16l-161.4 0c-10.6 0-20.8-4.2-28.3-11.7L213.1 87c-4.5-4.5-10.6-7-17-7L64 80z" /></svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-center">
          {dark ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00b4d8] to-[#0096c7]">
              All Video Downloader
            </span>
          ) : (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              All Video Downloader
            </span>
          )}
          <h6 className='text-xl'>By shafat</h6>
        </h1>

        <p className={`mt-2 text-sm ${dark ? "text-[#90e0ef]" : "text-gray-500"}`}>
          Paste a link, hit download — simple, fast, and reliable.
        </p>

        {/* Input Area */}
        <div className={`download_container flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 w-full mt-6 rounded-xl shadow-inner
      ${dark
            ? "border border-[#00b4d8]/60 bg-[#001f3f]/90"
            : "border border-gray-300 bg-white/70"
          }`}>
          <Input
            value={inputText}
            onChange={(k) => setInputText(k.target.value)}
            type="text"
            className={`h-11 text-base flex-1 rounded-lg
          ${dark
                ? "border-[#00b4d8]/70 bg-[#001f3f] text-[#caf0f8] placeholder-[#90e0ef] focus:border-[#0096c7] focus:ring-[#0096c7]"
                : "border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              }`}
            placeholder="Paste YouTube link here"
          />
          <Button
            disabled={inputText == "" || downloadButtonStatus == true}
            ref={download_button}
            onClick={handleDownload}
            className={`h-11 px-6 rounded-lg  font-bold shadow-md
              ${downloadButtonStatus ? 'jelly' : ''}
          ${dark
                ? "bg-teal-600! hover:opacity-90! text-white!"
                : "bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 text-black"
              }`}
          >
            {downloadButtonStatus ? "Wait a second" : "Download"}
          </Button>
        </div>

        {/* Video Info */}
        {showInfo && (
          <div className="mt-6 w-full">
            <Video_details
              videoData={videoData}
              setVideoData={setVideoData}
              showInfo={showInfo}
              setShowInfo={setShowInfo}
            />
          </div>
        )}

        {/* Downloaded List */}
        {showTable && (
          <div className={`downloaded_videos_list w-full mt-6 rounded-xl p-4 shadow-inner
        ${dark
              ? "border border-[#00b4d8]/60 bg-[#001f3f]/90 text-white"
              : "border border-gray-300 bg-white/70"
            }`}>
            <DataTable columns={columns} data={tableData} dark={dark} handleRemoveAll={handleRemoveAll} />
          </div>
        )}
      </div>
    </div>





  )
}

export default App
