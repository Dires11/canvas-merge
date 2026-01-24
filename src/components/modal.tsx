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
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* modal content wrapper */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="
            relative w-full max-w-md rounded-2xl p-6
            bg-white/45
            border border-white/45
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
              text-gray-700
              hover:bg-white/40
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            ✕
          </button>

          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
