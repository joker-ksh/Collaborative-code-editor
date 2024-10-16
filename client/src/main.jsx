import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./AuthContext.jsx";
import { WebSocketProvider } from "./WebSocketContext.jsx";

const theme = createTheme({
  palette: {
    mode: "dark", // Set to 'light' or 'dark'
    // primary: {
    //   main: "#28264e",

    // },
    // secondary: {
    //   main: "#dc004e", // Your secondary color
    // },
    background: {
      default: "#0e0b33", // Background color

      paper: "#0e0b33", // Paper (card) background color
    },
    text: {
      primary: "#ffffff", // Text color
      secondary: "#ffffff", // Secondary text color
    },
  },
});

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <WebSocketProvider>
    <AuthProvider>
      {/* <StrictMode> */}
        <App />
      {/* </StrictMode> */}
    </AuthProvider>
    </WebSocketProvider>
  </ThemeProvider>
);
