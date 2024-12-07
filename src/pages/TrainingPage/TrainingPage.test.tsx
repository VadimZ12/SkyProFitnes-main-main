import React from 'react'
import { render, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCourses } from '../../hooks/useCourses'
import TrainingPage from './TrainingPage'
import { ref, get, set } from 'firebase/database'
import '@testing-library/jest-dom'
import { database } from '../../config/firebase'

jest.mock('../../hooks/useAuth')
jest.mock('../../hooks/useCourses')
jest.mock('firebase/database', () => ({
	ref: jest.fn(),
	get: jest.fn(),
	set: jest.fn(),
}))

jest.mock('../../config/firebase', () => ({
	auth: jest.fn(),
	database: jest.fn(),
}))

describe('TrainingPage', () => {
	const mockGetWorkout = jest.fn()
	const mockSet = jest.fn()
	const mockGet = jest.fn()
	const mockUser = { uid: '123' }

	beforeEach(() => {
		;(useAuth as jest.Mock).mockReturnValue({
			user: mockUser,
			loading: false,
			authLoading: false,
		})
		;(useCourses as jest.Mock).mockReturnValue({
			getWorkout: mockGetWorkout,
		})
		;(ref as jest.Mock).mockReturnValue({})
		;(set as jest.Mock).mockImplementation(mockSet)
		;(get as jest.Mock).mockImplementation(mockGet)
	})

	it('should fetch workout on component mount', async () => {
		mockGetWorkout.mockResolvedValueOnce({
			name: 'Test Workout',
			exercises: [{ name: 'Exercise 1', quantity: 10 }],
		})

		mockGet.mockResolvedValueOnce({ exists: () => false })

		await act(async () => {
			render(
				<React.Fragment>
					<MemoryRouter initialEntries={['/training/some-id']}>
						<Routes>
							<Route path='/training/:id' element={<TrainingPage />} />
						</Routes>
					</MemoryRouter>
				</React.Fragment>
			)
		})

		expect(mockGetWorkout).toHaveBeenCalledWith('some-id')
	})

    it('should auto-save progress when video starts', async () => {
		const mockWorkout = {
			name: 'Test Workout',
			exercises: [{ name: 'Exercise 1', quantity: 10 }],
		}

		mockGetWorkout.mockResolvedValueOnce(mockWorkout)
		mockGet.mockResolvedValueOnce({ exists: () => false })

		await act(async () => {
			render(
				<MemoryRouter initialEntries={['/training/some-id']}>
					<Routes>
						<Route path='/training/:id' element={<TrainingPage />} />
					</Routes>
				</MemoryRouter>
			)
		})

		await act(async () => {
			const event = new MessageEvent('message', { data: 'videoStarted' })
			window.dispatchEvent(event)
		})

		expect(mockSet).toHaveBeenCalledWith(
			ref(database, 'userProgress/123/some-id'),
			{ 'Exercise 1': 0 }
		)
	})
})