export const createMockStringTs = (): {deepCamelKeys: <T>(obj: T) => T; deepSnakeKeys: <T>(obj: T) => T} => ({
    deepCamelKeys: <T>(obj: T): T => obj,
    deepSnakeKeys: <T>(obj: T): T => obj,
});
