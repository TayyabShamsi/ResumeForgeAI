import { UploadZone } from "../UploadZone";

export default function UploadZoneExample() {
  return (
    <UploadZone
      onFileSelect={(file) => console.log("File selected:", file.name)}
      isLoading={false}
    />
  );
}
