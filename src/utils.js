export function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]: ${msg}`);
}
