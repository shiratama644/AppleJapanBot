const logger = {
  info:  (msg)       => console.log(`[INFO] ${msg}`),
  warn:  (msg)       => console.warn(`[WARN] ${msg}`),
  error: (msg, err)  => console.error(`[ERROR] ${msg}`, err ?? ''),
};

module.exports = logger;
