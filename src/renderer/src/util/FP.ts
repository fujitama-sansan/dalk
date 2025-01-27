const pipe = <T>(...fns: ((arg: T) => T)[]): ((arg: T) => T) => {
  return (arg) => fns.reduce((acc, fn) => fn(acc), arg)
}

export const FP = {
  pipe
} as const
