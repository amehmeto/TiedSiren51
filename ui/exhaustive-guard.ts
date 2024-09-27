export const exhaustiveGuard = (x: never): never => {
  throw new Error(`exhaustiveGuard: unreachable code ${x}`)
}
