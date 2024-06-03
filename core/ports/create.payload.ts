export type CreatePayload<T extends { id: string }> = Omit<T, 'id'>
