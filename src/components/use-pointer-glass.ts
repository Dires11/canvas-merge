"use client";

import { useEffect } from "react";

type Reflection = { x: number; y: number; targetX: number; targetY: number };

/** One eased listener highlights the hovered card and its glass ancestors. */
export function usePointerGlass(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const active = new Map<HTMLElement, Reflection>();
    let frame = 0;
    let previousTime = 0;

    const clear = () => {
      active.forEach((_, element) =>
        element.removeAttribute("data-pointer-active"),
      );
      active.clear();
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    };
    const paint = (element: HTMLElement, point: Reflection) => {
      element.style.setProperty("--pointer-x", `${point.x}px`);
      element.style.setProperty("--pointer-y", `${point.y}px`);
    };
    const update = (time: number) => {
      const dt = previousTime ? Math.min(time - previousTime, 64) : 16;
      previousTime = time;
      const ease = 1 - Math.exp(-dt / 80);
      let moving = false;
      active.forEach((point, element) => {
        point.x += (point.targetX - point.x) * ease;
        point.y += (point.targetY - point.y) * ease;
        paint(element, point);
        moving ||=
          Math.abs(point.targetX - point.x) +
            Math.abs(point.targetY - point.y) >
          0.1;
      });
      if (moving) {
        frame = requestAnimationFrame(update);
      } else {
        frame = 0;
        previousTime = 0;
      }
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) {
        clear();
        return;
      }
      const hovered = new Set<HTMLElement>();
      let element = event.target.closest<HTMLElement>("[data-glass-pointer]");
      while (element) {
        hovered.add(element);
        const rect = element.getBoundingClientRect();
        // Keep the glow from reaching the opposite edge, even on short controls.
        element.style.setProperty(
          "--pointer-radius-y",
          `${Math.min(70, rect.height / 2)}px`,
        );
        const targetX = event.clientX - rect.left;
        const targetY = event.clientY - rect.top;
        const point = active.get(element);
        if (point) {
          point.targetX = targetX;
          point.targetY = targetY;
        } else {
          const initial = { x: targetX, y: targetY, targetX, targetY };
          active.set(element, initial);
          paint(element, initial);
          element.setAttribute("data-pointer-active", "");
        }
        element =
          element.parentElement?.closest<HTMLElement>("[data-glass-pointer]") ??
          null;
      }
      active.forEach((_, element) => {
        if (!hovered.has(element)) {
          element.removeAttribute("data-pointer-active");
          active.delete(element);
        }
      });
      if (!active.size) clear();
      else if (!frame) frame = requestAnimationFrame(update);
    };
    const leaveWindow = (event: PointerEvent) => {
      if (!event.relatedTarget) clear();
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leaveWindow);
    window.addEventListener("blur", clear);
    window.addEventListener("scroll", clear, { passive: true, capture: true });
    return () => {
      clear();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leaveWindow);
      window.removeEventListener("blur", clear);
      window.removeEventListener("scroll", clear, true);
    };
  }, [enabled]);
}
