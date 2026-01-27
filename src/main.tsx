import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Silence debug console noise in production builds (keep errors visible)
if (import.meta.env.PROD) {
	["log", "info", "warn", "debug"].forEach((method) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(console as any)[method] = () => {};
	});
}

createRoot(document.getElementById("root")!).render(<App />);
