module.exports = {
    transform: {'^.+\\.ts?$': 'ts-jest'},
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/typings/**/*', 
        '!src/services/*',
        '!src/configs.ts',
        '!src/keys.ts',
        '!src/process-env.ts',
        '!src/dependencies.ts'
    ]
};