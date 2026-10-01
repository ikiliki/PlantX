export type { Todo, TodoCategory, TodoSubcategory } from '../../../../src/mock/types.ts'

export type TodoInput = Omit<import('../../../../src/mock/types.ts').Todo, 'id' | 'createdAt'> & {
  id?: string
  createdAt?: string
}
