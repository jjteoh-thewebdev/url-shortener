import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/default-esm', // use ESM preset
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
    },
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    }
};

export default config; 