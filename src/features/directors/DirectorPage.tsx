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
import { createDirector, deleteDirector, getDirectors, updateDirector } from "./directorApi";
import type { Director, DirectorFormInput } from "./types";

const emptyForm: DirectorFormInput = {
  name: "",
  code: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function DirectorPage() {
  const [Directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DirectorFormInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 14;
  const [query, setQuery] = useState("");

  const loadDirectors = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDirectors();
      setDirectors(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load Directors."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDirectors();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredDirectors = normalizedQuery
    ? Directors.filter((Director) =>
        [Director.name, Director.code].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      )
    : Directors;
  const totalPages = Math.max(1, Math.ceil(filteredDirectors.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageItems = filteredDirectors.slice(pageStart, pageStart + pageSize);
  const showEllipsis = totalPages > 6;
  const firstPages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1);
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

  const handleChange = (field: keyof DirectorFormInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (Director: Director) => {
    setEditingId(Director.id);
    setForm({ name: Director.name, code: Director.code });
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
      if (editingId === null) {
        await createDirector(form);
      } else {
        await updateDirector(editingId, form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadDirectors();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save Director."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (Director: Director) => {
    if (!window.confirm(`Delete Director "${Director.name}"?`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteDirector(Director.id);
      setDirectors((prev) => prev.filter((item) => item.id !== Director.id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete Director."));
    } finally {
      setSaving(false);
    }
  };

  const isEditing = editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Directors</h1>
          <p className="text-sm text-muted-foreground">
            Manage the Director list used by films.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Director" : "Create Director"}</CardTitle>
            <CardDescription>Define the display name and code.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Director-name">
                    Name
                  </label>
                  <Input
                    id="Director-name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Raditya Dika"
                    disabled={saving}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Director-code">
                    Code
                  </label>
                  <Input
                    id="Director-code"
                    value={form.code}
                    onChange={(event) =>
                      handleChange("code", event.target.value)
                    }
                    placeholder="RDT"
                    disabled={saving}
                    required
                  />
                </div>
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
              <CardTitle>All Directors</CardTitle>
              <CardDescription>Keep the list tidy for filtering.</CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or code"
                aria-label="Search Directors"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filteredDirectors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {Directors.length === 0
                  ? "No Directors found."
                  : "No Directors match your search."}
              </p>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((Director) => (
                      <TableRow key={Director.id}>
                        <TableCell className="font-medium">
                          {Director.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Director.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(Director)}
                              disabled={saving}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(Director)}
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
                    <Pagination className= "w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              setPage((current) => Math.max(1, current - 1));
                            }}
                            aria-disabled={page === 1}
                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                                Math.min(totalPages, current + 1)
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

export default DirectorPage;
