import './App.css'
import React from "react";
import {
    Container,
} from "@mui/material";
import CryptoInterface from "./CryptoInterface";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";

function App() {

    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                },
            }),
        [prefersDarkMode],
    );

  return (
      <>
          <ThemeProvider theme={theme}>
              <CssBaseline />
              <Container maxWidth="md" sx={{ mt: 4 }}>
                  <CryptoInterface />
              </Container>
          </ThemeProvider>
      </>
  )
}


export default App
