const logger = {
  info:  (msg: string): void                => { console.log(`[INFO] ${msg}`); },
  warn:  (msg: string, err?: unknown): void => { console.warn(`[WARN] ${msg}`, ...(err !== undefined ? [err] : [])); },
  error: (msg: string, err?: unknown): void => { console.error(`[ERROR] ${msg}`, ...(err !== undefined ? [err] : [])); },
};

export default logger;
