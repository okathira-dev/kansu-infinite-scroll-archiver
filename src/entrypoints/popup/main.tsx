import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@/assets/tailwind.css"; // wxtでtailwindを使う ref: https://github.com/wxt-dev/examples/tree/main/examples/react-shadcn#installation-walkthrough

// biome-ignore lint/style/noNonNullAssertion: テンプレートのため
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
