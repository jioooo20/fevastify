export type Tag = {
  id: number
  name: string
  code: string
}

export type TagFormInput = {
  name: string
  code: string
}

export type TagUpdateInput = Partial<TagFormInput>
