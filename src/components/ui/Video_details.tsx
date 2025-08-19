import { useState } from 'react'
import { Button } from './button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// @ts-ignore

function Video_details({ videoData ,setVideoData,showInfo,setShowInfo}) {
    const [format_note,setFormat_note] = useState("best")
    
    function downloadHandler() {
        console.log("mew mew \n\n")
        console.log("video url in video details::", videoData.video_url)
        window.ipcRenderer.send("download_video",
            {
                video_url: videoData.video_url,
                format_note: format_note,
                title:videoData.title,
                size: videoData.size,
                
        })
        setVideoData({})
        setShowInfo(false)
        
    }

    return (
        <div className=' flex items-center gap-10 rounded-2xl  w-full px-8 p-8 shadow-xl'>
            <div className="title h-full flex items-center overflow-hidden ">
                <img className="rounded-2xl h-full w-full" src={videoData.thumbnail} alt={videoData.title} />
            </div>
            <div className="description h-full flex flex-col items-start justify-center gap-0.5">
                <div className="title text-teal-400 overflow-ellipsis w-full  text-2xl">{videoData.title}</div>
                <div className="channel">Channel Name : {videoData.uploader}</div>
                <div className="duration">Duration {videoData.duration} s</div>
                <div className="like_dislike_container flex gap-10">
                    <div className="">Views: {videoData.view_count}</div><div className="">Likes: {videoData.like_count}</div>
                </div>
                <div className="flex gap-7 w-full mt-6 mb-3 mx-2">
                    <Button onClick={downloadHandler} className='w-1/2 text-teal-400 shadow-xl cursor-pointer text-xl p-5'>Download</Button>
                    <Select onValueChange={(value)=>{setFormat_note(value)}} >
                        <SelectTrigger className='w-[180px]' >
                            <SelectValue placeholder='Select quality' />
                        </SelectTrigger>
                        <SelectContent className='shadow-xl'>
                            {videoData.formats.map((f: any, index: any) => (
                                <SelectItem className='focus:bg-accent focus:text-accent-foreground dark:bg-background dark:text-foreground' value={f.format_id} key={index} >
                                    {f.format_note}  {Math.round(f.filesize / (1024 * 1024))} {"Mb"}
                                </SelectItem>
                            ))
                            }
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
export default Video_details