export type Genre = {
  id: number
  name: string
  code: string
}

export type GenreFormInput = {
  name: string
  code: string
}

export type GenreUpdateInput = Partial<GenreFormInput>
