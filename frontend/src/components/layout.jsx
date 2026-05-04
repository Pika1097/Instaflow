import { NavLink, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { getUserFromToken, logoutUser } from "../utils/auth";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: "grid" },
  { to: "/campaigns", label: "Campaigns", icon: "campaign" },
  { to: "/analytics", label: "Analytics", icon: "chart" },
];

function Layout({ children, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const logout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-950 dark:bg-black dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-gray-200 bg-white/90 px-5 py-6 shadow-sm backdrop-blur xl:block dark:border-gray-800 dark:bg-gray-950/90">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gray-950 text-sm font-black text-white dark:bg-white dark:text-gray-950">
            IF
          </div>
          <div>
            <div className="text-lg font-black tracking-tight">Instaflow</div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
              AI DM engine
            </div>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-gray-950 text-white shadow-lg shadow-gray-950/10 dark:bg-white dark:text-gray-950"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 space-y-3">
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            title="Toggle theme"
          >
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
            <Icon name={darkMode ? "sun" : "moon"} />
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-between rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
            title="Logout"
          >
            <span>Logout</span>
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 px-4 py-4 backdrop-blur dark:border-gray-800 dark:bg-black/85 sm:px-6 xl:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-black">Instaflow</div>
              <div className="max-w-[13rem] truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 dark:border-gray-800"
                title="Toggle theme"
              >
                <Icon name={darkMode ? "sun" : "moon"} />
              </button>

              <button
                type="button"
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-xl bg-red-500 text-white"
                title="Logout"
              >
                <Icon name="logout" />
              </button>
            </div>
          </div>

          <nav className="mt-4 grid grid-cols-3 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-center text-xs font-bold transition ${
                    isActive
                      ? "bg-gray-950 text-white dark:bg-white dark:text-gray-950"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
