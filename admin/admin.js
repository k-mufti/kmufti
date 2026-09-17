/* The dashboard. It asks the backend for one snapshot and draws all of it;
   there is no state here worth keeping between polls.

   Everything that came out of the access log - paths, referrers, journal
   lines - is other people's text, so it goes through esc() on the way in.
   That is the only security-ish thing on this page and it matters more here
   than anywhere else on the site, because this is the page that reads input
   nobody vetted. */

const REFRESH_MS = 15000;
const $ = (id) => document.getElementById(id);

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const n = (v) => (v == null ? "—" : Number(v).toLocaleString());
const pct = (v) => (v == null ? "—" : v >= 99.995 ? "100%" : v.toFixed(2) + "%");

function ago(ms) {
  if (!ms) return "—";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.round(s / 60) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
}
function dur(ms) {
  const s = Math.round(ms / 1000);
  if (s < 90) return s + "s";
  if (s < 5400) return Math.round(s / 60) + "m";
  if (s < 172800) return (s / 3600).toFixed(1) + "h";
  return Math.round(s / 86400) + "d";
}
function bytes(b) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return (b / Math.pow(1024, i)).toFixed(i ? 1 : 0) + " " + u[i];
}
const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// "2026-09-16" is a calendar day, not an instant. new Date() would read it as
// UTC midnight, which in Chicago renders as the day before - so build it as a
// local date instead and the labels line up with the buckets.
const dayLabel = (str) => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { month: "short", day: "numeric" });
};

/* ---------- the bars strip: one box an hour, three days of them ---------- */
function barsHtml(bars) {
  const cells = bars.map((b) => {
    const total = b.ok + b.fail;
    const cls = !total ? "none" : b.fail && b.ok ? "part" : b.fail ? "bad" : "";
    const when = new Date(b.at).toLocaleString([], { weekday: "short", hour: "2-digit" });
    const what = !total ? "not watching" : b.fail ? `${b.fail} miss${b.fail > 1 ? "es" : ""} of ${total}` : `all ${total} ok · ${b.ms}ms`;
    return `<i class="${cls}" title="${esc(when)} — ${esc(what)}"></i>`;
  }).join("");
  return `<div class="bars">${cells}</div>
    <div class="bars-legend"><span>72h ago</span><span>now</span></div>`;
}

/* ---------- a list of label + meter + number ---------- */
function rows(items, fmt = n) {
  if (!items.length) return `<p class="empty">Nothing yet.</p>`;
  const max = Math.max(...items.map((i) => i.v)) || 1;
  return items.map((i) => `
    <div class="row">
      <span class="label" title="${esc(i.k)}">${esc(i.k)}</span>
      <span class="meter"><span style="width:${(i.v / max * 100).toFixed(1)}%"></span></span>
      <span class="val">${fmt(i.v)}</span>
    </div>`).join("");
}

/* ======================================================================
   Render
   ====================================================================== */
function render(s) {
  const badServices = s.services.filter((x) => !x.up);
  const frontBad = !s.front.up;

  /* --- the one line that matters --- */
  const banner = $("banner");
  if (frontBad || badServices.length) {
    const bits = [];
    if (frontBad) bits.push(`the front door (${esc(s.front.error || s.front.status || "no answer")})`);
    for (const x of badServices) {
      bits.push(`${esc(x.name)}${x.down ? " · down " + dur(Date.now() - x.down.from) : ""}`);
    }
    banner.className = "banner banner-bad";
    banner.innerHTML = `Down: ${bits.join(" · ")}`;
  } else {
    banner.className = "banner banner-ok";
    banner.textContent = `Everything is up — front door answered in ${s.front.ms}ms`;
  }
  $("polled").textContent = "polled " + ago(s.polledAt);

  /* --- the numbers across the top --- */
  const t = s.traffic;
  const hubOpens = s.services.find((x) => x.id === "puzzle")?.data?.visits;
  $("numbers").innerHTML = [
    { v: `<em>${n(t.live.visitors)}</em>`, l: "here in the last 5 min" },
    { v: `<em>${n(t.today.fresh)}</em>`, l: "new today",
      title: "people who had never been to the site before today — the number that tells you whether anyone new is finding it" },
    { v: n(t.today.uniq), l: "visitors today",
      title: `${t.today.addresses} addresses touched the site today; ${t.today.uniq} of them behaved like a browser (fetched a page's assets, or read a second page). The rest asked for one page and left - that is a scanner, whatever its user-agent claims.` },
    { v: n(t.today.views), l: "page views today" },
    { v: n(t.window.people), l: "visitors, 30 days", title: "the daily counts added up — someone who came twice on two days counts twice" },
    { v: `<em>${n(t.allTime.visitors)}</em>`, l: "unique viewers, all time",
      title: t.allTime.since
        ? `distinct people since ${new Date(t.allTime.since).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })} — as far back as the logs went when this started watching; ${t.allTime.fresh30} of them arrived for the first time in the last 30 days. This is the one number kept with a permanent salt rather than a nightly one, because counting somebody once across months is impossible otherwise.`
        : "nobody counted yet" },
    { v: n(hubOpens), l: "hub opens, all time", title: "page loads of the hub, not people — your existing counter" },
    { v: n(t.today.bots), l: "crawler hits today" },
  ].map((x) => `<div class="num"${x.title ? ` title="${esc(x.title)}"` : ""}><b>${x.v}</b><span>${x.l}</span></div>`).join("");

  /* --- front door --- */
  const cert = s.front.cert;
  const certPill = !cert ? "" :
    `<span class="pill ${cert.days < 7 ? "bad" : cert.days < 21 ? "warn" : ""}">cert ${cert.days}d left</span>`;
  $("front").innerHTML = `
    <div class="svc ${s.front.up ? "" : "is-down"}">
      <div class="svc-head">
        <span class="dot ${s.front.up ? "up" : "down"}"></span>
        <b>${esc(s.front.url)}</b>
        <span class="port">${s.front.up ? s.front.status : esc(s.front.error || "no answer")}</span>
      </div>
      <div class="svc-stat">
        <span class="k">round trip</span> ${s.front.ms}ms &nbsp;
        <span class="k">24h</span> ${pct(s.front.uptime.d1)} &nbsp;
        <span class="k">7d</span> ${pct(s.front.uptime.d7)} &nbsp;
        <span class="k">30d</span> ${pct(s.front.uptime.d30)} &nbsp; ${certPill}
      </div>
      ${barsHtml(s.front.bars)}
    </div>`;

  /* --- one card per backend --- */
  $("services").innerHTML = s.services.map((x) => {
    const d = x.data || {};
    const own = [];
    if (x.id === "yahtzee") own.push(`<span class="k">peers</span> ${n(d.peers)} <span class="k">rooms</span> ${n(d.rooms)} <span class="k">queued</span> ${n(d.queued)}`);
    if (x.id === "chameleon") own.push(`<span class="k">photo pool</span> ${n(d.pool)}/${n(d.cap)}${d.key === false ? ' <span class="pill warn">no API key</span>' : ""}${d.backingOff ? ' <span class="pill warn">backing off</span>' : ""}`);
    if (x.id === "puzzle") own.push(`<span class="k">hub opens</span> ${n(d.visits)}`);
    const sd = x.systemd;
    if (sd) {
      own.push(`<span class="k">systemd</span> ${esc(sd.state)}/${esc(sd.sub)}` +
        (sd.since ? ` <span class="k">since</span> ${ago(sd.since)}` : "") +
        (sd.restarts ? ` <span class="pill ${sd.restarts > 5 ? "warn" : ""}">${sd.restarts} restarts</span>` : "") +
        (sd.mem ? ` <span class="k">rss</span> ${bytes(sd.mem)}` : ""));
    }
    return `
      <div class="svc ${x.up ? "" : "is-down"}">
        <div class="svc-head">
          <span class="dot ${x.up ? "up" : "down"}"></span>
          <b>${esc(x.name)}</b>
          <span class="port">:${x.port}</span>
        </div>
        <div class="svc-stat">
          <span class="k">${x.up ? "replied in" : "failed after"}</span> ${x.ms}ms
          ${x.up ? "" : `<span class="pill bad">${esc(x.error || x.status)}</span>`}
          ${x.down ? `<span class="pill bad">down ${dur(Date.now() - x.down.from)}</span>` : ""}
          <br />
          <span class="k">24h</span> ${pct(x.uptime.d1)} &nbsp;
          <span class="k">7d</span> ${pct(x.uptime.d7)} &nbsp;
          <span class="k">30d</span> ${pct(x.uptime.d30)}
          ${own.length ? "<br />" + own.join("<br />") : ""}
        </div>
        ${barsHtml(x.bars)}
        <div class="svc-actions">
          <button class="ghost" data-journal="${esc(x.unit)}">log</button>
          <a class="ghost" href="${esc(x.href)}" target="_blank" rel="noopener">open</a>
          ${s.flags.restart ? `<button class="ghost" data-restart="${esc(x.unit)}">restart</button>` : ""}
        </div>
      </div>`;
  }).join("");

  /* --- 30 days of visitors --- */
  if (!s.flags.log) {
    $("chart").innerHTML = `<p class="empty">No access log at <code>${esc(s.flags.logPath)}</code> — nothing to count.
      On the box this needs the service to be in the <code>adm</code> group; on a laptop it is simply not there.</p>`;
    $("today-hours").innerHTML = "";
  } else {
    const max = Math.max(1, ...t.series.map((d) => d.views));
    $("chart").innerHTML = `
      <div class="chart">${t.series.map((d) => {
        const h = (d.views / max) * 100, u = Math.min(h, (d.uniq / max) * 100);
        const label = `${dayLabel(d.day)} — ${d.views} views, ${d.uniq} visitors (${d.fresh} of them new), ${d.bots} crawler hits`;
        return `<div class="col" title="${esc(label)}">
          <div class="v" style="height:${(h - u).toFixed(1)}%"></div>
          <div class="u" style="height:${u.toFixed(1)}%"></div></div>`;
      }).join("")}</div>
      <div class="axis"><span>${esc(dayLabel(t.series[0].day))}</span><span>today</span></div>
      <div class="chart-key">
        <span><i style="background:var(--up)"></i>visitors</span>
        <span><i style="background:var(--ink);opacity:.78"></i>page views on top</span>
        <span>${n(t.window.views)} views · ${n(t.window.people)} visitors · ${n(t.allTime.fresh30)} of them here for the first time · ${bytes(t.window.bytes)} served in 30 days</span>
      </div>`;

    const hmax = Math.max(1, ...t.today.hours);
    $("today-hours").innerHTML = `
      <div class="chart hours" style="height:54px;margin-top:16px">
        ${t.today.hours.map((v, i) => `<div class="col" title="${String(i).padStart(2, "0")}:00 — ${v} hits">
          <div class="v" style="height:${(v / hmax * 100).toFixed(1)}%"></div></div>`).join("")}
      </div>
      <div class="axis"><span>midnight, ${esc((s.flags.tz || "").split("/").pop().replace(/_/g, " "))}</span><span>${n(t.today.hits)} hits · ${n(t.today.api)} API calls</span><span>23:00</span></div>`;
  }

  $("pages").innerHTML = rows(t.top.pages) + (s.flags.hosted ? "" :
    `<p class="users-foot">No hostnames in the log yet, so all of this is counted as kmufti.com —
     including anyone who was really on karimmufti.com or kareemmuftee.com. Add the
     <code>log_format</code> line from DEPLOY.md and the split starts from that moment.</p>`);
  $("refs").innerHTML = t.top.refs.length ? rows(t.top.refs)
    : `<p class="empty">Nobody arrived from another site — all direct, or the referrer was stripped.</p>`;
  $("agents").innerHTML = rows(t.top.agents) + `<div style="height:10px"></div>` + rows(t.top.os);
  $("errors").innerHTML = t.top.errors.length ? rows(t.top.errors)
    : `<p class="empty">No 4xx or 5xx in 30 days.</p>`;

  /* --- today's people, one row each --- */
  const users = t.users || [];
  $("users").innerHTML = users.length ? `
    <div class="users">${users.map((u) => `
      <div class="user">
        <span class="uid">${esc(u.who)}</span>
        <span class="uwhen">${clock(u.first)}${u.last - u.first > 60000 ? " → " + clock(u.last) : ""}</span>
        <span class="uviews">${u.views} view${u.views === 1 ? "" : "s"}</span>
        <span class="upages" title="${esc(u.pages.join(", "))}">${u.pages.map(esc).join(", ")}</span>
        <span class="uua">${esc(u.browser)} · ${esc(u.os)}</span>
        ${u.fresh ? '<span class="tag-new" title="first time ever on the site">new</span>' : '<span class="tag-old">seen before</span>'}
      </div>`).join("")}</div>
    <p class="users-foot">${users.length} ${users.length === 1 ? "person" : "people"} today${
      t.today.addresses > users.length
        ? ` · ${t.today.addresses - users.length} other address${t.today.addresses - users.length === 1 ? " was" : "es were"} dropped as scanners — one page, no assets, never came back`
        : ""}</p>`
    : `<p class="empty">Nobody today yet — or nobody who behaved like a browser.</p>`;

  /* --- the live feed --- */
  $("recent").innerHTML = t.live.recent.length ? `<div class="feed">${t.live.recent.map((r) => `
    <div><span class="t">${clock(r.at)}</span><span class="who">${esc(r.who)}</span>
    <span class="p ${r.status >= 400 ? "bad" : ""}" title="${esc(r.path)}">${esc(r.page)}</span>
    <span class="t">${esc(r.browser)} · ${esc(r.os)}</span>
    ${r.fresh ? '<span class="tag-new" title="never seen before today">new</span>' : ""}</div>`).join("")}</div>`
    : `<p class="empty">Nothing since this service started.</p>`;

  /* --- the box --- */
  const h = s.host;
  const loadPct = (h.load[0] / h.cores * 100).toFixed(0);
  const memUsed = h.mem.total - h.mem.available;
  $("host").innerHTML = `
    <dl class="kv">
      <dt>load</dt><dd>${h.load.map((l) => l.toFixed(2)).join("  ")} <span class="pill ${loadPct > 90 ? "bad" : loadPct > 65 ? "warn" : ""}">${loadPct}% of ${h.cores} core${h.cores > 1 ? "s" : ""}</span></dd>
      <dt>memory</dt><dd>${bytes(memUsed)} of ${bytes(h.mem.total)} <span class="pill ${memUsed / h.mem.total > 0.9 ? "warn" : ""}">${(memUsed / h.mem.total * 100).toFixed(0)}%</span></dd>
      ${h.disk ? `<dt>disk</dt><dd>${bytes(h.disk.usedKb * 1024)} of ${bytes(h.disk.totalKb * 1024)} <span class="pill ${h.disk.pct > 90 ? "bad" : h.disk.pct > 75 ? "warn" : ""}">${h.disk.pct}%</span></dd>` : ""}
      <dt>up</dt><dd>${dur(h.uptime * 1000)} <span class="pill">${esc(h.hostname)}</span> <span class="pill">node ${esc(h.node)}</span></dd>
      ${h.state.length ? `<dt>state</dt><dd>${h.state.map((x) => `${esc(x.dir)} ${bytes(x.kb * 1024)}`).join("  ·  ")}</dd>` : ""}
      ${s.git ? `<dt>deployed</dt><dd>${esc(s.git.hash)} · ${ago(s.git.at)}${s.git.dirty ? ' <span class="pill warn">working tree dirty</span>' : ""}<br /><span style="color:var(--ink-faint)">${esc(s.git.subject)}</span></dd>` : ""}
      <dt>watcher</dt><dd>up ${dur(h.adminUptime * 1000)}${s.flags.systemd ? "" : ' <span class="pill warn">no systemd here</span>'}</dd>
    </dl>`;

  /* --- incidents --- */
  $("incidents").innerHTML = s.incidents.length ? s.incidents.map((i) => `
    <div class="row">
      <span class="label"><b>${esc(i.name)}</b> ${i.to ? "was down" : "is down"}</span>
      <span class="val">${new Date(i.from).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
      <span class="val ${i.to ? "" : "pill bad"}">${dur((i.to || Date.now()) - i.from)}</span>
    </div>`).join("")
    : `<p class="empty">Nothing has missed a check since this started watching.</p>`;
}

/* ======================================================================
   Wiring
   ====================================================================== */
async function tick() {
  try {
    const res = await fetch("api/snapshot", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    render(await res.json());
  } catch (e) {
    // nginx answered (you are reading this) but the watcher did not, which is
    // itself a finding: the admin service is the thing that is down.
    const banner = $("banner");
    banner.className = "banner banner-bad";
    banner.textContent = "Can't reach the ops backend — kmufti-admin is probably down. " + e.message;
    $("polled").textContent = "stale";
  }
}

document.addEventListener("click", async (e) => {
  const unit = e.target.dataset?.journal;
  const restart = e.target.dataset?.restart;
  if (unit) {
    $("sheet-title").textContent = unit;
    $("sheet-body").textContent = "reading…";
    $("sheet").hidden = false;
    const r = await fetch("api/journal?unit=" + encodeURIComponent(unit)).then((x) => x.json()).catch(() => null);
    $("sheet-body").textContent = !r ? "could not read the journal"
      : r.error ? r.error : (r.lines.join("\n") || "(the journal is empty for this unit)");
  }
  if (restart) {
    if (!confirm(`Restart ${restart}? Anyone mid-game on it gets dropped.`)) return;
    e.target.textContent = "…";
    const r = await fetch("api/restart", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unit: restart }) }).then((x) => x.json()).catch(() => ({ error: "failed" }));
    if (r.error) alert(r.error);
    setTimeout(tick, 1500);
  }
});
$("sheet-close").onclick = () => { $("sheet").hidden = true; };
$("sheet").onclick = (e) => { if (e.target === $("sheet")) $("sheet").hidden = true; };
$("refresh").onclick = tick;
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("sheet").hidden = true; });

// Polling pauses with the tab: a backgrounded dashboard is just noise in the
// access log, and it catches up the moment you look at it again.
let timer = setInterval(tick, REFRESH_MS);
document.addEventListener("visibilitychange", () => {
  clearInterval(timer);
  if (!document.hidden) { tick(); timer = setInterval(tick, REFRESH_MS); }
});
tick();
