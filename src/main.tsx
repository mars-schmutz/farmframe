import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </Router>
  </React.StrictMode>
);
