import { request } from '../../shared/api/client'
import type { ProductionHouse, ProductionHouseFormInput, ProductionHouseUpdateInput } from './types'

export async function getProductionHouses() {
//   return request<ProductionHouse[]>('/production-house')
const res = await request<{result: ProductionHouse[]}>('/production-house')
return res.result
}

export function createProductionHouse(payload: ProductionHouseFormInput) {
  return request<ProductionHouse>('/production-house', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProductionHouse(id: number, payload: ProductionHouseUpdateInput) {
  return request<ProductionHouse>(`/production-house/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteProductionHouse(id: number) {
  return request<void>(`/production-house/${id}`, {
    method: 'DELETE',
  })
}
