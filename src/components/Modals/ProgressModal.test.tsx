import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import ProgressModal from './ProgressModal'
import { Exercise } from '../../types/interfaces'

const mockExercises: Exercise[] = [
	{ name: 'Push Ups', quantity: 50 },
	{ name: 'Squats', quantity: 30 },
]

const mockInitialProgress = {
	'Push Ups': 20,
	Squats: 10,
}

describe('ProgressModal Snapshot', () => {
	it('renders the modal correctly when open', () => {
		const { asFragment } = render(
			<ProgressModal
				isOpen={true}
				onClose={() => {}}
				exercises={mockExercises}
				onSave={() => {}}
				initialProgress={mockInitialProgress}
			/>
		)
		expect(asFragment()).toMatchSnapshot()
	})

	it('renders nothing when the modal is closed', () => {
		const { asFragment } = render(
			<React.Fragment>
			<ProgressModal
				isOpen={false}
				onClose={() => {}}
				exercises={mockExercises}
				onSave={() => {}}
				initialProgress={mockInitialProgress}
			/>
			</React.Fragment>
		)
		expect(asFragment()).toMatchSnapshot()
	})

	it('calls onSave and onClose when form is submitted', () => {
		const mockOnSave = jest.fn()
		const mockOnClose = jest.fn()

		const { getByText } = render(
			<React.Fragment>
			<ProgressModal
				isOpen={true}
				onClose={mockOnClose}
				exercises={mockExercises}
				onSave={mockOnSave}
				initialProgress={mockInitialProgress}
			/>
			</React.Fragment>
		)

		const saveButton = getByText('Сохранить')
		fireEvent.click(saveButton)

		expect(mockOnSave).toHaveBeenCalledWith(mockInitialProgress)
		expect(mockOnClose).toHaveBeenCalled()
	})
})
