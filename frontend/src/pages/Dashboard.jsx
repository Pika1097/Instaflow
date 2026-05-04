import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import EmptyState from "../components/EmptyState";
import MiniBarChart from "../components/MiniBarChart";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { formatDateTime, getCampaignStats, getHourlyStats, getTopCampaign } from "../utils/analytics";
import { getUserFromToken } from "../utils/auth";

function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUserFromToken();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const [campaignRes, analyticsRes] = await Promise.all([
        apiRequest("/campaigns"),
        apiRequest("/analytics"),
      ]);

      if (!mounted) return;

      if (campaignRes?.success) setCampaigns(campaignRes.data || []);
      if (analyticsRes?.success) setAnalytics(analyticsRes.data || []);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const activeCampaigns = campaigns.filter((campaign) => campaign.active !== false);
  const topCampaign = getTopCampaign(analytics);

  const chartData = useMemo(() => {
    const stats = getCampaignStats(analytics);
    return Object.entries(stats)
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [analytics]);

  const hourlyData = useMemo(() => {
    const stats = getHourlyStats(analytics);
    return Object.entries(stats)
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));
  }, [analytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <section className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-2xl shadow-gray-950/10">
        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              Instagram automation command center
            </div>
            <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Turn comments into DMs, leads, and repeatable workflows.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
              Welcome back{user?.email ? `, ${user.email}` : ""}. Your automations are ready to answer keywords, score matches, and log every conversion signal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/campaigns"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:-translate-y-0.5"
              >
                Build automation
              </Link>
              <Link
                to="/analytics"
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                View insights
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">
              Live simulation
            </div>
            <div className="mt-5 space-y-4">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white px-4 py-3 text-sm font-semibold text-gray-950">
                Link please, I want the offer.
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-emerald-400 px-4 py-3 text-sm font-bold text-gray-950">
                Sent the details in DM. Want me to add you to the lead list?
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Match confidence</span>
                  <span className="font-black text-emerald-300">92%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[92%] rounded-full bg-emerald-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total campaigns" value={campaigns.length} helper="Automations in your workspace" tone="blue" />
        <StatCard label="Active campaigns" value={activeCampaigns.length} helper="Currently listening for comments" tone="green" />
        <StatCard label="DM triggers" value={analytics.length} helper="Matched comments logged" tone="amber" />
        <StatCard label="Top campaign" value={topCampaign?.[0] || "None"} helper={topCampaign ? `${topCampaign[1]} matches` : "Create and test one"} tone="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Campaign performance</h2>
            <Link to="/analytics" className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Analytics
            </Link>
          </div>
          <MiniBarChart data={chartData} emptyLabel="No campaign matches yet" />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Recent activity</h2>
            <Link to="/campaigns" className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Test
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {analytics.length === 0 ? (
              <EmptyState
                title="No matched comments yet"
                description="Test a comment from the campaigns page to see activity here."
              />
            ) : (
              <div className="space-y-3">
                {analytics.slice(0, 6).map((log) => (
                  <div key={log._id} className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 font-black text-gray-950 dark:text-white">
                        {log.keyword || "Unknown"}
                      </div>
                      <div className="shrink-0 text-xs font-semibold text-gray-500">
                        {formatDateTime(log.timestamp)}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {log.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black tracking-tight">Hourly momentum</h2>
        <MiniBarChart data={hourlyData} emptyLabel="No hourly data yet" />
      </section>
    </div>
  );
}

export default Dashboard;
