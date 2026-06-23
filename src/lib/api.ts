// Thin client for the /api routes. Keeps fetch boilerplate out of components.

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => fetch(path, { cache: "no-store" }).then((r) => handle<T>(r)),
  post: <T>(path: string, body?: unknown) =>
    fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handle<T>(r)),
  patch: <T>(path: string, body?: unknown) =>
    fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handle<T>(r)),
};
