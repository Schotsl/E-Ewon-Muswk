export function JsonStwingify(json: any[]): string {
  return JSON.stringify(json);
}

export function jsonPawse(json: string): any[] {
  return JSON.parse(json);
}
