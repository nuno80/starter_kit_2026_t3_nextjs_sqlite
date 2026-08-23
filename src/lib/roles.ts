/**
 * Roles are stored as a comma-separated string (e.g. "editor,admin").
 * Single parsing rule for the whole app.
 */
export function hasRole(role: string | null | undefined, name: string) {
  return role?.split(",").map((r) => r.trim()).includes(name) ?? false;
}
