import { useEffect } from "react";

export function NetworkGoldWidget() {
  useEffect(() => {
    // Create and append the script tag
    const script = document.createElement("script");
    script.src = "https://platform.efficia.io/agent-widget/widget.js";
    script.setAttribute("data-auto-init", "true");
    script.setAttribute(
      "data-deployment-id",
      "e04ccb09-2e10-497e-be2b-ec394a99e58d"
    );
    script.setAttribute("data-title", "netzwerkgold Assistant");
    script.setAttribute("data-base-url", "https://platform.efficia.io");
    script.setAttribute("data-use-default-container", "false");
    script.setAttribute(
      "data-custom-container-id",
      "netzwerkgold-agent-container"
    );
    script.setAttribute("data-border-enabled", "true");
    script.setAttribute(
      "data-custom-css",
      `.gradient-text {
  background-image: linear-gradient(to right, #8A2BE2, #FFA500);
}
.typing-dot-1, .typing-dot-2, .typing-dot-3 {
  background-color: #8A2BE2 !important;
}`
    );
    script.setAttribute(
      "data-theme",
      JSON.stringify({
        mode: "system",
        themes: {
          light: {
            primary: "#000000",
            background: "#ffffff",
            accent: "#000000",
            highlight: "#7a6b66",
            secondary: "#ff8652",
            foreground: "#000000",
            border: "#949494",
            card: "#dadada",
            "card-foreground": "#2e2a28",
            destructive: "#e03e3e",
          },
          // dark: {
          //   primary: "#ff6d2e",
          //   background: "#2e2a28",
          //   accent: "#ff8652",
          //   highlight: "#7a6b66",
          //   secondary: "#ff8652",
          //   foreground: "#fff9f0",
          //   border: "#534d46",
          //   card: "#413b39",
          //   "card-foreground": "#fff9f0",
          //   destructive: "#e03e3e",
          // },
        },
      })
    );
    script.async = true;

    document.body.appendChild(script);

    // Cleanup: remove script on unmount
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return <div id="netzwerkgold-agent-container" className="w-full h-screen" />;
}
