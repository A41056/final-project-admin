import React from "react";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
  visible: boolean;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<Props> = ({ visible, text, onConfirm, onCancel }) => {
  return (
    <ConfirmModal visible={visible} text={text} onConfirm={onConfirm} onCancel={onCancel} />
  );
};

export default ConfirmDeleteModal;