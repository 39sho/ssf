import {
  Links,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./index.css";
import { href } from "react-router";

const navItems = [
  { to: href("/basic"), label: "Basic" },
  { to: href("/profile"), label: "Profile" },
  { to: href("/event"), label: "Event Registration" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SSF Playground</title>
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="bg-muted/40 flex min-h-svh items-start justify-center p-6 md:p-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">SSF Playground</h1>
          <p className="text-muted-foreground text-sm">
            Each page is a single Zod schema powering an auto-generated form.
          </p>
        </div>

        <nav className="bg-muted inline-flex h-9 w-full items-center justify-center rounded-lg p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "inline-flex flex-1 items-center justify-center rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}

export function HydrateFallback() {
  return (
    <div className="bg-muted/40 flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );
}
