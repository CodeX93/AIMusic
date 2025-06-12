"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, Music } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function AudioUploader({ onFileUpload, isProcessing }) {
  const [uploadedFile, setUploadedFile] = useState(null)

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Maximum file size is 50MB",
            variant: "destructive",
          })
          return
        }

        setUploadedFile(file)
        onFileUpload(file)

        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully`,
        })
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".flac", ".aac"],
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 ${
          isDragActive ? "border-cyan-500 bg-cyan-500/10" : "border-zinc-700 hover:border-cyan-500/50"
        } transition-colors duration-200 cursor-pointer text-center`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
            <p className="text-zinc-400">Processing audio...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center justify-center">
            <div className="bg-cyan-500/10 rounded-full p-3 mb-3">
              <Music className="h-6 w-6 text-cyan-500" />
            </div>
            <p className="text-zinc-300 font-medium mb-1">{uploadedFile.name}</p>
            <p className="text-zinc-500 text-sm">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-cyan-400 hover:text-cyan-300"
              onClick={(e) => {
                e.stopPropagation()
                setUploadedFile(null)
              }}
            >
              Upload a different file
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="bg-zinc-800 rounded-full p-3 mb-3">
              <Upload className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-zinc-300 font-medium mb-1">Drag & drop audio file here</p>
            <p className="text-zinc-500 text-sm mb-3">or click to browse</p>
            <p className="text-zinc-600 text-xs">Supports MP3, WAV, OGG, FLAC (max 50MB)</p>
          </div>
        )}
      </div>
    </div>
  )
}
