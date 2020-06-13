export interface Vector {
  readonly x: number;
  readonly y: number;
}

export function average(vectorArr: readonly Vector[]): Vector {
  return {
    x: vectorArr.map(o => o.x).reduce((a, b) => a + b, 0) / vectorArr.length,
    y: vectorArr.map(o => o.y).reduce((a, b) => a + b, 0) / vectorArr.length
  }
}

export function length(vector: Vector): number {
  return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
}
