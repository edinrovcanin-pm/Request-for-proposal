/*
  Product Request Pipeline Dashboard
  
  This artifact is displayed when the user triggers the skill with commands like
  "check new requests", "status report", or "show pipeline".
  
  It uses the Anthropic API with Notion MCP to fetch live data from the
  Product Requests database and display pipeline status.
  
  USAGE: When the skill is triggered, create this artifact and it will
  auto-fetch data from Notion on load.
*/

import { useState, useEffect, useCallback } from "react";

const BRAND = {
  navy: "#0C1E2B", slate: "#1E3A4F",
  teal: "#1A7A6D", tealLight: "#E0F5F1",
  amber: "#D4853B", amberLight: "#FFF3E6",
  bg: "#F6F5F0", card: "#FFFFFF",
  text: "#1C2B36", muted: "#5A6B78",
  border: "#D8D5CE",
  error: "#C0392B", errorBg: "#FDEDEB",
  success: "#1A7A6D", successBg: "#E0F5F1",
};

const STATUS_CONFIG = {
  "New": { emoji: "🔘", color: "#6B7280", bg: "#F3F4F6" },
  "Under Review": { emoji: "🔍", color: "#D97706", bg: "#FEF3C7" },
  "Spec Generated": { emoji: "📄", color: "#2563EB", bg: "#DBEAFE" },
  "Spec Approved": { emoji: "✅", color: "#059669", bg: "#D1FAE5" },
  "In Development": { emoji: "🔧", color: "#7C3AED", bg: "#EDE9FE" },
  "In QA": { emoji: "🧪", color: "#EA580C", bg: "#FED7AA" },
  "Done": { emoji: "🚀", color: "#059669", bg: "#D1FAE5" },
  "Declined": { emoji: "❌", color: "#DC2626", bg: "#FEE2E2" },
};

const NOTION_MCP = { type: "url", url: "https://mcp.notion.com/mcp", name: "notion" };
const DB_ID = "8c2ff541-efb0-40db-8447-0f29366f7c76";

async function fetchRequests() {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Query the Notion data source collection://${DB_ID}. Return ALL pages as a JSON array with these fields for each: title, status, requestType, priority, url, requestId, dateSubmitted, affectedArea, problemDescription (first sentence only). Return ONLY the JSON array, no other text.`
        }],
        mcp_servers: [NOTION_MCP],
      }),
    });
    const data = await res.json();
    const text = (data.content || [])
      .map(c => c.type === "text" ? c.text : c.type === "mcp_tool_result" ? (c.content?.[0]?.text || "") : "")
      .join("\n");
    const match = text.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["New"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 12,
      fontSize: 11, fontWeight: 600,
      color: cfg.color, backgroundColor: cfg.bg,
    }}>
      {cfg.emoji} {status}
    </span>
  );
}

function PriorityDot({ priority }) {
  const colors = { Critical: "#DC2626", High: "#EA580C", Medium: "#D97706", Low: "#6B7280" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: colors[priority] || BRAND.muted,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: colors[priority] || BRAND.muted }} />
      {priority}
    </span>
  );
}

function StatCard({ label, value, emoji, color }) {
  return (
    <div style={{
      background: BRAND.card, borderRadius: 10, padding: "16px 18px",
      border: `1px solid ${BRAND.border}`, flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4 }}>{emoji} {label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || BRAND.text, fontFamily: "'Fraunces', serif" }}>{value}</div>
    </div>
  );
}

export default function PipelineDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const data = await fetchRequests();
    if (data.length === 0) {
      setError("Could not load requests. Make sure Notion MCP is connected.");
    }
    setRequests(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {};
  requests.forEach(r => {
    const s = r.status || "Unknown";
    counts[s] = (counts[s] || 0) + 1;
  });

  const newCount = counts["New"] || 0;
  const activeCount = (counts["Under Review"] || 0) + (counts["Spec Generated"] || 0) + (counts["Spec Approved"] || 0) + (counts["In Development"] || 0) + (counts["In QA"] || 0);
  const doneCount = counts["Done"] || 0;

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.slate} 100%)`, padding: "24px 24px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40%", right: "-10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(26,122,109,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: BRAND.amber, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "white" }}>F</div>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "white" }}>Product Request Pipeline</span>
            </div>
            <button onClick={load} disabled={loading}
              style={{ padding: "6px 16px", borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 24px 64px" }}>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 8, background: BRAND.errorBg, color: BRAND.error, fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <StatCard label="New Requests" value={newCount} emoji="🔘" color={newCount > 0 ? BRAND.amber : BRAND.muted} />
          <StatCard label="In Progress" value={activeCount} emoji="⚡" color={BRAND.teal} />
          <StatCard label="Completed" value={doneCount} emoji="🚀" color={BRAND.success} />
          <StatCard label="Total" value={requests.length} emoji="📊" />
        </div>

        {/* New requests alert */}
        {newCount > 0 && (
          <div style={{
            background: BRAND.amberLight, border: `1px solid ${BRAND.amber}33`,
            borderRadius: 10, padding: "14px 18px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>👉</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#7D4F15" }}>{newCount} new request{newCount > 1 ? "s" : ""} waiting for review</div>
              <div style={{ fontSize: 12, color: "#9A6320" }}>Tell Claude: <strong>"Check new requests"</strong> to start the review process</div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", "New", "Under Review", "Spec Generated", "In Development", "In QA", "Done", "Declined"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "5px 14px", borderRadius: 16, fontSize: 12, fontWeight: filter === f ? 600 : 400,
                border: `1px solid ${filter === f ? BRAND.teal : BRAND.border}`,
                background: filter === f ? BRAND.tealLight : "white",
                color: filter === f ? BRAND.teal : BRAND.muted,
                cursor: "pointer", fontFamily: "inherit",
              }}>
              {f === "all" ? `All (${requests.length})` : `${f} (${counts[f] || 0})`}
            </button>
          ))}
        </div>

        {/* Request list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: BRAND.muted }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${BRAND.tealLight}`, borderTopColor: BRAND.teal, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <div style={{ fontSize: 13 }}>Loading from Notion...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: BRAND.muted, fontSize: 13 }}>
              No requests {filter !== "all" ? `with status "${filter}"` : "found"}.
            </div>
          ) : filtered.map((r, i) => (
            <div key={i} style={{
              background: BRAND.card, borderRadius: 10, padding: "14px 18px",
              border: `1px solid ${BRAND.border}`, transition: "box-shadow 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.navy, flex: 1 }}>{r.title || r["Request Title"] || "Untitled"}</div>
                <StatusBadge status={r.status || "Unknown"} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {r.requestId && <span style={{ fontSize: 11, color: BRAND.muted, fontWeight: 600 }}>REQ-{r.requestId}</span>}
                {r.requestType && <span style={{ fontSize: 11, color: BRAND.muted }}>{r.requestType}</span>}
                {r.priority && <PriorityDot priority={r.priority} />}
                {r.affectedArea && <span style={{ fontSize: 11, color: BRAND.muted }}>{r.affectedArea}</span>}
              </div>
              {r.problemDescription && (
                <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 6, lineHeight: 1.5 }}>
                  {(r.problemDescription || "").substring(0, 150)}{(r.problemDescription || "").length > 150 ? "..." : ""}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 24, padding: "14px 18px", background: BRAND.card, borderRadius: 10, border: `1px solid ${BRAND.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.navy, marginBottom: 8 }}>Available Commands</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12, color: BRAND.muted }}>
            <div><strong style={{ color: BRAND.text }}>"Check new requests"</strong> — review & process</div>
            <div><strong style={{ color: BRAND.text }}>"Sync statuses"</strong> — update from Linear</div>
            <div><strong style={{ color: BRAND.text }}>"Generate spec for [title]"</strong> — create domain spec</div>
            <div><strong style={{ color: BRAND.text }}>"Create tickets for [title]"</strong> — Linear tickets</div>
            <div><strong style={{ color: BRAND.text }}>"Status report"</strong> — full overview</div>
            <div><strong style={{ color: BRAND.text }}>"Decline [title]"</strong> — reject with reason</div>
          </div>
        </div>
      </div>
    </div>
  );
}
