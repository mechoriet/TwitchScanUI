export interface Result<T> {
  data: T;
  error: Error | null;
}

export interface Error {
  errorMessage: string;
  statusCode: number;
}