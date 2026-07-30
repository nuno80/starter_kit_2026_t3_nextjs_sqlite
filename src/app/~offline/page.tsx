export default function OfflinePage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-plaster p-8 text-center text-ink">
      <p className="text-xs font-medium tracking-[0.2em] text-terracotta uppercase">
        Offline
      </p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">
        Sei offline
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Controlla la connessione e riprova. Le pagine già visitate restano
        disponibili dalla cache.
      </p>
    </main>
  );
}
