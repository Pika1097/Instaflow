const paths = {
  grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  campaign: "M4 7h10l6-3v16l-6-3H4V7Zm0 4H2v2h2",
  chart: "M4 19V5m6 14V9m6 10V3m4 16H2",
  logout: "M10 17l5-5-5-5m5 5H3m15-8v16",
  plus: "M12 5v14m7-7H5",
  edit: "M4 20h4l10-10-4-4L4 16v4Zm12-16 4 4",
  trash: "M5 7h14M10 11v6m4-6v6M8 7l1-3h6l1 3m1 0-1 13H8L7 7",
  play: "M7 5v14l12-7L7 5Z",
  moon: "M20 15.5A8.5 8.5 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z",
  sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.42-1.42M4.92 19.08l1.42-1.42m0-11.32L4.92 4.92m14.16 14.16-1.42-1.42M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z",
};

function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}

export default Icon;
