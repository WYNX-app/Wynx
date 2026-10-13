import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard",     label: "Dashboard" },
  { to: "/produtos",      label: "Produtos" },
  { to: "/categorias",    label: "Categorias" },
  { to: "/estoque",       label: "Estoque" },
  { to: "/movimentacoes", label: "Movimentações" },
  { to: "/relatorios",    label: "Relatórios" },
  { to: "/ia",            label: "Insights IA" },
  { to: "/alertas",       label: "Alertas" },
  { to: "/equipe",        label: "Equipe" },
  { to: "/config",        label: "Configurações" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col gap-1 p-4 card-soft rounded-none border-r border-border-subtle">
      <div className="px-3 py-4">
        <span className="text-2xl font-black text-brand-gradient">WYNX</span>
      </div>
      {items.map(i => (
        <NavLink
          key={i.to}
          to={i.to}
          className={({ isActive }) =>
            [
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-brand-gradient text-white shadow-soft"
                : "text-text-secondary hover:bg-bg-soft/60",
            ].join(" ")
          }
        >
          {i.label}
        </NavLink>
      ))}
    </aside>
  );
}