"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAdmin } from "./admin-context";

export function AdminTrigger() {
  const { openPinModal, isAuthenticated } = useAdmin();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressDuration = 1500; // 1.5 seconds

  // Keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        if (!isAuthenticated) {
          openPinModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openPinModal, isAuthenticated]);

  // Setup long-press on logo for mobile
  const setupLongPress = useCallback(() => {
    if (isAuthenticated) return;

    // Find logo elements (header logo on desktop, mobile logo)
    const logoElements = document.querySelectorAll('[data-logo-trigger]');
    
    const handleTouchStart = () => {
      longPressTimer.current = setTimeout(() => {
        openPinModal();
      }, longPressDuration);
    };

    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleTouchMove = () => {
      // Cancel if user moves finger
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    logoElements.forEach((el) => {
      el.addEventListener('touchstart', handleTouchStart, { passive: true });
      el.addEventListener('touchend', handleTouchEnd);
      el.addEventListener('touchmove', handleTouchMove);
      el.addEventListener('touchcancel', handleTouchEnd);
    });

    return () => {
      logoElements.forEach((el) => {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchend', handleTouchEnd);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchcancel', handleTouchEnd);
      });
    };
  }, [openPinModal, isAuthenticated]);

  useEffect(() => {
    const cleanup = setupLongPress();
    return cleanup;
  }, [setupLongPress]);

  // This component doesn't render anything visible
  // The trigger is the logo itself with long-press on mobile
  // and Ctrl+Shift+A on desktop
  return null;
}
