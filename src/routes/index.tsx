import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Cake, User as UserIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

type ApiUser = {
  id: number;
  gender: string;
  name: { title: string; first: string; last: string };
  location: { city: string; state: string; country: string };
  email: string;
  phone: string;
  cell: string;
  dob: { date: string; age: number };
  login: { username: string; uuid: string };
  picture: { large: string; medium: string; thumbnail: string };
  nat: string;
};

function Index() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`https://api.freeapi.app/api/v1/public/randomusers?page=${page}&limit=12`)
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        if (json?.success) {
          setUsers(json.data.data);
          setTotalPages(json.data.totalPages);
        } else {
          setError("Failed to load users");
        }
      })
      .catch(() => active && setError("Network error"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page]);

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    if (!q) return true;
    const full = `${u.name.first} ${u.name.last}`.toLowerCase();
    return (
      full.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.location.country.toLowerCase().includes(q) ||
      u.login.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Random Users Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse profiles fetched live from the FreeAPI Random Users service.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, country..."
              className="pl-9"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20 text-destructive">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((u) => (
                <Card
                  key={u.login.uuid}
                  className="overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="h-24 bg-gradient-to-r from-primary/80 to-primary" />
                  <CardContent className="pt-0 -mt-12">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={u.picture.large}
                        alt={`${u.name.first} ${u.name.last}`}
                        loading="lazy"
                        className="h-24 w-24 rounded-full border-4 border-card object-cover shadow-md"
                      />
                      <h2 className="mt-3 font-semibold text-lg leading-tight">
                        {u.name.title}. {u.name.first} {u.name.last}
                      </h2>
                      <p className="text-xs text-muted-foreground">@{u.login.username}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {u.gender}
                        </Badge>
                        <Badge variant="outline">{u.nat}</Badge>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <Row icon={<Mail className="h-4 w-4" />} text={u.email} />
                      <Row icon={<Phone className="h-4 w-4" />} text={u.phone} />
                      <Row
                        icon={<MapPin className="h-4 w-4" />}
                        text={`${u.location.city}, ${u.location.country}`}
                      />
                      <Row
                        icon={<Cake className="h-4 w-4" />}
                        text={`${u.dob.age} years old`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-2">
                <UserIcon className="h-10 w-10 opacity-50" />
                No users match your search.
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border/60 mt-12 py-6 text-center text-xs text-muted-foreground">
        Data from api.freeapi.app · Built with React & TanStack Start
      </footer>
    </div>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
