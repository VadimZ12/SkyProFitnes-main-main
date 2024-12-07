import React from 'react'
import { render } from '@testing-library/react'
import Header from './Header'
import { useAuth } from './../hooks/useAuth'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

jest.mock('./../hooks/useAuth')
jest.mock('../config/firebase', () => ({
	auth: { signInWithEmailAndPassword: jest.fn(), signOut: jest.fn() },
	database: { ref: jest.fn(), get: jest.fn(), set: jest.fn() },
}))

describe('Header component', () => {
	const mockOnLoginClick = jest.fn()

	beforeAll(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		;(global as any).importMeta = {
			env: {
				VITE_FIREBASE_API_KEY: 'mock-api-key',
				VITE_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
				VITE_FIREBASE_DATABASE_URL: 'mock-database-url',
				VITE_FIREBASE_PROJECT_ID: 'mock-project-id',
				VITE_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
				VITE_FIREBASE_MESSAGING_SENDER_ID: 'mock-messaging-sender-id',
				VITE_FIREBASE_APP_ID: 'mock-app-id',
			},
		}
	})

	it('renders correctly when the user is not logged in', () => {
		;(useAuth as jest.Mock).mockReturnValue({ user: null })

		const { asFragment, getByText } = render(
			<MemoryRouter>
				<React.Fragment>
					<Header onLoginClick={mockOnLoginClick} />
				</React.Fragment>
			</MemoryRouter>
		)

		expect(getByText('Войти')).toBeInTheDocument()
		expect(asFragment()).toMatchSnapshot()
	})

	it('renders correctly when the user is logged in', () => {
		;(useAuth as jest.Mock).mockReturnValue({
			user: {
				displayName: 'John Doe',
				email: 'johndoe@example.com',
				photoURL: '/images/profile.png',
			},
		})

		const { asFragment, getByText, getByAltText } = render(
			<MemoryRouter>
				<React.Fragment>
					<Header onLoginClick={mockOnLoginClick} />
				</React.Fragment>
			</MemoryRouter>
		)

		expect(getByText('John Doe')).toBeInTheDocument()
		expect(getByAltText('user avatar')).toBeInTheDocument()
		expect(asFragment()).toMatchSnapshot()
	})
})
