"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ children, onClose }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4  bg-black/20 backdrop-blur-xs z-9999"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
    >
      <div
        className="
            relative w-full max-w-md rounded-2xl p-6
            bg-card/60
            border border-card/45
            shadow-2xl
          "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="
              absolute right-3 top-3
              rounded-lg p-1
              text-card-foreground
              hover:bg-card/40
              focus:outline-none focus:ring-2 focus:ring-primary
            "
        >
          ✕
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
}
