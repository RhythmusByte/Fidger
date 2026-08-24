"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function HealthRow({ label, status }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      {status === "checking" ? (
        <Loader2 size={16} className="animate-spin text-[var(--fidgerTextMuted)]" />
      ) : status === "ok" ? (
        <span className="flex items-center gap-1.5 fidgerPositiveText text-sm">
          <CheckCircle2 size={16} /> Connected
        </span>
      ) : (
        <span className="flex items-center gap-1.5 fidgerNegativeText text-sm">
          <XCircle size={16} /> Failed
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [dbStatus, setDbStatus] = useState("checking");
  const [nextcloudStatus, setNextcloudStatus] = useState("checking");
  const [dbError, setDbError] = useState("");
  const [nextcloudError, setNextcloudError] = useState("");

  useEffect(() => {
    fetch("/api/health/db")
      .then((response) => response.json())
      .then((data) => {
        setDbStatus(data.ok ? "ok" : "error");
        if (!data.ok) setDbError(data.error || "Unknown error");
      })
      .catch((error) => {
        setDbStatus("error");
        setDbError(error.message);
      });

    fetch("/api/health/nextcloud")
      .then((response) => response.json())
      .then((data) => {
        setNextcloudStatus(data.ok ? "ok" : "error");
        if (!data.ok) setNextcloudError(data.error || "Unknown error");
      })
      .catch((error) => {
        setNextcloudStatus("error");
        setNextcloudError(error.message);
      });
  }, []);

  return (
    <div className="fidgerFadeIn max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
      <p className="fidgerHelperText mb-6">
        Foundation build in progress. Widgets for cash flow, spending, recent activity, and insights arrive in the
        next build phase.
      </p>

      <div className="fidgerCard p-5 mb-4">
        <h2 className="text-sm font-medium mb-3">Connection health</h2>
        <HealthRow label="MongoDB (DB)" status={dbStatus} />
        {dbStatus === "error" ? <p className="fidgerHelperText fidgerNegativeText">{dbError}</p> : null}
        <div className="h-px bg-[var(--fidgerPanelBorder)] my-1" />
        <HealthRow label="Nextcloud (WebDAV)" status={nextcloudStatus} />
        {nextcloudStatus === "error" ? (
          <p className="fidgerHelperText fidgerNegativeText">{nextcloudError}</p>
        ) : null}
      </div>

      <div className="fidgerCard p-5">
        <h2 className="text-sm font-medium mb-1">Net worth</h2>
        <p className="text-2xl font-semibold text-[var(--fidgerTextMuted)]">Not set</p>
        <p className="fidgerHelperText">Configure assets and liabilities in Settings to calculate net worth.</p>
      </div>
    </div>
  );
}
