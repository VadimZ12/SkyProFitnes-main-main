import React from 'react'  // Импорт используется
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from './ProfilePage'
import { useAuth } from '../../hooks/useAuth'
import { useCourses } from '../../hooks/useCourses'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

jest.mock('../../hooks/useAuth', () => ({
	useAuth: jest.fn(),
}))

jest.mock('../../hooks/useCourses', () => ({
	useCourses: jest.fn(),
}))

jest.mock('../../components/Cards/MyCourseCard', () =>
	jest.fn(({ course, onCourseRemoved }) => (
		<div data-testid={`course-${course._id}`}>
			<p>{course.title}</p>
			<button onClick={onCourseRemoved}>Remove Course</button>
		</div>
	))
)

jest.mock('../../components/Footer', () =>
	jest.fn(() => <footer>Footer</footer>)
)

describe('ProfilePage component', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('renders the profile page and loads user courses', async () => {
		const mockUser = { uid: '123', displayName: 'John Doe' }
		const mockCourses = [
			{ _id: 'course1', title: 'Course 1', order: 1 },
			{ _id: 'course2', title: 'Course 2', order: 2 },
		]

		;(useAuth as jest.Mock).mockReturnValue({
			user: mockUser,
			loading: false,
		})
		;(useCourses as jest.Mock).mockReturnValue({
			getUserCourses: jest.fn().mockResolvedValue(mockCourses),
		})

		render(
			<MemoryRouter>
				<React.Fragment>
					<ProfilePage />
				</React.Fragment>
			</MemoryRouter>
		)

		expect(screen.getByText('Профиль')).toBeInTheDocument()
		expect(screen.getByText('Мои курсы')).toBeInTheDocument()

		await waitFor(() => {
			expect(screen.getByText('Course 1')).toBeInTheDocument()
			expect(screen.getByText('Course 2')).toBeInTheDocument()
		})
	})

	it('fetches courses again when a course is removed', async () => {
		const mockUser = { uid: '123', displayName: 'John Doe' }
		const mockCourses = [
			{ _id: 'course1', title: 'Course 1', order: 1 },
			{ _id: 'course2', title: 'Course 2', order: 2 },
		]

		const getUserCoursesMock = jest.fn().mockResolvedValue(mockCourses)

		;(useAuth as jest.Mock).mockReturnValue({
			user: mockUser,
			loading: false,
		})
		;(useCourses as jest.Mock).mockReturnValue({
			getUserCourses: getUserCoursesMock,
		})

		render(
			<MemoryRouter>
				<React.Fragment>
					<ProfilePage />
				</React.Fragment>
			</MemoryRouter>
		)

		await waitFor(() => {
			expect(screen.getByText('Course 1')).toBeInTheDocument()
			expect(screen.getByText('Course 2')).toBeInTheDocument()
		})

		const removeButtons = screen.getAllByText('Remove Course')

		fireEvent.click(removeButtons[0])

		await waitFor(() => {
			expect(getUserCoursesMock).toHaveBeenCalledTimes(2)
		})
	})
})
