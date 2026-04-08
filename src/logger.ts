const ts = () => new Date().toISOString();

export const log = (msg: string) => console.log(`[${ts()}] ${msg}`);
export const logError = (msg: string, err?: unknown) => {
  const detail = err instanceof Error ? err.message : err;
  console.error(`[${ts()}] ${msg}`, detail ?? '');
};
