import React, { useRef } from "react";
import { Button, Upload } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

interface ImageUploaderProps {
  url?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  url,
  onUpload,
  onRemove,
  disabled = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const uploadBoxStyle = {
    position: "relative" as const,
    width: "60px",
    height: "60px",
    border: "1px dashed #d9d9d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#fafafa",
    cursor: disabled ? "not-allowed" : "pointer",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  };

  const overlayStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "none" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const handleUploadChange = (info: any) => {
    console.log("Upload change triggered:", info);
    const file = info.file; // Lấy file trực tiếp từ info.file
    if (file) {
      console.log("File selected:", file);
      onUpload(file); // Gọi onUpload với file
    } else {
      console.log("No file found in upload event");
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && overlayRef.current) {
      overlayRef.current.style.display = "flex";
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && overlayRef.current) {
      overlayRef.current.style.display = "none";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (url) {
        onRemove();
      }
    }
  };

  return (
    <div
      style={uploadBoxStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={url ? "Image uploader with delete option" : "Image uploader"}
    >
      {url ? (
        <img src={url} alt="Uploaded" style={imageStyle} />
      ) : (
        <UploadOutlined style={{ fontSize: 20, color: "#999" }} />
      )}
      <div ref={overlayRef} style={overlayStyle} className="overlay">
        <Upload
          showUploadList={false}
          beforeUpload={() => {
            console.log("Before upload triggered");
            return false; // Ngăn upload mặc định
          }}
          onChange={handleUploadChange}
          disabled={disabled}
          accept="image/*" // Giới hạn chỉ chọn file ảnh
        >
          <Button
            size="small"
            icon={<UploadOutlined />}
            disabled={disabled}
            style={{ background: "white" }}
            aria-label="Upload image"
          />
        </Upload>
        <Button
          size="small"
          icon={<DeleteOutlined />}
          danger
          onClick={onRemove}
          disabled={!url || disabled}
          aria-label="Delete image"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
