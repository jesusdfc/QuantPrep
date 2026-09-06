import { BookOpen, LayoutDashboard, ListChecks } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { SITE_DOMAIN, SITE_NAME, SITE_TAGLINE } from "../shared/config";

const NAV = [
  { to: "/questions", label: "Questions", icon: ListChecks },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

function Brand() {
  return (
    <NavLink to="/questions" className="brand">
      quantprep<span className="brand-accent">.me</span>
    </NavLink>
  );
}

function NavItems({ className }: { className: string }) {
  return (
    <nav className={className}>
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className="nav-link">
          <Icon size={18} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-head">
          <Brand />
          <p className="sidebar-tagline">{SITE_TAGLINE}</p>
        </div>
        <NavItems className="sidebar-nav" />
        <footer className="sidebar-foot">
          <span className="sidebar-domain">{SITE_DOMAIN}</span>
        </footer>
      </aside>

      <div className="main-column">
        <header className="mobile-topbar">
          <Brand />
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="site-foot">
          <span>
            {SITE_NAME} · {SITE_DOMAIN}
          </span>
        </footer>
      </div>

      <NavItems className="bottom-nav" />
    </div>
  );
}
