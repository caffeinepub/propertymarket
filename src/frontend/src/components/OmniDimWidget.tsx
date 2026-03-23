import { useEffect } from "react";

export default function OmniDimWidget() {
  useEffect(() => {
    // Hide default OmniDim launcher button via CSS injection
    const style = document.createElement("style");
    style.id = "omnidim-custom-style";
    style.innerHTML = `
      #omnidimension-web-widget-container,
      .omnidim-launcher,
      [id*="omnidim"][class*="launcher"],
      [id*="omnidim"][class*="button"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.getElementById("omnidim-custom-style")?.remove();
    };
  }, []);

  const handleClick = () => {
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.OmniDim === "object" && win.OmniDim !== null) {
      const omni = win.OmniDim as Record<string, unknown>;
      if (typeof omni.open === "function") {
        (omni.open as () => void)();
        return;
      }
    }
    const iframe = document.querySelector(
      "iframe[src*='omnidim.io']",
    ) as HTMLIFrameElement | null;
    if (iframe) {
      iframe.style.display = iframe.style.display === "none" ? "block" : "none";
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Chat with AI Agent"
      title="Chat with AI Agent"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        transition: "transform 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <img
        src="/assets/generated/omnidim-robot-icon-transparent.dim_100x100.png"
        alt="AI Agent"
        style={{ width: "64px", height: "64px", borderRadius: "50%" }}
      />
    </button>
  );
}
