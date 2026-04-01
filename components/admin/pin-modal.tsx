"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete } from "lucide-react";
import { useAdmin } from "./admin-context";
import { cn } from "@/lib/utils";

export function PinModal() {
  const { showPinModal, closePinModal, authenticate } = useAdmin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (showPinModal) {
      setPin("");
      setError(false);
    }
  }, [showPinModal]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && !isSubmitting) {
      handleSubmit();
    }
  }, [pin]);

  const handleSubmit = async () => {
    if (isSubmitting || pin.length !== 6) return;

    setIsSubmitting(true);
    setError(false);

    const result = await authenticate(pin);

    if (!result.success) {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 500);
    }

    setIsSubmitting(false);
  };

  const handleDigitPress = useCallback((digit: string) => {
    if (pin.length < 6 && !isSubmitting) {
      setPin((prev) => prev + digit);
    }
  }, [pin.length, isSubmitting]);

  const handleDelete = useCallback(() => {
    if (!isSubmitting) {
      setPin((prev) => prev.slice(0, -1));
    }
  }, [isSubmitting]);

  // Handle keyboard input
  useEffect(() => {
    if (!showPinModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleDigitPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        closePinModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPinModal, handleDigitPress, handleDelete, closePinModal]);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <AnimatePresence>
      {showPinModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePinModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-sm mx-4 p-8 rounded-2xl",
              "bg-gradient-to-b from-[#1A1A24] to-[#111118]",
              "border border-primary/20 shadow-2xl shadow-black/50",
              error && "shake"
            )}
          >
            {/* Close button */}
            <button
              onClick={closePinModal}
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-10 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: i < pin.length ? 1.2 : 1,
                    backgroundColor: i < pin.length ? "var(--primary)" : "transparent",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="pin-dot"
                />
              ))}
            </div>

            {/* PIN pad */}
            <div className="grid grid-cols-3 gap-3">
              {digits.map((digit, i) => {
                if (digit === "") {
                  return <div key={i} />;
                }

                if (digit === "del") {
                  return (
                    <button
                      key={i}
                      onClick={handleDelete}
                      disabled={isSubmitting || pin.length === 0}
                      className="pin-button disabled:opacity-30"
                    >
                      <Delete className="w-6 h-6" />
                    </button>
                  );
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleDigitPress(digit)}
                    disabled={isSubmitting || pin.length >= 6}
                    className="pin-button disabled:opacity-30"
                  >
                    {digit}
                  </button>
                );
              })}
            </div>

            {/* Loading indicator */}
            {isSubmitting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
