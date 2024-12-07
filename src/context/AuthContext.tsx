import { createContext, useState, ReactNode } from 'react'

interface AuthContextType {
	user: {
		name: string
		login: string
		password: string
		url_img: string
	} | null
	login: (userData: {
		name: string
		login: string
		password: string
		url_img: string
	}) => void
	logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<AuthContextType['user']>(null)

	const login = (userData: AuthContextType['user']) => {
		setUser(userData)
	}

	const logout = () => {
		setUser(null)
	}

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}
