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
        "border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer",
        "hover-elevate",
        isDragActive && "border-primary bg-primary/5 scale-[1.02]",
        !isDragActive && "border-border",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      data-testid="upload-zone"
    >
      <input {...getInputProps()} data-testid="input-file-upload" />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <FileText className="h-16 w-16 text-primary" />
        ) : (
          <CloudUpload className="h-16 w-16 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-xl font-medium mb-2">
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
          </p>
          <p className="text-sm text-muted-foreground">
            PDF or DOCX, max 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
