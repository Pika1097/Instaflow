import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import EmptyState from "../components/EmptyState";
import MiniBarChart from "../components/MiniBarChart";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import { formatDateTime, getCampaignStats, getHourlyStats, getTopCampaign } from "../utils/analytics";

function Analytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const campaignStats = useMemo(() => getCampaignStats(analytics), [analytics]);
  const topCampaign = getTopCampaign(analytics);

  const campaignChartData = useMemo(() => Object.entries(campaignStats)
    .slice(0, 8)
    .map(([label, value]) => ({ label, value })), [campaignStats]);

  const hourlyChartData = useMemo(() => Object.entries(getHourlyStats(analytics))
    .slice(0, 10)
    .map(([label, value]) => ({ label, value })), [analytics]);

  const averageScore = analytics.length
    ? Math.round(analytics.reduce((sum, item) => sum + (item.score || 0), 0) / analytics.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
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
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Performance intelligence
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Analytics
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            See which keywords trigger replies, when engagement happens, and how strong your comment matches are.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total triggers" value={analytics.length} helper="All matched test comments" tone="blue" />
        <StatCard label="Tracked campaigns" value={campaigns.length} helper="Campaigns available for matching" tone="green" />
        <StatCard label="Average score" value={averageScore || "0"} helper="Keyword match strength" tone="amber" />
        <StatCard label="Best performer" value={topCampaign?.[0] || "None"} helper={topCampaign ? `${topCampaign[1]} triggers` : "No matches yet"} tone="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-black tracking-tight">Campaign triggers</h2>
          <MiniBarChart data={campaignChartData} emptyLabel="No campaign analytics yet" />
        </div>
        <div>
          <h2 className="mb-3 text-xl font-black tracking-tight">Hourly activity</h2>
          <MiniBarChart data={hourlyChartData} emptyLabel="No hourly analytics yet" />
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">Latest matches</h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600 dark:bg-gray-950 dark:text-gray-300">
            {analytics.length} logs
          </span>
        </div>

        {analytics.length === 0 ? (
          <EmptyState
            title="No analytics yet"
            description="Run test comments from the campaigns page to populate campaign performance data."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="hidden grid-cols-[1fr_1.3fr_0.5fr_0.7fr] gap-4 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:bg-gray-950 md:grid">
              <div>Campaign</div>
              <div>Comment</div>
              <div>Score</div>
              <div>Time</div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {analytics.slice(0, 20).map((log) => (
                <div
                  key={log._id}
                  className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_1.3fr_0.5fr_0.7fr] md:items-center"
                >
                  <div>
                    <div className="font-black text-gray-950 dark:text-white">{log.keyword || "Unknown"}</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(log.matched_keywords || []).join(", ") || "No keyword detail"}
                    </div>
                  </div>
                  <div className="break-words text-gray-600 dark:text-gray-300">{log.comment}</div>
                  <div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {log.score || 0}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {formatDateTime(log.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Analytics;
