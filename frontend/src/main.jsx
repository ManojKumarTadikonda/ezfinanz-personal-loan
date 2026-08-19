import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter
} from "react-router-dom";

import App from "./App";
import "./styles.css";

async function registerFirebaseServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      console.log(
        "Firebase messaging service worker registered"
      );
    } catch (error) {
      console.error(
        "Service worker registration failed:",
        error
      );
    }
  }
}

registerFirebaseServiceWorker();

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);