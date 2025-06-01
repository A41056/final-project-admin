import React, { useEffect, useRef } from "react";
import { Input, TreeSelect } from "antd";
import { InputRef } from "antd";

interface Props {
  inputVisible: boolean;
  inputValue: string;
  inputParentId?: string;
  treeData: any[];
  onChangeValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeParent: (value?: string) => void;
  onConfirm: () => void;
  onBlur: () => void;
}

const CategoryInput: React.FC<Props> = ({
  inputVisible,
  inputValue,
  inputParentId,
  treeData,
  onChangeValue,
  onChangeParent,
  onConfirm,
  onBlur,
}) => {
  const inputRef = useRef<InputRef | null>(null);

  useEffect(() => {
    if (inputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputVisible]);

  if (!inputVisible) return null;

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Input
        ref={inputRef}
        type="text"
        size="small"
        style={{ width: 200 }}
        value={inputValue}
        onChange={onChangeValue}
        onPressEnter={onConfirm}
        onBlur={onBlur}
        placeholder="Enter categories, separated by commas"
      />
      <TreeSelect
        style={{ width: 200 }}
        value={inputParentId}
        onChange={onChangeParent}
        treeData={treeData}
        placeholder="Select parent category"
        allowClear
        showSearch
        treeNodeFilterProp="title"
      />
    </div>
  );
};

export default CategoryInput;