import { useDropzone } from "react-dropzone";
import { CloudUpload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 md:p-12 transition-all cursor-pointer",
        isDragActive && "border-primary bg-primary/10 scale-[1.01]",
        !isDragActive && "border-border hover:border-primary/40 hover:bg-accent/5",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      data-testid="upload-zone"
    >
      <input {...getInputProps()} data-testid="input-file-upload" />
      <div className="flex flex-col items-center gap-3 md:gap-4">
        <div className={cn(
          "p-3 md:p-4 rounded-full transition-all duration-300",
          isDragActive ? "bg-primary/20" : "bg-primary/10"
        )}>
          {isDragActive ? (
            <FileText className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          ) : (
            <CloudUpload className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          )}
        </div>
        <div className="text-center space-y-1">
          <p className="text-base md:text-lg font-semibold">
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PDF or DOCX • Max 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
