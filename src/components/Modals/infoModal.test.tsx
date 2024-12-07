import React from 'react'
import { render } from '@testing-library/react'
import InfoModal from './infoModal'

describe('InfoModal Snapshot', () => {
	it('renders progress modal correctly', () => {
		const { asFragment } = render(
			<React.Fragment>
			<InfoModal
				isOpen={true}
				onClose={() => {}}
				message='Operation in progress'
				type='progress'
			/>
			</React.Fragment>
		)
		expect(asFragment()).toMatchSnapshot()
	})

	it('renders reset password modal correctly', () => {
		const { asFragment } = render(
			<React.Fragment>
			<InfoModal
				isOpen={true}
				onClose={() => {}}
				message='Check your email'
				type='resetPassword'
				email='test@example.com'
			/>
			</React.Fragment>
		)
		expect(asFragment()).toMatchSnapshot()
	})

	it('renders nothing when modal is closed', () => {
		const { asFragment } = render(
			<React.Fragment>
			<InfoModal
				isOpen={false}
				onClose={() => {}}
				message='Operation in progress'
				type='progress'
			/>
			</React.Fragment>
		)
		expect(asFragment()).toMatchSnapshot()
	})
})
