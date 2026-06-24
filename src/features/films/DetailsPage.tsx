import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../../shared/api/client";
import { getFilm } from "./filmApi";
import Utility from "../../shared/utils/utility";
import type { CreateFilmMediaDto, Film } from "./types";

type FilmDetail = Film & {
  genres?: { id: number; name: string }[];
  tags?: { id: number; name: string }[];
  directors?: { id: number; name: string }[];
  productionHouse?: string;
};



function getMediaUrl(media: CreateFilmMediaDto[] | undefined, type: CreateFilmMediaDto["type"]) {
  const item = media?.find((m) => m.type === type);
  return item ? `${API_URL}${item.path}` : null;
}

function DetailsPage() {
  const [film, setFilm] = useState<FilmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();

  const loadFilm = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getFilm(Number(id))) as FilmDetail;
      setFilm(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load film details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilm();
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/films">Films</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span>Detail</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <Button
            variant="outline"
            className="mt-4 border-red-200 text-red-700 hover:bg-red-100"
            onClick={loadFilm}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/films">Films</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span>Detail</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-sm font-medium text-slate-600">Film not found</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/films">Back to Films</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/films">Films</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="max-w-[200px] truncate">{film.title}</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {film.title}
            </h1>
            <Badge
              aria-label={film.isactive ? "Active" : "Inactive"}
              className={
                film.isactive
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {film.isactive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {film.code} · {film.release_year} ·{" "}
            {Utility.roundRating(film.rating) != null ? `${Utility.roundRating(film.rating)} / 10` : "Not rated"} ·{" "}
            {film.duration != null ? `${film.duration} min` : "—"}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Media
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_240px]">
          {(() => {
            const trailerUrl = getMediaUrl(film.media, "Trailer");
            return trailerUrl ? (
              <video
                src={trailerUrl}
                controls
                preload="metadata"
                className="aspect-video w-full rounded-lg object-cover"
              />
            ) : (
              <div
                aria-label="No trailer uploaded"
                className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span className="text-sm">No trailer uploaded</span>
                </div>
              </div>
            );
          })()}

          {(() => {
            const movieUrl = getMediaUrl(film.media, "Movie");
            return movieUrl ? (
              <video
                src={movieUrl}
                controls
                preload="metadata"
                className="aspect-video w-full rounded-lg object-cover"
              />
            ) : (
              <div
                aria-label="No film uploaded"
                className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="2" y1="7" x2="7" y2="7" />
                    <line x1="2" y1="17" x2="7" y2="17" />
                    <line x1="17" y1="7" x2="22" y2="7" />
                    <line x1="17" y1="17" x2="22" y2="17" />
                  </svg>
                  <span className="text-sm">No film uploaded</span>
                </div>
              </div>
            );
          })()}

          {(() => {
            const posterUrl = getMediaUrl(film.media, "Thumbnail");
            return posterUrl ? (
              <div className="group relative aspect-[2/3] overflow-hidden rounded-lg">
                <img
                  src={posterUrl}
                  alt={film.title}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
            ) : (
              <div
                aria-label="No poster uploaded"
                className="flex aspect-[2/3] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <span className="text-sm">No poster uploaded</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start md:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {film.synopsis || "No synopsis provided."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Genres
              </p>
              <p className="mt-0.5 text-sm">{Utility.mapItems(film.genres)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tags
              </p>
              <p className="mt-0.5 text-sm">{Utility.mapItems(film.tags)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Director
              </p>
              <p className="mt-0.5 text-sm">{Utility.mapItems(film.directors)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Production House
              </p>
              <p className="mt-0.5 text-sm">
                {film.productionHouse || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>

      <div>
        <Skeleton className="mb-2 h-3 w-12" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_240px]">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="rounded-lg border border-slate-200 p-4 space-y-4">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="mb-1 h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsPage;
