/**
 * Minimal interface for an expo-sqlite SQLiteDatabase.
 * We rely on dependency injection so the package itself does not import expo-sqlite
 * directly (avoiding bundler issues in non-Expo environments and making unit testing easy).
 *
 * The actual `SQLiteDatabase` from expo-sqlite satisfies this interface.
 */
export interface SQLiteDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: unknown[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]>;
}
