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
import { createTag, deleteTag, getTags, updateTag } from "./tagApi";
import type { Tag, TagFormInput } from "./types";

const emptyForm: TagFormInput = {
  name: "",
  code: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function TagPage() {
  const [Tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TagFormInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 14;
  const [query, setQuery] = useState("");

  const loadTags = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTags();
      setTags(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load Tags."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTags();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTags = normalizedQuery
    ? Tags.filter((Tag) =>
        [Tag.name, Tag.code].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      )
    : Tags;
  const totalPages = Math.max(1, Math.ceil(filteredTags.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageItems = filteredTags.slice(pageStart, pageStart + pageSize);
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

  const handleChange = (field: keyof TagFormInput, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (Tag: Tag) => {
    setEditingId(Tag.id);
    setForm({ name: Tag.name, code: Tag.code });
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
        await createTag(form);
      } else {
        await updateTag(editingId, form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadTags();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save Tag."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (Tag: Tag) => {
    if (!window.confirm(`Delete Tag "${Tag.name}"?`)) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteTag(Tag.id);
      setTags((prev) => prev.filter((item) => item.id !== Tag.id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete Tag."));
    } finally {
      setSaving(false);
    }
  };

  const isEditing = editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground">
            Manage the Tag list used by films.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Tag" : "Create Tag"}</CardTitle>
            <CardDescription>Define the display name and code.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Tag-name">
                    Name
                  </label>
                  <Input
                    id="Tag-name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Underrated"
                    disabled={saving}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium" htmlFor="Tag-code">
                    Code
                  </label>
                  <Input
                    id="Tag-code"
                    value={form.code}
                    onChange={(event) =>
                      handleChange("code", event.target.value)
                    }
                    placeholder="UDR"
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
              <CardTitle>All Tags</CardTitle>
              <CardDescription>Keep the list tidy for filtering.</CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or code"
                aria-label="Search Tags"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filteredTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {Tags.length === 0
                  ? "No Tags found."
                  : "No Tags match your search."}
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
                    {pageItems.map((Tag) => (
                      <TableRow key={Tag.id}>
                        <TableCell className="font-medium">
                          {Tag.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Tag.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(Tag)}
                              disabled={saving}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(Tag)}
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

export default TagPage;
