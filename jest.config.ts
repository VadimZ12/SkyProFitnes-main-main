import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|svg|png)$': '<rootDir>/__mocks__/fileMock.ts',
	},
	transform: {
		'^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
	},
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json',
		},
	},
	transformIgnorePatterns: ['node_modules/(?!(firebase|vite)/)'],
}

export default config
