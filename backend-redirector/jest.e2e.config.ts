import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
    },
    testMatch: ['<rootDir>/src/__e2e__/**/*.e2e.ts'],
    setupFilesAfterEnv: ['<rootDir>/src/__e2e__/e2e.setup.ts'],
    // coverageDirectory: 'coverage-e2e',
    // collectCoverageFrom: [
    //     'src/**/*.ts',
    //     '!src/**/*.d.ts',
    //     '!src/test/**/*.ts',
    //     '!src/__tests__/**/*.ts'
    // ],
    transformIgnorePatterns: [
        'node_modules/(?!@mikro-orm/core|@mikro-orm/postgresql|@mikro-orm/reflection)',
    ],
    testEnvironmentOptions: {
        url: 'http://localhost:3002',
        experimentalVmModules: true,
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testTimeout: 30000 // 30 seconds timeout for e2e tests

};

export default config; 