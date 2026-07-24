"use client";

/**
 * Bare-bones, dependency-free full-screen error display for the kiosk route.
 *
 * Intentionally uses ONLY plain DOM + inline styles: no Framer Motion, no
 * canvas, no masks, no 3D transforms, no design-token classes — so that it can
 * render even in the exact Safari/WebKit conditions that are blanking the
 * kiosk. Its whole job is to make a failure *visible on screen* (message +
 * stack), because Safari's Web Inspector has not been surfacing anything.
 */
export function KioskErrorView({
  title = "Error en el modo quiosco",
  message,
  stack,
  digest,
  onRetry,
}: {
  title?: string;
  message?: string | null;
  stack?: string | null;
  digest?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0a12",
        color: "#f2f0ec",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(16px, 4vw, 48px)",
        overflow: "auto",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        WebkitTextSizeAdjust: "100%",
      }}
    >
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#ff6b6b",
          margin: "0 0 8px",
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: "0.8rem", color: "#8888b0", margin: "0 0 20px" }}>
        Esta pantalla de diagnóstico aparece cuando algo en /quiosco falla.
        Comparte el mensaje y el stack de abajo.
      </p>

      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#55557a",
            marginBottom: 4,
          }}
        >
          Mensaje
        </div>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "0.9rem",
            color: "#ffd0d0",
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.25)",
            borderRadius: 8,
            padding: "10px 12px",
            margin: 0,
          }}
        >
          {message || "(sin mensaje)"}
        </pre>
      </div>

      {digest ? (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#55557a",
              marginBottom: 4,
            }}
          >
            Digest
          </div>
          <code style={{ fontSize: "0.8rem", color: "#9090b8" }}>{digest}</code>
        </div>
      ) : null}

      <div style={{ flex: 1, minHeight: 0, marginBottom: 20 }}>
        <div
          style={{
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#55557a",
            marginBottom: 4,
          }}
        >
          Stack trace
        </div>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "0.78rem",
            lineHeight: 1.5,
            color: "#b8b8d8",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "10px 12px",
            margin: 0,
          }}
        >
          {stack || "(sin stack trace)"}
        </pre>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            style={{
              appearance: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#0a0a12",
              background: "#00c9a7",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
            }}
          >
            Reintentar
          </button>
        ) : null}
        <a
          href="/"
          style={{
            fontFamily: "inherit",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#f2f0ec",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "10px 20px",
            textDecoration: "none",
          }}
        >
          Volver al directorio
        </a>
      </div>
    </div>
  );
}
