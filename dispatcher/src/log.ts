export function log(severity: "INFO" | "ERROR", message: string): void {
  console.log(
    JSON.stringify({ time: new Date().toISOString(), severity, message })
  );
}
