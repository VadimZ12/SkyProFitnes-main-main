import React from 'react'
import Button from './Button'

interface FooterProps {
	showScrollToTop?: boolean
}

function Footer({ showScrollToTop = true }: FooterProps) {
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	if (!showScrollToTop) {
		return null
	}

	return (
		<React.Fragment>
			<footer className='flex justify-center mobile:justify-end items-center mt-[34px] mb-[30px]'>
				<Button
					className='w-[127px] h-[52px] rounded-btnRad bg-green'
					variant='primary'
					onClick={scrollToTop}
				>
					Наверх ↑
				</Button>
			</footer>
		</React.Fragment>
	)
}

export default Footer
