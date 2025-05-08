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
    width: "100px", // Tăng kích thước để rõ hơn
    height: "100px",
    border: "1px dashed #d9d9d9",
    borderRadius: "6px", // Thêm borderRadius
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#ffffff", // Đổi nền thành trắng
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)", // Thêm bóng nhẹ
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    borderRadius: "6px", // Đồng bộ borderRadius
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
    transition: "opacity 0.2s ease-in-out", // Thêm transition cho overlay
    opacity: 0,
  };

  const handleUploadChange = (info: any) => {
    const file = info.file;
    if (file) {
      onUpload(file);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && overlayRef.current) {
      overlayRef.current.style.display = "flex";
      overlayRef.current.style.opacity = "1"; // Hiển thị mượt mà
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && overlayRef.current) {
      overlayRef.current.style.display = "none";
      overlayRef.current.style.opacity = "0";
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
        <UploadOutlined style={{ fontSize: 24, color: "#999" }} /> // Tăng kích thước icon
      )}
      <div ref={overlayRef} style={overlayStyle} className="overlay">
        <Upload
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleUploadChange}
          disabled={disabled}
          accept="image/*"
        >
          <Button
            size="small"
            icon={<UploadOutlined />}
            disabled={disabled}
            style={{ background: "white", borderRadius: "4px" }}
            aria-label="Upload image"
          />
        </Upload>
        <Button
          size="small"
          icon={<DeleteOutlined />}
          danger
          onClick={onRemove}
          disabled={!url || disabled}
          style={{ borderRadius: "4px" }}
          aria-label="Delete image"
        />
      </div>
    </div>
  );
};

export default ImageUploader;
