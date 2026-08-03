import { RouterProvider } from "react-router-dom";
import { Router } from "./Router";
import { ThemeProvider } from "./components/theme/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
       <RouterProvider router={Router}/>
    </ThemeProvider>
  )
}
