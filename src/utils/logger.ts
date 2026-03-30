const logger = {
  info:  (msg: string): void               => { console.log(`[INFO] ${msg}`); },
  warn:  (msg: string): void               => { console.warn(`[WARN] ${msg}`); },
  error: (msg: string, err?: unknown): void => { console.error(`[ERROR] ${msg}`, err ?? ''); },
};

export default logger;
