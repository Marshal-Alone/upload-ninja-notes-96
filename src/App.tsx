import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/auth-context";
// @ts-ignore
import RequestNotes from "./pages/RequestNotes";
import AdminPanel from "./pages/AdminPanel";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<Routes>
						<Route
							path="/"
							element={<Index />}
						/>
						<Route
							path="/upload"
							element={<Upload />}
						/>
						<Route
							path="/request-notes"
							element={<RequestNotes />}
						/>
						<Route
							path="/admin/:password"
							element={<AdminPanel />}
						/>
						<Route
							path="/admin-panel"
							element={<AdminPanel />}
						/>
						<Route
							path="/test"
							element={<TestPage />}
						/>
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route
							path="*"
							element={<NotFound />}
						/>
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</AuthProvider>
	</QueryClientProvider>
);

export default App;
