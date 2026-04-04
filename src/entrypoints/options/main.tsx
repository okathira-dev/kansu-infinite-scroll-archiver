import React from "react";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind.css";
import App from "./App";

// biome-ignore lint/style/noNonNullAssertion: root 要素は index.html で必ず提供する
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
