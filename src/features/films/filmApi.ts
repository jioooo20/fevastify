import { request } from "../../shared/api/client";
import type { Film, FilmFormInput, FilmUpdateInput } from "./types";

export async function getFilms() {
  //   return request<Film[]>('/Film')
  const res = await request<{ result: Film[] }>("/Film");
  return res.result;
}

export async function getFilm(id: number) {
  const res = await request<Film>(`/Film/${id}`);
  return res;
}

export function createFilm(payload: FilmFormInput) {
  return request<Film>("/Film", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateFilm(id: number, payload: FilmUpdateInput) {
  return request<Film>(`/Film/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteFilm(id: number) {
  return request<void>(`/Film/${id}`, {
    method: "DELETE",
  });
}
