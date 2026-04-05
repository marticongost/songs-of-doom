import { mock as vitestMock, type MockProxy } from 'vitest-mock-extended';

/**
 * Mocks an object, allowing both direct property assignment and mock function
 * implementation.
 *
 * @param members - An object containing properties and/or methods to be mocked. Methods
 * will be set up as mock functions with the provided implementation, while non-function
 * properties will be directly assigned.
 * @returns The mocked object.
 */
export function mock<T>(members: Partial<T> = {}): MockProxy<T> {
	const m = vitestMock<T>();
	for (const [key, value] of Object.entries(members)) {
		if (value instanceof Function) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(m as any)[key].mockImplementation(value);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(m as any)[key] = value;
		}
	}
	return m;
}
