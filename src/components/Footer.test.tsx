import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Footer from './Footer'
import '@testing-library/jest-dom'

describe('Footer component', () => {
	it('renders button when showScrollToTop is true', () => {
		const { getByText } = render(<Footer showScrollToTop={true} />)

		expect(getByText('Наверх ↑')).toBeInTheDocument()
	})

	it('does not render button when showScrollToTop is false', () => {
		const { queryByText } = render(<Footer showScrollToTop={false} />)

		expect(queryByText('Наверх ↑')).toBeNull()
	})

	it('scrolls to top when button is clicked', () => {
		window.scrollTo = jest.fn()

		const { getByText } = render(<React.Fragment><Footer showScrollToTop={true} /></React.Fragment>)

		fireEvent.click(getByText('Наверх ↑'))

		expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
	})
})
