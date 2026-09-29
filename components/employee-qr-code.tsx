"use client";

import dynamic from "next/dynamic";

// Loaded client-side only via next/dynamic so the QR encoder never ships in
// the initial server-rendered bundle or blocks first paint of the sheet.
const QRCodeSVG = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeSVG), {
  ssr: false,
  loading: () => <div className="w-[104px] h-[104px] rounded-lg bg-white/5 animate-pulse" />,
});

interface EmployeeQrCodeProps {
  value: string;
  primaryColor: string;
}

export function EmployeeQrCode({ value, primaryColor }: EmployeeQrCodeProps) {
  return (
    <div className="hidden md:flex flex-col items-center gap-2 shrink-0">
      <div
        className="p-2 rounded-lg"
        style={{ background: "#FFFFFF", border: `1px solid ${primaryColor}33` }}
      >
        <QRCodeSVG value={value} size={88} level="M" bgColor="#FFFFFF" fgColor="#0C0E11" />
      </div>
      <p
        className="text-center leading-tight"
        style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", maxWidth: "110px" }}
      >
        Escanea para guardar en tu celular
      </p>
    </div>
  );
}
