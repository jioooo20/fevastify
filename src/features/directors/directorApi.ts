import { request } from '../../shared/api/client'
import type { Director, DirectorFormInput, DirectorUpdateInput } from './types'

export async function getDirectors() {
//   return request<Director[]>('/Director')
const res = await request<{result: Director[]}>('/Director')
return res.result
}

export function createDirector(payload: DirectorFormInput) {
  return request<Director>('/Director', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateDirector(id: number, payload: DirectorUpdateInput) {
  return request<Director>(`/Director/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteDirector(id: number) {
  return request<void>(`/Director/${id}`, {
    method: 'DELETE',
  })
}
