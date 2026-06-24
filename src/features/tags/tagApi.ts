import { request } from '../../shared/api/client'
import type { Tag, TagFormInput, TagUpdateInput } from './types'

export async function getTags() {
//   return request<Tag[]>('/Tag')
const res = await request<{result: Tag[]}>('/Tag')
return res.result
}

export function createTag(payload: TagFormInput) {
  return request<Tag>('/Tag', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTag(id: number, payload: TagUpdateInput) {
  return request<Tag>(`/Tag/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteTag(id: number) {
  return request<void>(`/Tag/${id}`, {
    method: 'DELETE',
  })
}
