import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { analyticsAPI } from "../services/api";

const retryRequest = async (requestFn, retries = 2, baseDelayMs = 500) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const retryable = !status || status >= 500;

      if (!retryable || attempt === retries) {
        break;
      }

      const waitMs = baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError;
};

const eventLabels = {
  study_session_started: "Session Started",
  study_session_completed: "Session Completed",
  task_created: "Task Created",
  task_completed: "Task Completed",
  course_ingested: "Course Ingested",
  plan_generated: "Plan Generated",
  focus_tracked: "Focus Tracked",
  login: "Login",
  profile_updated: "Profile Updated",
};

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5">
    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-3xl font-black mt-2 text-foreground">{value}</p>
    {hint && <p className="text-xs mt-2 text-muted-foreground">{hint}</p>}
  </div>
);

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const [summaryRes, insightsRes, timelineRes] = await Promise.allSettled([
          retryRequest(() => analyticsAPI.getSummary({})),
          retryRequest(() => analyticsAPI.getInsights({ days: 30 })),
          retryRequest(() => analyticsAPI.getTimeline({ limit: 20 })),
        ]);

        const summaryData =
          summaryRes.status === "fulfilled" ? summaryRes.value?.data || {} : {};
        const insightsData =
          insightsRes.status === "fulfilled"
            ? insightsRes.value?.data?.insights || null
            : null;
        const timelineData =
          timelineRes.status === "fulfilled"
            ? timelineRes.value?.data?.events || []
            : [];

        setSummary(summaryData);
        setInsights(insightsData);
        setTimeline(timelineData);

        const failures = [summaryRes, insightsRes, timelineRes].filter(
          (result) => result.status === "rejected",
        );

        if (failures.length > 0) {
          const statusCodes = failures
            .map((result) => result.reason?.response?.status)
            .filter(Boolean);

          if (statusCodes.includes(502) || statusCodes.includes(503)) {
            setError(
              "Some analytics services are temporarily unavailable. Showing partial data.",
            );
          } else if (statusCodes.includes(401)) {
            setError("Session expired. Please log in again.");
          } else if (!summaryData.totalEvents && !insightsData && !timelineData.length) {
            setError("Failed to load analytics data.");
          }
        }
      } catch (err) {
        if (err?.response?.status === 502 || err?.response?.status === 503) {
          setError("Learning analytics service is temporarily unavailable.");
        } else if (err?.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err?.response?.data?.error || "Failed to load analytics data.");
        }
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const topEvents = useMemo(() => {
    const map = summary?.eventCounts || {};
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [summary]);

  return (
    <div className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Learning Analytics</h1>
        <p className="text-muted-foreground mt-2">30-day behavior, consistency, and productivity trends.</p>
      </motion.div>

      {loading && <p className="mt-8 text-muted-foreground">Loading analytics...</p>}
      {error && <p className="mt-8 text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="mt-8 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Events" value={summary?.totalEvents || 0} />
            <StatCard label="Active Days" value={summary?.activeDays || 0} />
            <StatCard label="Current Streak" value={summary?.currentStreak || 0} hint="days" />
            <StatCard label="Longest Streak" value={summary?.longestStreak || 0} hint="days" />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card/80 p-5">
              <h2 className="text-lg font-bold text-foreground">Top Activities</h2>
              <div className="mt-4 space-y-3">
                {topEvents.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
                {topEvents.map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{eventLabels[eventType] || eventType}</span>
                    <span className="text-sm font-bold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-5">
              <h2 className="text-lg font-bold text-foreground">Insights</h2>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-foreground">
                  Study Sessions: <span className="font-bold">{insights?.studySessions || 0}</span>
                </p>
                <p className="text-foreground">
                  Completed Tasks: <span className="font-bold">{insights?.completedTasks || 0}</span>
                </p>
                <p className="text-foreground">
                  Total Study Time: <span className="font-bold">{insights?.totalStudyTime || 0} min</span>
                </p>
                <p className="text-foreground">
                  Peak Study Hour: <span className="font-bold">{insights?.peakStudyHour || "N/A"}</span>
                </p>
                <p className="text-foreground">
                  Weekly Consistency: <span className="font-bold">{insights?.weeklyConsistency || 0}%</span>
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card/80 p-5">
            <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
            <div className="mt-4 divide-y divide-border">
              {timeline.length === 0 && <p className="text-sm text-muted-foreground">No timeline events yet.</p>}
              {timeline.map((event) => (
                <div key={event._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-foreground">{eventLabels[event.eventType] || event.eventType}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
