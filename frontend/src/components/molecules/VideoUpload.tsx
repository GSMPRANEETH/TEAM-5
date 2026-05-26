import { useState, useRef } from "react";
import { UploadCloud, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoUploadProps {
  onVideoSelect: (file: File) => void;
  disabled?: boolean;
}

export function VideoUpload({ onVideoSelect, disabled }: VideoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
        onVideoSelect(file);
      } else {
        alert("Please upload a valid video file (MP4, WebM, etc.)");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
        onVideoSelect(file);
      } else {
        alert("Please upload a valid video file (MP4, WebM, etc.)");
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-4 border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20 rounded-xl transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-300">
            <FileVideo className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
              {selectedFile.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSelection}
          disabled={disabled}
          className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all ${
        dragActive
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
          : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-400 dark:hover:border-indigo-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={disabled ? undefined : handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      aria-label="Upload video file"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
          <UploadCloud className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Click to upload video
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            or drag and drop (MP4, WebM, MOV)
          </p>
        </div>
      </div>
    </div>
  );
}
