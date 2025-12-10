import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "react-tooltip/dist/react-tooltip.css";
import { UserProvider } from "./context/UserContext";
import { DataCacheProvider } from "./context/DataCacheContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataCacheProvider>
        <UserProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </UserProvider>
      </DataCacheProvider>
    </BrowserRouter>
  </React.StrictMode>
);
