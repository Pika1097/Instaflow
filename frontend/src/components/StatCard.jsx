function StatCard({ label, value, helper, tone = "blue" }) {
  const tones = {
    blue: "from-sky-500 to-blue-600",
    green: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-pink-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${tones[tone]}`} />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">
        {value}
      </div>
      {helper && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helper}</p>
      )}
    </div>
  );
}

export default StatCard;
