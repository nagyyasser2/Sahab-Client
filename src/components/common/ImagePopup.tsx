import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

type ImagePopupProps = {
  isOpen: boolean;
  imageUrl: string;
  altText: string;
  onClose: () => void;
};

const ImagePopup = ({
  isOpen,
  imageUrl,
  altText,
  onClose,
}: ImagePopupProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative bg-white  shadow-[0_0_20px_rgba(0,0,0,0.3)]  max-w-[90vw] mx-4 transform transition-all"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close image"
        >
          <IoClose className="h-5 w-5 text-gray-700" />
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-[600px] object-contain "
        />
      </div>
    </div>
  );

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("Modal root not found");
    return null;
  }

  return createPortal(modalContent, modalRoot);
};

export default ImagePopup;
