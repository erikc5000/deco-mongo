/** Constructor function that takes no arguments */
export type ClassType<T> = new () => T

/** Type representing the string keys of an object */
export type KeyOf<T extends object> = Extract<keyof T, string>
