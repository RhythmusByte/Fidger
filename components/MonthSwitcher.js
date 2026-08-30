"use client";

export default function MonthSwitcher({ year, month, onChange }) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function shift(delta) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    onChange(newYear, newMonth);
  }

  return (
    <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 transition-colors">
      <button
        onClick={() => shift(-1)}
        className="text-slate-500 dark:text-slate-400 px-2"
      >
        {"\u2039"}
      </button>
      <span className="font-medium text-sm dark:text-slate-100">
        {monthNames[month]} {year}
      </span>
      <button
        onClick={() => shift(1)}
        className="text-slate-500 dark:text-slate-400 px-2"
      >
        {"\u203A"}
      </button>
    </div>
  );
}
