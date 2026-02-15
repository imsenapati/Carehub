export async function simulateLatency() {
  const delay = 200 + Math.random() * 300;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

export function simulateError(): boolean {
  return Math.random() < 0.05;
}

export function createErrorResponse(message: string, status: number = 500) {
  return Response.json({ error: message }, { status });
}
