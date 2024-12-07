import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import Profile from './Profile'
import { useAuth } from '../../hooks/useAuth'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

jest.mock('../../hooks/useAuth', () => ({
	useAuth: jest.fn(),
}))

jest.mock('../../components/Modals/Modal', () =>
	jest.fn(() => <div role='dialog' />)
)
jest.mock('../../config/firebase', () => ({
	auth: { signInWithEmailAndPassword: jest.fn(), signOut: jest.fn() },
	database: { ref: jest.fn(), get: jest.fn(), set: jest.fn() },
}))

describe('Profile component', () => {
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

	it('renders correctly when the user is logged in', () => {
		;(useAuth as jest.Mock).mockReturnValue({
			user: {
				displayName: 'John Doe',
				email: 'johndoe@example.com',
				photoURL: '/images/profile.png',
			},
			logout: jest.fn(),
			updateUser: jest.fn(),
		})

		const { asFragment, getByText } = render(
			<MemoryRouter>
				<React.Fragment>
					<Profile />
				</React.Fragment>
			</MemoryRouter>
		)

		expect(getByText('John Doe')).toBeInTheDocument()
		expect(asFragment()).toMatchSnapshot()
	})

	it('opens edit mode when edit button is clicked', () => {
		;(useAuth as jest.Mock).mockReturnValue({
			user: {
				displayName: 'John Doe',
				email: 'johndoe@example.com',
				photoURL: '/images/profile.png',
			},
			logout: jest.fn(),
			updateUser: jest.fn(),
		})

		const { getByText, getByDisplayValue } = render(
			<MemoryRouter>
				<React.Fragment>
					<Profile />
				</React.Fragment>
			</MemoryRouter>
		)

		fireEvent.click(getByText('✎'))

		expect(getByDisplayValue('John Doe')).toBeInTheDocument()
		expect(getByText('Сохранить')).toBeInTheDocument()
	})

	it('opens the modal when the change password button is clicked', () => {
		;(useAuth as jest.Mock).mockReturnValue({
			user: {
				displayName: 'John Doe',
				email: 'johndoe@example.com',
				photoURL: '/images/profile.png',
			},
			logout: jest.fn(),
			updateUser: jest.fn(),
		})

		const { getByText, getByRole } = render(
			<MemoryRouter>
				<React.Fragment>
					<Profile />
				</React.Fragment>
			</MemoryRouter>
		)

		fireEvent.click(getByText('Изменить пароль'))

		expect(getByRole('dialog')).toBeInTheDocument()
	})

	it('logs out the user when the logout button is clicked', async () => {
		const logoutMock = jest.fn()

		;(useAuth as jest.Mock).mockReturnValue({
			user: {
				displayName: 'John Doe',
				email: 'johndoe@example.com',
			},
			logout: logoutMock,
			updateUser: jest.fn(),
		})

		const { getByText } = render(
			<MemoryRouter>
				<React.Fragment>
					<Profile />
				</React.Fragment>
			</MemoryRouter>
		)

		fireEvent.click(getByText('Выйти'))

		await waitFor(() => {
			expect(logoutMock).toHaveBeenCalled()
		})
	})
})
