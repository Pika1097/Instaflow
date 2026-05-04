import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import heroImage from "../assets/hero.png";
import Icon from "../components/Icon";

function Login({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    const data = await apiRequest("/login", "POST", {
      email: cleanEmail,
      password,
    });

    if (data?.success) {
      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("refresh_token", data.data.refresh_token);
      navigate("/dashboard");
    } else {
      setError(data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-100 text-gray-950 dark:bg-black dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gray-950 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(16,185,129,0.35),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(249,115,22,0.25),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-sm font-black text-gray-950">
                IF
              </div>
              <div>
                <div className="text-xl font-black">Instaflow</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Instagram AI automation
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Built for creators and brands
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight">
                Convert comments into conversations on autopilot.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-gray-300">
                Capture keywords, send instant DM replies, test automations, and watch campaign analytics from one polished command center.
              </p>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <img
                src={heroImage}
                alt="Instaflow automation dashboard preview"
                className="h-64 w-full rounded-2xl object-cover"
              />
              <div className="absolute bottom-8 left-8 rounded-2xl bg-white px-4 py-3 text-sm font-black text-gray-950 shadow-xl">
                1M+ simulated messages ready
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gray-950 text-sm font-black text-white dark:bg-white dark:text-gray-950">
                  IF
                </div>
                <div>
                  <div className="text-xl font-black">Instaflow</div>
                  <div className="text-xs font-bold text-emerald-600">AI DM engine</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="ml-auto grid h-11 w-11 place-items-center rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-gray-800 dark:bg-gray-900"
                title="Toggle theme"
              >
                <Icon name={darkMode ? "sun" : "moon"} />
              </button>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none sm:p-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Login to manage your campaigns, automation tests, and analytics.
                </p>
              </div>

              <form onSubmit={login} className="mt-8 space-y-4">
                <label className="block">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Email</span>
                  <input
                    value={email}
                    disabled={loading}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:focus:bg-gray-900"
                    placeholder="you@example.com"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Password</span>
                  <input
                    value={password}
                    disabled={loading}
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white dark:border-gray-800 dark:bg-gray-950 dark:focus:bg-gray-900"
                    placeholder="Your password"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                New to Instaflow?{" "}
                <Link to="/signup" className="font-black text-emerald-600 dark:text-emerald-400">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
