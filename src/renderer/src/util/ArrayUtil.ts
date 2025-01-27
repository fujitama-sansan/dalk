function toggle<T>(arr: readonly T[], t: T): readonly T[]
function toggle<T>(arr: T[], t: T): T[]
function toggle<T>(arr: T[] | readonly T[], t: T): readonly T[] | T[] {
  return arr.includes(t) ? arr.filter((e) => e !== t) : [...arr, t]
}

export const ArrayUtil = {
  toggle
} as const
