export function isFbError(e: any): e is { message: string, code: string } {
  return typeof e === 'object' && typeof e.message === 'string' && typeof e.code === 'string';
}

export function isGrpcError(e: any): boolean {
  return typeof e === 'object' && typeof e.code === 'number' && e.code < 17 && typeof e.details === 'string'
}