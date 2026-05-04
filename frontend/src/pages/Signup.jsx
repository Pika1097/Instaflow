import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import Icon from "../components/Icon";

function Signup({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const data = await apiRequest("/signup", "POST", {
      email: cleanEmail,
      password,
    });

    if (data?.success) {
      setSuccess(data.message || "Signup successful");
      window.setTimeout(() => navigate("/"), 900);
    } else {
      setError(data?.message || "Signup failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-gray-950 dark:bg-black dark:text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/70 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-gray-950 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-sm font-black text-gray-950">
                IF
              </div>
              <div>
                <div className="text-xl font-black">Instaflow</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Launch workspace
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-black leading-tight tracking-tight">
                Build your first automation in minutes.
              </h1>
              <div className="mt-8 grid gap-3">
                {[
                  "Create keyword campaigns",
                  "Test comments before going live",
                  "Track every matched DM trigger",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Create account</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Start with a secure workspace for your automation engine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
                title="Toggle theme"
              >
                <Icon name={darkMode ? "sun" : "moon"} />
              </button>
            </div>

            <form onSubmit={signup} className="space-y-4">
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
                  placeholder="At least 6 characters"
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/" className="font-black text-emerald-600 dark:text-emerald-400">
                Login
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Signup;
