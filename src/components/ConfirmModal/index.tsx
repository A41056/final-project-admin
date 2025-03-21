import React from "react";
import { Modal } from "antd";

interface ConfirmModalProps {
  visible: boolean;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  text,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      title="Confirmation"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ danger: true }}
    >
      <p>{text}</p>
    </Modal>
  );
};

export default ConfirmModal;
