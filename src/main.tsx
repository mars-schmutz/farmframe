import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import App from "./App.tsx";
import { store } from "./Store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Provider store={store}>
        <MantineProvider theme={theme}>
          <App />
        </MantineProvider>
      </Provider>
    </Router>
  </React.StrictMode>
);
