export class FrameworkError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'FrameworkError';
  }
}
