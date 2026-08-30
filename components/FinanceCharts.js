"use client";

import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#9333ea",
  "#c084fc",
  "#f472b6",
  "#a78bfa",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
];

const AXIS_COLOR = "#71717a";

export default function FinanceCharts({ spendingByCategory, balanceTrend }) {
  const pieData = Object.entries(spendingByCategory)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 gap-4 mb-4">
      {pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-4 transition-colors"
        >
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-ink mb-2">
            Spending by category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name }) => name}
                animationDuration={500}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => value.toFixed(2)}
                contentStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {balanceTrend.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-surface-card rounded-xl border border-zinc-200 dark:border-surface-border p-4 transition-colors"
        >
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-ink mb-2">
            Balance trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={balanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={AXIS_COLOR} opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} />
              <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} />
              <Tooltip formatter={(value) => value.toFixed(2)} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
