"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GlassContainer } from "./glass-container";

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
      className="fixed inset-0 z-9999 flex items-center justify-center"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
    >
      <GlassContainer className="relative w-full max-w-md rounded-2xl backdrop-blur-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="text-card-foreground hover:bg-card/40 focus:ring-primary absolute top-3 right-3 rounded-lg p-1 focus:ring-2 focus:outline-none"
        >
          ✕
        </button>

        {children}
      </GlassContainer>
    </div>,
    document.body,
  );
}
