export type UpdatePayload<T extends { id: string }> = Partial<T> &
  Required<Pick<T, 'id'>>
