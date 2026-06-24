import { request } from '../../shared/api/client'
import type { Genre, GenreFormInput, GenreUpdateInput } from './types'

export async function getGenres() {
//   return request<Genre[]>('/genre')
const res = await request<{result: Genre[]}>('/genre')
return res.result
}

export function createGenre(payload: GenreFormInput) {
  return request<Genre>('/genre', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateGenre(id: number, payload: GenreUpdateInput) {
  return request<Genre>(`/genre/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteGenre(id: number) {
  return request<void>(`/genre/${id}`, {
    method: 'DELETE',
  })
}
