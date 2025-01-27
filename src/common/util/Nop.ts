export const notImpl = (): Promise<never> => {
  throw new Error('Not implemented')
}
