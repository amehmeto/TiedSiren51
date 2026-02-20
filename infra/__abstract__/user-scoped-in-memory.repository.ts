import uuid from 'react-native-uuid'
import { CreatePayload } from '@/core/_ports_/create.payload'
import { UpdatePayload } from '@/core/_ports_/update.payload'

// Test double that accepts userId for port compliance but stores entities in a flat Map.
// Isolation is achieved through instance lifecycle (each test creates a fresh instance),
// not through userId filtering.
export class UserScopedInMemoryRepository<T extends { id: string }> {
  entities: Map<string, T> = new Map()

  async findById(_userId: string, id: string): Promise<T> {
    const entity = this.entities.get(id)
    if (!entity) {
      throw new Error(
        `Entity not found in UserScopedInMemoryRepository for ${id}`,
      )
    }
    return entity
  }

  async findAll(_userId: string): Promise<T[]> {
    return Array.from(this.entities.values())
  }

  async create(_userId: string, payload: CreatePayload<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const toBeCreatedEntity: T = { id: uuid.v4().toString(), ...payload } as T
    this.entities.set(toBeCreatedEntity.id, toBeCreatedEntity)
    const createdEntity = this.entities.get(toBeCreatedEntity.id)
    if (!createdEntity) {
      throw new Error(
        `Entity not created inside UserScopedInMemory ${toBeCreatedEntity.id}`,
      )
    }
    return Promise.resolve(createdEntity)
  }

  async delete(_userId: string, id: string): Promise<void> {
    this.entities.delete(id)
    return Promise.resolve()
  }

  async deleteAll(_userId: string): Promise<void> {
    this.entities.clear()
    return Promise.resolve()
  }

  update(_userId: string, updatePayload: UpdatePayload<T>): Promise<void> {
    const entity = this.entities.get(updatePayload.id)
    if (!entity) {
      throw new Error(
        'Entity not found and not updated inside UserScopedInMemory',
      )
    }
    this.entities.set(updatePayload.id, { ...entity, ...updatePayload })
    return Promise.resolve()
  }
}
