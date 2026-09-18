import { createRoot } from "react-dom/client";
import { installLocalApi } from "./replit-app/lib/local-api";
import "./replit-app/index.css";

installLocalApi();

const root = createRoot(document.getElementById("root"));
const isTaller = window.location.pathname.startsWith("/taller");

if (isTaller) {
  const { default: AssessmentApp } = await import("./App.jsx");
  root.render(<AssessmentApp />);
} else {
  const { default: ReplitApp } = await import("./replit-app/App");
  root.render(<ReplitApp />);
}
