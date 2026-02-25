type OptimisticConcurrencyOptions = {
	maxRetries?: number;
	retryableErrorCodes?: readonly string[];
};

const DEFAULT_RETRYABLE_ERROR_CODES = ['P2002', 'P2034'] as const;

const getErrorCode = (error: unknown): string | undefined =>
	typeof error === 'object' && error !== null && 'code' in error
		? (error as { code?: string }).code
		: undefined;

/**
 * Executes an async operation with retries for optimistic concurrency failures.
 *
 * Retries only when Prisma returns one of the configured retryable error codes
 * (defaults to `P2002` unique constraint conflicts and `P2034` transaction conflicts).
 *
 * @param operation - Async operation to execute.
 * @param options - Retry configuration.
 * @returns The operation result.
 */
export const withOptimisticConcurrencyRetry = async <T>(
	operation: () => Promise<T>,
	options: OptimisticConcurrencyOptions = {}
): Promise<T> => {
	const maxRetries = options.maxRetries ?? 5;
	const retryableErrorCodes = options.retryableErrorCodes ?? DEFAULT_RETRYABLE_ERROR_CODES;

	for (let attempt = 0; attempt < maxRetries; attempt += 1) {
		try {
			return await operation();
		} catch (error) {
			const code = getErrorCode(error);

			if (!code || !retryableErrorCodes.includes(code) || attempt === maxRetries - 1) {
				throw error;
			}
		}
	}

	throw new Error('Failed to complete operation after optimistic concurrency retries');
};
