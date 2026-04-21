export type ProviderErrorKind =
  | 'not_configured'
  | 'timeout'
  | 'rate_limit'
  | 'upstream_error'
  | 'invalid_input';

export class ProviderError extends Error {
  constructor(
    public readonly kind: ProviderErrorKind,
    public readonly provider: string,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export function isProviderError(err: unknown): err is ProviderError {
  return err instanceof ProviderError;
}
