declare const logKindMarker: unique symbol;
type LogKind = string & { [logKindMarker]: never };
export const L000 = "L000" as LogKind;
export const L001 = "L001" as LogKind;
export const L002 = "L002" as LogKind;
export const L003 = "L003" as LogKind;
export const L004 = "L004" as LogKind;
export const L005 = "L005" as LogKind;
export const L006 = "L006" as LogKind;
export const L007 = "L007" as LogKind;
export const L008 = "L008" as LogKind;
export const L009 = "L009" as LogKind;
export const L010 = "L010" as LogKind;

export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR";

export function log(
  kind: LogKind,
  level: LogLevel,
  message: string,
  details?: unknown
): void {
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      severity: level,
      message,
      "logging.googleapis.com/labels": { kind },
      details,
    })
  );
}
