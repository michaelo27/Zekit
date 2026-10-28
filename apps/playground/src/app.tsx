import React, { useState } from "react";
import { Layout } from "./components/layout";
import { PlaygroundRoute } from "./components/nav";
import { ToastMessage, ToastViewport } from "./components/ui";
import { HomeRoute } from "./routes/home";
import { BuilderRoute } from "./routes/builder";
import { ParserRoute } from "./routes/parser";
import { UaInspectorRoute } from "./routes/ua-inspector";
import { ReceiptsRoute } from "./routes/receipts";

export function App() {
  const [activeRoute, setActiveRoute] = useState<PlaygroundRoute>("home");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (title: string, tone: ToastMessage["tone"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  return (
    <Layout activeRoute={activeRoute} onSelectRoute={setActiveRoute}>
      {activeRoute === "home" && (
        <HomeRoute onNavigate={setActiveRoute} onToast={pushToast} />
      )}
      {activeRoute === "builder" && <BuilderRoute onToast={pushToast} />}
      {activeRoute === "parser" && <ParserRoute onToast={pushToast} />}
      {activeRoute === "ua-inspector" && (
        <UaInspectorRoute onToast={pushToast} />
      )}
      {activeRoute === "receipts" && <ReceiptsRoute onToast={pushToast} />}

      <ToastViewport
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((prev) => prev.filter((item) => item.id !== id))
        }
      />
    </Layout>
  );
}
