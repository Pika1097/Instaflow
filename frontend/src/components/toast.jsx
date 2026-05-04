function Toast({ message, type }) {
  if (!message) return null;

  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    error: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  };

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-slideDown">
      <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${styles[type] || styles.info}`}>
        {message}
      </div>
    </div>
  );
}

export default Toast;
