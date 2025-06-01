import React from "react";
import { Tag, Tooltip, Button } from "antd";
import { TweenOneGroup, IEndCallback } from "rc-tween-one";
import { Category } from "@/types/category";

interface Props {
  categories: Category[];
  categoryPaths: Record<string, string>;
  isLoading: boolean;
  isError: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryTagList: React.FC<Props> = ({
  categories,
  categoryPaths,
  isLoading,
  isError,
  onEdit,
  onDelete,
}) => {
  const forMap = (category: Category) => {
    const path = categoryPaths[category.id] || category.name;

    return (
      <span key={category.id} style={{ display: "block", margin: "12px" }}>
        <Tooltip title={path}>
          <Tag
            closable
            onClose={(e) => {
              e.preventDefault();
              onDelete(category.id);
            }}
            style={{
              borderColor: category.isActive ? "#1890ff" : "#d9d9d9",
              backgroundColor: "#f0f0f0",
              color: "#000000",
              borderWidth: 1,
              borderStyle: "solid",
              padding: "4px 8px",
            }}
          >
            {path}
            <Button
              type="link"
              size="small"
              onClick={() => onEdit(category)}
              style={{ padding: 0, marginLeft: 8 }}
            >
              Edit
            </Button>
          </Tag>
        </Tooltip>
      </span>
    );
  };

  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: "8px", width: "100%" }}
    >
      <TweenOneGroup
        key={categories.length}
        appear
        enter={{ scale: 1.2, opacity: 1, type: "from", duration: 100 }}
        leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
        style={{ display: "flex", flexWrap: "wrap", gap: "8px", width: "100%" }}
        onEnd={(e: IEndCallback) => {
          if (e.type === "appear" || e.type === "enter") {
            if (e.target) {
              if (Array.isArray(e.target)) {
                e.target.forEach((el) => {
                  el.style.display = "block";
                  el.style.transform = "scale(1.2)";
                  el.style.opacity = "1";
                });
              } else {
                e.target.style.display = "block";
                e.target.style.transform = "scale(1.2)";
                e.target.style.opacity = "1";
              }
            }
          }
        }}
      >
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>Failed to load categories</p>
        ) : (
          categories.map(forMap)
        )}
      </TweenOneGroup>
    </div>
  );
};

export default CategoryTagList;