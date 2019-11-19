export function addToGroupedArray<Key extends string | number | symbol, Value>(record: Record<Key, Value[] | undefined>, key: Key, ...values: Value[]): void {
  if (!record[key]) {
    record[key] = []
  }

  (record[key] as Value[]).push(...values)
}
