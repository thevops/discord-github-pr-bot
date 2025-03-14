export function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`ts=${timestamp} ${msg}`);
}
