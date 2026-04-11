"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, X } from "lucide-react";
import { useAdmin } from "./admin-context";
import { cn } from "@/lib/utils";

export function PinModal() {
  const { showPinModal, closePinModal, authenticate } = useAdmin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showPinModal) {
      setPin("");
      setError(false);
      setSuccess(false);
    }
  }, [showPinModal]);

  const handleSubmit = useCallback(async (currentPin: string) => {
    if (isSubmitting || currentPin.length !== 6) return;

    setIsSubmitting(true);
    setError(false);

    const result = await authenticate(currentPin);

    if (!result.success) {
      setError(true);
      setTimeout(() => {
        setError(false);
        setPin("");
        setIsSubmitting(false);
      }, 800);
    } else {
      setSuccess(true);
      setTimeout(() => {
        closePinModal();
        setIsSubmitting(false);
      }, 600);
    }
  }, [isSubmitting, authenticate, closePinModal]);

  useEffect(() => {
    if (pin.length === 6 && !isSubmitting) {
      handleSubmit(pin);
    }
  }, [pin, isSubmitting, handleSubmit]);

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

  useEffect(() => {
    if (!showPinModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        // Already handled by trigger or context
      } else if (e.key >= "0" && e.key <= "9") {
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

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

  return (
    <AnimatePresence>
      {showPinModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/94 backdrop-blur-[24px]"
        >
          <button 
            onClick={closePinModal}
            className="absolute top-8 right-8 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="flex flex-col items-center w-full max-w-xs">
            {/* PIN indicators */}
            <div className={cn(
              "flex gap-4 mb-12",
              error && "animate-shake"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: i < pin.length ? 1.2 : 1,
                    backgroundColor: i < pin.length ? (error ? "#E05252" : (success ? "#C9A84C" : "#00C9A7")) : "transparent"
                  }}
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border border-white/20 transition-colors duration-200",
                    i < pin.length && !error && !success && "bg-gradient-to-r from-[#00C9A7] to-[#845EC2]"
                  )}
                  style={{
                    background: i < pin.length && !error && !success ? "linear-gradient(to right, #00C9A7, #845EC2)" : undefined
                  }}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {digits.map((digit) => (
                <motion.button
                  key={digit}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    if (digit === "C") setPin("");
                    else if (digit === "DEL") handleDelete();
                    else handleDigitPress(digit);
                  }}
                  className="h-20 w-full flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-2xl text-text-primary hover:bg-white/10 transition-colors"
                  style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}
                >
                  {digit === "DEL" ? <Delete className="w-6 h-6" /> : digit}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
