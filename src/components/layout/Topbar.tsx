export function Topbar() {
  return (
    <header className="flex items-center gap-4 px-6 py-3 card-soft rounded-none border-b border-border-subtle">
      <input
        placeholder="Buscar (Ctrl+K)"
        className="field max-w-md"
      />
      <div className="ml-auto flex items-center gap-3">
        <button className="relative h-10 w-10 rounded-full bg-bg-surface border border-border-subtle">
          🔔
        </button>
        <div className="h-10 w-10 rounded-full bg-brand-gradient" />
      </div>
    </header>
  );
}