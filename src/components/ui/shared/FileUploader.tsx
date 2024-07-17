import { useCallback, useState, useEffect } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../button";

type FileUploaderProps = {
  fileChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fileChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl || "");
  const [file, setFile] = useState<File[]>([]);

  useEffect(() => {
    if (mediaUrl) {
      setFileUrl(mediaUrl);
    }
  }, [mediaUrl]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fileChange(acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
    },
    [fileChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".svg", ".jpg"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrl ? (
        <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
          <img
            src={fileUrl}
            alt="uploaded file"
            className="file_uploader-img"
          />
        </div>
      ) : (
        <div className="file_uploader-box ">
          <img
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Drag photo here
          </h3>
          <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

          <Button type="button" className="shad-button_dark_4">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;