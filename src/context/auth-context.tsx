import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Mock user data for demo purposes
const MOCK_USER = {
	id: "user123",
	name: "Demo User",
	email: "user@example.com",
};

interface User {
	id: string;
	name: string;
	email: string;
}

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	login: () => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate fetching user data
		setTimeout(() => {
			// In a real app, you would check local storage or cookies for a token
			// and make an API call to get the user data
			setUser(MOCK_USER);
			setLoading(false);
		}, 500);
	}, []);

	const login = () => {
		setUser(MOCK_USER);
	};

	const logout = () => {
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				loading,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
