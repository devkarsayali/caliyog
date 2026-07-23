import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./ImageModal.css";

function ImageModal({ isOpen, imageSrc, imageAlt, caption, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="image-lightbox-overlay select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="image-lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="image-lightbox-close cursor-pointer"
          onClick={onClose}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        <div className="image-lightbox-body">
          <img
            src={imageSrc}
            alt={imageAlt || "Enlarged View"}
            className="image-lightbox-img"
          />
        </div>

        {(caption || imageAlt) && (
          <div className="image-lightbox-caption">
            <p>{caption || imageAlt}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageModal;
