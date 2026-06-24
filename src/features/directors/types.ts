export type Director = {
  id: number
  name: string
  code: string
}

export type DirectorFormInput = {
  name: string
  code: string
}

export type DirectorUpdateInput = Partial<DirectorFormInput>
