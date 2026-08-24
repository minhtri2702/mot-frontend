"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js?v=5", {
        scope: "/",
        updateViaCache: "none",
      }).then((registration) => registration.update()).catch(() => {
        // PWA support is optional; a registration failure must not affect the app.
      });
    }
  }, []);
  return null;
}
