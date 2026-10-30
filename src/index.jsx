import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import { initAuth } from "./services/auth";
import { initCloudSync } from "./services/cloudSync";
import { handleOpenRouterReturn } from "./services/aiKeys";

handleOpenRouterReturn(); // first: it clears OpenRouter's ?code= before sign-in looks for one
initCloudSync();
initAuth();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
