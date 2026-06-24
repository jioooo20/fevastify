export type ProductionHouse = {
  id: number
  name: string
  code: string
}

export type ProductionHouseFormInput = {
  name: string
  code: string
}

export type ProductionHouseUpdateInput = Partial<ProductionHouseFormInput>
