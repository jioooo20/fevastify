export type Film = {
  id: number;
  title: string;
  code: string;
  duration: number;
  synopsis?: string;
  release_year: number;
  rating?: number;
  isactive?: boolean;

  language_id: number | null;
  production_house_id: number | null;

  tag_ids?: number[];
  genre_ids?: number[];
  director_ids?: number[];

  media?: CreateFilmMediaDto[];
};

export type FilmFormInput = {
  title: string;
  code: string;
  duration: number;
  synopsis?: string;
  release_year: number;
  rating?: number;
  isactive?: boolean;

  language_id: number | null;
  production_house_id: number | null;

  tag_ids?: number[];
  genre_ids?: number[];
  director_ids?: number[];

  media?: CreateFilmMediaDto[];
};

export type FilmUpdateInput = Partial<FilmFormInput>;
export type CreateFilmMediaDto = {
  type: "Thumbnail" | "Movie" | "Trailer";
  path: string;
};
