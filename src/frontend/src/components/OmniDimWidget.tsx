import { useEffect } from "react";

export default function OmniDimWidget() {
  useEffect(() => {
    // Load the script
    if (!document.getElementById("omnidimension-web-widget")) {
      const script = document.createElement("script");
      script.id = "omnidimension-web-widget";
      script.async = true;
      script.src =
        "https://omnidim.io/web_widget.js?secret_key=3adb03d87cdfb824ec9ee3e5befb0e2a";
      document.body.appendChild(script);
    }

    // Hide the default launcher button completely
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
    document.head.appendChild(style);

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

  // No visible button -- it's now in the Navbar 3-dot menu
  return null;
}
