import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title || "Xác nhận"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p>{message || "Bạn có chắc chắn muốn thực hiện hành động này?"}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>
            ĐÓNG
          </button>
          <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
            HỦY GIAO DỊCH
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;