"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function LatestPost() {
  const { data: posts = [], isLoading } = api.post.getAll.useQuery();
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.getAll.invalidate();
      setName("");
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.getAll.invalidate();
      setEditingId(null);
      setEditingName("");
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPost.mutate({ name: name.trim() });
  };

  const handleUpdateSubmit = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    updatePost.mutate({ id, name: editingName.trim() });
  };

  const startEditing = (id: number, currentName: string | null) => {
    setEditingId(id);
    setEditingName(currentName ?? "");
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-line bg-plaster-deep p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
            Bacheca Post
          </h3>
          <p className="text-xs text-ink-soft">
            Crea, visualizza e gestisci le tue note personali nel database
          </p>
        </div>
        <span className="rounded-full border border-line bg-plaster px-3 py-1 font-mono text-xs font-semibold text-ink">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Scrivi qualcosa da salvare nel DB..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={createPost.isPending}
          className="min-w-0 flex-1 rounded-xl border border-line bg-plaster px-4 py-3 text-sm text-ink placeholder-ink-faint shadow-2xs transition-all duration-200 focus:border-terracotta focus:bg-white focus:ring-2 focus:ring-terracotta/10 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={createPost.isPending || !name.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-plaster shadow-2xs transition-all duration-200 hover:bg-terracotta-d active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {createPost.isPending ? (
            <svg
              className="h-4 w-4 animate-spin text-plaster"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            <span>Invia</span>
          )}
        </button>
      </form>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-line py-12 text-center">
          <svg
            className="h-6 w-6 animate-spin text-ink-soft"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="mt-2 text-xs font-medium text-ink-soft">
            Caricamento post in corso...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong py-12 text-center">
          <svg
            className="mb-3 h-8 w-8 text-ink-faint"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="text-sm font-medium text-ink">
            Nessun post presente
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Inizia inviando un messaggio tramite il modulo sopra.
          </p>
        </div>
      ) : (
        <div className="flex max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-plaster p-4 transition-all duration-200 hover:border-line-strong hover:shadow-2xs"
            >
              {editingId === post.id ? (
                <form
                  onSubmit={(e) => handleUpdateSubmit(e, post.id)}
                  className="flex flex-1 items-center gap-2"
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    disabled={updatePost.isPending}
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border border-line-strong bg-white px-3 py-1.5 text-sm text-ink focus:ring-2 focus:ring-terracotta/20 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={updatePost.isPending || !editingName.trim()}
                    className="rounded-lg bg-terracotta px-3 py-1.5 text-xs font-semibold text-plaster transition hover:bg-terracotta-d active:scale-[0.98] disabled:opacity-50"
                  >
                    Salva
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={updatePost.isPending}
                    className="rounded-lg border border-line bg-plaster-deep px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-plaster hover:text-ink active:scale-[0.98]"
                  >
                    Annulla
                  </button>
                </form>
              ) : (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-ink">
                      {post.name}
                    </p>
                    <span className="font-mono text-xs text-ink-soft">
                      ID: #{post.id} •{" "}
                      {new Date(post.createdAt).toISOString().slice(11, 16)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditing(post.id, post.name)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-ink-soft transition hover:border-line hover:bg-plaster-deep hover:text-ink active:scale-[0.95]"
                      title="Modifica post"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePost.mutate({ id: post.id })}
                      disabled={
                        deletePost.isPending &&
                        deletePost.variables?.id === post.id
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-ink-soft transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-[0.95] disabled:opacity-50"
                      title="Elimina post"
                    >
                      {deletePost.isPending &&
                      deletePost.variables?.id === post.id ? (
                        <svg
                          className="h-3.5 w-3.5 animate-spin text-red-600"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
