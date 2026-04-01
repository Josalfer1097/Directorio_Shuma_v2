"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";
import { useAdmin } from "./admin-context";
import { cn } from "@/lib/utils";

export function PinModal() {
  const { showPinModal, closePinModal, authenticate } = useAdmin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (showPinModal) {
      setPin("");
      setError(false);
      setSuccess(false);
    }
  }, [showPinModal]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && !isSubmitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const handleSubmit = async () => {
    if (isSubmitting || pin.length !== 6) return;

    setIsSubmitting(true);
    setError(false);

    const result = await authenticate(pin);

    if (!result.success) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPin("");
      }, 500);
    } else {
      setSuccess(true);
      // Modal will close via context
    }

    setIsSubmitting(false);
  };

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (pin.length < 6 && !isSubmitting) {
        setPin((prev) => prev + digit);
      }
    },
    [pin.length, isSubmitting]
  );

  const handleDelete = useCallback(() => {
    if (!isSubmitting) {
      setPin((prev) => prev.slice(0, -1));
    }
  }, [isSubmitting]);

  const handleClear = useCallback(() => {
    if (!isSubmitting) {
      setPin("");
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

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];

  return (
    <AnimatePresence>
      {showPinModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pin-overlay"
          onClick={closePinModal}
        >
          {/* Content container - prevent click propagation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center"
          >
            {/* Glowing emblem */}
            <motion.div
              className="pin-emblem mb-8"
              animate={
                success
                  ? { scale: [1, 1.2, 1], boxShadow: "0 0 60px var(--gold-glow)" }
                  : {}
              }
            >
              <span className="font-display text-3xl text-[--bg-base]">S</span>
            </motion.div>

            {/* PIN dots */}
            <div className={cn("pin-dots", error && "shake")}>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: i < pin.length ? 1.15 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "pin-dot",
                    i < pin.length && !error && !success && "filled",
                    error && i < pin.length && "error",
                    success && "success"
                  )}
                />
              ))}
            </div>

            {/* PIN keypad */}
            <div className="pin-keypad">
              {digits.map((digit, i) => {
                if (digit === "clear") {
                  return (
                    <button
                      key={i}
                      onClick={handleClear}
                      disabled={isSubmitting || pin.length === 0}
                      className={cn(
                        "pin-key text-sm",
                        (isSubmitting || pin.length === 0) && "opacity-30"
                      )}
                    >
                      C
                    </button>
                  );
                }

                if (digit === "del") {
                  return (
                    <button
                      key={i}
                      onClick={handleDelete}
                      disabled={isSubmitting || pin.length === 0}
                      className={cn(
                        "pin-key",
                        (isSubmitting || pin.length === 0) && "opacity-30"
                      )}
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
                    className={cn(
                      "pin-key",
                      (isSubmitting || pin.length >= 6) && "opacity-30"
                    )}
                  >
                    {digit}
                  </button>
                );
              })}
            </div>

            {/* Loading indicator */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <div className="w-6 h-6 border-2 border-[--gold] border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </motion.div>

          {/* Subtle watermark */}
          <span className="pin-watermark font-display tracking-widest">
            ·
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
