import { createRoot } from "react-dom/client";
import AssessmentApp from "./App";
import ReplitApp from "./replit-app/App";
import { installLocalApi } from "./replit-app/lib/local-api";
import "./replit-app/index.css";
import "./styles.css";
import "./dashboard.css";

installLocalApi();

const isTaller = window.location.pathname.startsWith("/taller");

createRoot(document.getElementById("root")).render(
  isTaller ? <AssessmentApp /> : <ReplitApp />,
);
