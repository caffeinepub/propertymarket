import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function OmniDimWidget() {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!document.getElementById("omnidimension-web-widget")) {
      const script = document.createElement("script");
      script.id = "omnidimension-web-widget";
      script.async = true;
      script.src =
        "https://omnidim.io/web_widget.js?secret_key=3adb03d87cdfb824ec9ee3e5befb0e2a";
      document.body.appendChild(script);
    }

    // Hide default launcher
    const style = document.createElement("style");
    style.id = "omnidim-hide-launcher";
    style.innerHTML = `
      #omnidimension-web-widget-container > *:not(iframe) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      [class*="omnidim-launcher"],
      [class*="omnidim-fab"],
      [class*="omnidim-bubble"],
      [class*="omnidim-widget-button"],
      [id*="omnidim-launcher"],
      [id*="omnidim-button"] {
        display: none !important;
      }
    `;
    if (!document.getElementById("omnidim-hide-launcher")) {
      document.head.appendChild(style);
    }

    const hideDefault = () => {
      const selectors = [
        "[class*='omnidim-launcher']",
        "[class*='omnidim-fab']",
        "[id*='omnidim-button']",
        "[id*='omnidim-launcher']",
      ];
      for (const sel of selectors) {
        try {
          for (const el of Array.from(document.querySelectorAll(sel))) {
            if (
              el.tagName.toLowerCase() !== "iframe" &&
              el.tagName.toLowerCase() !== "script"
            ) {
              (el as HTMLElement).style.setProperty(
                "display",
                "none",
                "important",
              );
            }
          }
        } catch {}
      }
    };

    const interval = setInterval(hideDefault, 500);
    const observer = new MutationObserver(hideDefault);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.getElementById("omnidim-hide-launcher")?.remove();
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const handleToggle = () => {
    const newState = !chatOpen;
    setChatOpen(newState);
    const win = window as unknown as Record<string, unknown>;
    if (typeof win.OmniDim === "object" && win.OmniDim !== null) {
      const omni = win.OmniDim as Record<string, unknown>;
      if (newState && typeof omni.open === "function") {
        (omni.open as () => void)();
        return;
      }
      if (!newState && typeof omni.close === "function") {
        (omni.close as () => void)();
        return;
      }
    }
    const iframe = document.querySelector(
      "iframe[src*='omnidim.io']",
    ) as HTMLIFrameElement | null;
    if (iframe) {
      iframe.style.setProperty(
        "display",
        newState ? "block" : "none",
        "important",
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="OmniDimension Agent"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "16px",
        zIndex: 9999,
        borderRadius: "24px",
        background: "#25d366",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        transition: "transform 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      {chatOpen ? (
        <X size={16} color="white" />
      ) : (
        <MessageCircle size={18} color="white" fill="white" />
      )}
      <span
        style={{
          color: "white",
          fontWeight: 600,
          fontSize: "13px",
          letterSpacing: "0.3px",
          whiteSpace: "nowrap",
        }}
      >
        {chatOpen ? "Band Karo" : "OmniDimension Agent"}
      </span>
    </button>
  );
}
