function MiniBarChart({ data = [], emptyLabel = "No data yet" }) {
  const max = Math.max(...data.map((item) => item.value), 0);

  if (!data.length || max === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-56 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-full items-end gap-3">
        {data.map((item) => {
          const height = Math.max((item.value / max) * 100, 8);

          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="relative flex h-40 w-full items-end overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-emerald-500 to-sky-500 transition-all duration-700"
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <div className="w-full truncate text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniBarChart;
