import { BookOpen, LayoutDashboard, ListChecks, LogIn, LogOut, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../shared/AuthProvider";
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
  const { configured, loading, user, signOut } = useAuth();

  const account = user ? (
    <div className="account-panel">
      <span className="account-email" title={user.email}>
        <UserRound size={15} /> {user.email}
      </span>
      <button type="button" className="account-action" onClick={() => void signOut()}>
        <LogOut size={15} /> Sign out
      </button>
    </div>
  ) : (
    <NavLink to="/auth" className="account-action account-login">
      <LogIn size={15} /> {configured ? "Sign in" : "Set up sign-in"}
    </NavLink>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-head">
          <Brand />
          <p className="sidebar-tagline">{SITE_TAGLINE}</p>
        </div>
        <NavItems className="sidebar-nav" />
        {!loading && account}
        <footer className="sidebar-foot">
          <span className="sidebar-domain">{SITE_DOMAIN}</span>
        </footer>
      </aside>

      <div className="main-column">
        <header className="mobile-topbar">
          <Brand />
          {!loading && (
            <NavLink
              to={user ? "/dashboard" : "/auth"}
              className="mobile-account"
              aria-label="Account"
            >
              <UserRound size={19} />
            </NavLink>
          )}
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
