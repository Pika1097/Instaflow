export const getCampaignStats = (analytics = []) => analytics.reduce((stats, item) => {
  const key = item.keyword || "Unknown";
  stats[key] = (stats[key] || 0) + 1;
  return stats;
}, {});

export const getTopCampaign = (analytics = []) => {
  const stats = getCampaignStats(analytics);
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  return entries[0] || null;
};

export const getHourlyStats = (analytics = []) => analytics.reduce((stats, item) => {
  const hour = new Date(item.timestamp).getHours();
  const label = `${hour}:00`;
  stats[label] = (stats[label] || 0) + 1;
  return stats;
}, {});

export const formatDateTime = (value) => {
  if (!value) return "Just now";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
