import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createFilm, deleteFilm, getFilms, updateFilm } from "./filmApi.ts";
import { getGenres } from "../genres/genreApi.ts";
import { getTags } from "../tags/tagApi.ts";
import { getDirectors } from "../directors/directorApi.ts";
import { getProductionHouses } from "../production_house/productionHouseApi.ts";
import { API_URL } from "../../shared/api/client";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { Film, FilmFormInput } from "./types";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { NavLink } from "react-router-dom";

function roundRating(rating: number | undefined): number | undefined {
  if (rating === undefined) {
    return undefined;
  }
  return Math.round(rating * 100) / 100;
}

const emptyForm: FilmFormInput = {
  title: "",
  code: "",
  duration: 0,
  synopsis: "",
  release_year: new Date().getFullYear(),
  rating: 0,
  language_id: null,
  production_house_id: null,

  tag_ids: [],
  genre_ids: [],
  director_ids: [],
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function normalizeRelatedIds(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (typeof value === "number") {
        return value;
      }

      if (typeof value === "string") {
        return Number.parseInt(value, 10);
      }

      if (value && typeof value === "object" && "id" in value) {
        const relatedId = (value as { id?: number | string }).id;
        return typeof relatedId === "number"
          ? relatedId
          : Number.parseInt(String(relatedId), 10);
      }

      return Number.NaN;
    })
    .filter((id) => Number.isFinite(id));
}

function FilmPage() {
  const [Films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FilmFormInput>(emptyForm);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [directors, setDirectors] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [production_house, setProductionHouse] = useState<
    { id: number; name: string }[]
  >([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [movieFile, setMovieFile] = useState<File | null>(null);
  const genresComboboxAnchor = useComboboxAnchor();
  const tagsComboboxAnchor = useComboboxAnchor();
  const directorsComboboxAnchor = useComboboxAnchor();
  const productionHousesComboboxAnchor = useComboboxAnchor();
  const [page, setPage] = useState(1);
  const pageSize = 14;
  const [query, setQuery] = useState("");

  const loadFilms = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFilms();
      const genresData = await getGenres();
      const tagsData = await getTags();
      const directorsData = await getDirectors();
      const PHsData = await getProductionHouses();
      setFilms(data);
      setGenres(genresData ?? []);
      setTags(tagsData ?? []);
      setDirectors(directorsData ?? []);
      setProductionHouse(PHsData ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load Films."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFilms();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFilms = normalizedQuery
    ? Films.filter((Film) =>
        [Film.title, Film.code].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
    : Films;
  const totalPages = Math.max(1, Math.ceil(filteredFilms.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageItems = filteredFilms.slice(pageStart, pageStart + pageSize);
  const showEllipsis = totalPages > 6;
  const firstPages = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => i + 1,
  );
  const lastPages = showEllipsis
    ? Array.from({ length: 3 }, (_, i) => totalPages - 2 + i)
    : [];

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const handleChange = (field: keyof FilmFormInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (Film: Film) => {
    setEditingId(Film.id);
    setForm({
      title: Film.title,
      code: Film.code,
      duration: Film.duration,
      synopsis: Film.synopsis,
      release_year: Film.release_year,
      rating: Film.rating,
      language_id: Film.language_id,
      production_house_id: Film.production_house_id,
      tag_ids: normalizeRelatedIds((Film as Film & { tags?: unknown }).tags),
      genre_ids: normalizeRelatedIds(
        (Film as Film & { genres?: unknown }).genres,
      ),
      director_ids: normalizeRelatedIds(
        (Film as Film & { directors?: unknown }).directors,
      ),
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const hasFiles = !!(thumbnailFile || trailerFile || movieFile);

      if (hasFiles) {
        const fd = new FormData();

        if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
        if (trailerFile) fd.append("trailer", trailerFile);
        if (movieFile) fd.append("movie", movieFile);

        // copy form and coerce numeric fields
        const payloadObj: any = { ...form };
        if (typeof payloadObj.duration === "string")
          payloadObj.duration = Number(payloadObj.duration);
        if (typeof payloadObj.release_year === "string")
          payloadObj.release_year = Number(payloadObj.release_year);
        if (typeof payloadObj.rating === "string")
          payloadObj.rating = Number(payloadObj.rating);

        // serialize arrays/objects as JSON strings
        Object.keys(payloadObj).forEach((key) => {
          const value = (payloadObj as any)[key];
          if (value === undefined || value === null) return;
          if (Array.isArray(value) || typeof value === "object") {
            fd.append(key, JSON.stringify(value));
          } else {
            fd.append(key, String(value));
          }
        });

        const url =
          editingId === null
            ? `${API_URL}/Film`
            : `${API_URL}/Film/${editingId}`;
        const method = editingId === null ? "POST" : "PATCH";

        const res = await fetch(url, {
          method,
          body: fd,
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `${res.status} ${res.statusText}`);
        }
      } else {
        if (editingId === null) {
          await createFilm(form);
        } else {
          await updateFilm(editingId, form);
        }
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadFilms();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save Film."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (Film: Film) => {
    if (!window.confirm(`Delete Film "${Film.title}"?`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteFilm(Film.id);
      setFilms((prev) => prev.filter((item) => item.id !== Film.id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete Film."));
    } finally {
      setSaving(false);
    }
  };

  const isEditing = editingId !== null;
  const selectedGenreIds = form.genre_ids ?? [];
  const selectedTagIds = form.tag_ids ?? [];
  const selectedDirectorIds = form.director_ids ?? [];
  const selectedProductionHouseId = form.production_house_id;
  const selectedGenres = genres.filter((genre) =>
    selectedGenreIds.includes(genre.id),
  );
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const selectedDirectors = directors.filter((director) =>
    selectedDirectorIds.includes(director.id),
  );
  const selectedProductionHouse =
    production_house.find(
      (productionHouse) => productionHouse.id === selectedProductionHouseId,
    ) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Films</h1>
          <p className="text-sm text-muted-foreground">
            Manage the Film list used by films.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Film" : "Create Film"}</CardTitle>
            <CardDescription>
              Define the display title and code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-1">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Film-title">
                    Title
                  </label>
                  <Input
                    id="Film-title"
                    value={form.title}
                    onChange={(event) =>
                      handleChange("title", event.target.value)
                    }
                    placeholder="Ponyo"
                    disabled={saving}
                    required
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="Film-code">
                      Code
                    </label>
                    <Input
                      id="Film-code"
                      value={form.code}
                      onChange={(event) =>
                        handleChange("code", event.target.value)
                      }
                      placeholder="PNYO2008"
                      disabled={saving}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="Film-release_year"
                    >
                      Year
                    </label>
                    <Input
                      id="Film-release_year"
                      value={form.release_year}
                      onChange={(event) =>
                        handleChange("release_year", event.target.value)
                      }
                      placeholder="2011"
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Genres</label>
                  <Combobox
                    items={genres}
                    value={selectedGenres}
                    itemToStringLabel={(value) => value.name}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        genre_ids: value.map((item) => item.id),
                      }));
                    }}
                    multiple
                  >
                    <div ref={genresComboboxAnchor}>
                      <ComboboxChips>
                        {selectedGenres.map((genre) => {
                          return (
                            <ComboboxChip key={genre.id}>
                              {genre.name}
                            </ComboboxChip>
                          );
                        })}
                        <ComboboxChipsInput />
                      </ComboboxChips>

                      <ComboboxContent anchor={genresComboboxAnchor}>
                        <ComboboxList>
                          {(genre) => (
                            <ComboboxItem key={genre.id} value={genre}>
                              {genre.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </div>
                  </Combobox>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Combobox
                    items={tags}
                    value={selectedTags}
                    itemToStringLabel={(value) => value.name}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        tag_ids: value.map((item) => item.id),
                      }));
                    }}
                    multiple
                  >
                    <div ref={tagsComboboxAnchor}>
                      <ComboboxChips>
                        {selectedTags.map((tag) => {
                          return (
                            <ComboboxChip key={tag.id}>{tag.name}</ComboboxChip>
                          );
                        })}
                        <ComboboxChipsInput />
                      </ComboboxChips>

                      <ComboboxContent anchor={tagsComboboxAnchor}>
                        <ComboboxList>
                          {(tag) => (
                            <ComboboxItem key={tag.id} value={tag}>
                              {tag.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </div>
                  </Combobox>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Director</label>
                  <Combobox
                    items={directors}
                    value={selectedDirectors}
                    itemToStringLabel={(value) => value.name}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        director_ids: value.map((item) => item.id),
                      }));
                    }}
                    multiple
                  >
                    <div ref={directorsComboboxAnchor}>
                      <ComboboxChips>
                        {selectedDirectors.map((director) => {
                          return (
                            <ComboboxChip key={director.id}>
                              {director.name}
                            </ComboboxChip>
                          );
                        })}
                        <ComboboxChipsInput />
                      </ComboboxChips>

                      <ComboboxContent anchor={directorsComboboxAnchor}>
                        <ComboboxList>
                          {(director) => (
                            <ComboboxItem key={director.id} value={director}>
                              {director.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </div>
                  </Combobox>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Production House
                  </label>
                  <Combobox
                    items={production_house}
                    value={selectedProductionHouse}
                    itemToStringLabel={(value) => value.name}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        production_house_id: value === null ? null : value.id,
                      }));
                    }}
                  >
                    <div ref={productionHousesComboboxAnchor}>
                      <ComboboxInput
                        placeholder="Search production house"
                        disabled={saving}
                        showClear
                      />

                      <ComboboxContent anchor={productionHousesComboboxAnchor}>
                        <ComboboxList>
                          {(productionHouse) => (
                            <ComboboxItem
                              key={productionHouse.id}
                              value={productionHouse}
                            >
                              {productionHouse.name}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </div>
                  </Combobox>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Film-rating">
                    Rating
                  </label>
                  <Input
                    id="Film-rating"
                    value={form.rating}
                    onChange={(event) =>
                      handleChange("rating", event.target.value)
                    }
                    placeholder="Enter rating"
                    type="number"
                    min={0}
                    max={10}
                    step={0.01}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Film-duration">
                    Duration (minutes)
                  </label>
                  <Input
                    id="Film-duration"
                    value={form.duration}
                    onChange={(event) =>
                      handleChange("duration", event.target.value)
                    }
                    placeholder="Enter duration in minutes"
                    type="number"
                    min={0}
                    disabled={saving}
                    required
                  />
                </div>

                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Synopsis</FieldLabel>
                      <textarea
                        id="Film-synopsis"
                        value={form.synopsis}
                        onChange={(event) =>
                          handleChange("synopsis", event.target.value)
                        }
                        placeholder="Input the synopsis"
                        disabled={saving}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        rows={4}
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </div>

              <Separator />

              <CardTitle>Media</CardTitle>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="Film-thumbnail">
                  Thumbnail
                </label>
                <Input
                  id="Film-thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] ?? null)
                  }
                  disabled={saving}
                />
                {thumbnailFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {thumbnailFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setThumbnailFile(null)}
                      disabled={saving}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="Film-trailer">
                  Trailer
                </label>
                <Input
                  id="Film-trailer"
                  type="file"
                  accept="movie/*"
                  onChange={(e) => setTrailerFile(e.target.files?.[0] ?? null)}
                  disabled={saving}
                />
                {trailerFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {trailerFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setTrailerFile(null)}
                      disabled={saving}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="Film-movie">
                  Movie
                </label>
                <Input
                  id="Film-movie"
                  type="file"
                  accept="movie/*"
                  onChange={(e) => setMovieFile(e.target.files?.[0] ?? null)}
                  disabled={saving}
                />
                {movieFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {movieFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMovieFile(null)}
                      disabled={saving}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {isEditing ? "Update" : "Create"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Films</CardTitle>
              <CardDescription>
                Keep the list tidy for filtering.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or code"
                aria-label="Search Films"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filteredFilms.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {Films.length === 0
                  ? "No Films found."
                  : "No Films match your search."}
              </p>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((Film) => (
                      <TableRow key={Film.id}>
                        <TableCell className="font-medium">
                          {Film.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Film.code}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Film.release_year}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {roundRating(Film.rating) ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {roundRating(Film.duration) ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <NavLink
                              to={`${Film.id}`}
                              className="text-sm bg-primary text-primary-foreground rounded-md border border-primary px-2 py-1"
                              type="button"
                            >
                              Detail
                            </NavLink>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(Film)}
                              disabled={saving}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(Film)}
                              disabled={saving}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <Pagination className="w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              setPage((current) => Math.max(1, current - 1));
                            }}
                            aria-disabled={page === 1}
                            className={
                              page === 1 ? "pointer-events-none opacity-50" : ""
                            }
                          />
                        </PaginationItem>
                        {!showEllipsis &&
                          Array.from({ length: totalPages }, (_, index) => {
                            const pageNumber = index + 1;
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  href="#"
                                  isActive={pageNumber === page}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setPage(pageNumber);
                                  }}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                        {showEllipsis && (
                          <>
                            {firstPages.map((pageNumber) => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  href="#"
                                  isActive={pageNumber === page}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setPage(pageNumber);
                                  }}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                            {lastPages.map((pageNumber) => (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  href="#"
                                  isActive={pageNumber === page}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setPage(pageNumber);
                                  }}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                          </>
                        )}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              setPage((current) =>
                                Math.min(totalPages, current + 1),
                              );
                            }}
                            aria-disabled={page === totalPages}
                            className={
                              page === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FilmPage;
