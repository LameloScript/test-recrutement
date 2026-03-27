import { NavLink } from "react-router";
import { FileText, PlusCircle, LayoutDashboard, List, CheckCircle } from "lucide-react";

const links = [
  { to: "/dossiers", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dossiers/nouveau", label: "Nouvelle demande", icon: PlusCircle },
  { to: "/dossiers/liste", label: "Liste des Dossiers", icon: List },
  { to: "/dossiers/validation", label: "Validation", icon: CheckCircle },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <FileText className="size-6 text-primary" />
        <span className="font-bold text-lg">Réassurance</span>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
