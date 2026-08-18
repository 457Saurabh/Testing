(function () {
      "use strict";

      var STORAGE_KEY = "streak_app_v1";
      var PREF_KEY = "streak_app_prefs_v1";
      var NOTES_KEY = "streak_notes_v2";

      // Schema versions for each localStorage payload. Bump these — and add a
      // migration step in the corresponding migrateXState() function below —
      // whenever the shape of stored data changes, so existing users' data
      // upgrades in place instead of breaking or silently resetting.
      var STATE_SCHEMA_VERSION = 1;
      var PREFS_SCHEMA_VERSION = 1;
      var NOTES_SCHEMA_VERSION = 1;

      var PALETTE = ["#E8A33D", "#6FA287", "#D9684A", "#5C8AA6", "#B07FC7", "#C9A227", "#4FB3A6", "#E38B8B", "#6C7FD1", "#8FAE7D"];
      var COLOR_NAMES = { "#E8A33D": "Amber", "#6FA287": "Moss", "#D9684A": "Rust", "#5C8AA6": "Dusk Blue", "#B07FC7": "Plum", "#C9A227": "Mustard", "#4FB3A6": "Teal", "#E38B8B": "Coral", "#6C7FD1": "Indigo", "#8FAE7D": "Sage" };

      // Shared pencil glyph (habit-card edit button + the floating note shortcut)
      // so every "edit" affordance in the app uses the exact same icon, in the
      // same diagonal orientation, instead of relying on the OS emoji font.
      var PENCIL_SVG = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<g transform="rotate(-45 12 12)" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">' +
        '<rect x="5" y="9.3" width="12" height="5.4" rx="1.3"/>' +
        '<line x1="14.6" y1="9.3" x2="14.6" y2="14.7"/>' +
        '<line x1="7.4" y1="9.3" x2="7.4" y2="14.7"/>' +
        '<path d="M5 9.3 L2.2 12 L5 14.7 Z"/>' +
        '</g></svg>';

      var MILESTONES = [
        { days: 3, label: "Spark", subtitle: "Three days in — momentum is on your side now." },
        { days: 7, label: "Week Streak", subtitle: "A full week. This isn't a task anymore, it's a rhythm." },
        { days: 14, label: "Fortnight", subtitle: "Two weeks of showing up. It's starting to shape who you are." },
        { days: 30, label: "Monthly Milestone", subtitle: "Thirty days. You've proven this is who you are, not just what you do." },
        { days: 50, label: "Half Century", subtitle: "Fifty days deep. Most people quit long before this point." },
        { days: 100, label: "Centurion", subtitle: "Triple digits. This is a standard now, not a streak." },
        { days: 200, label: "Iron Will", subtitle: "200 days of consistency. That's mastery-level discipline." },
        { days: 365, label: "Full Year", subtitle: "A full year, unbroken. You built something most people only talk about." }
      ];

      var QUOTES = [
        "Small actions repeated daily outweigh big actions taken rarely.",
        "Every checkmark is a vote for the person you're becoming.",
        "Discipline is just remembering what you want.",
        "The streak doesn't make you consistent — being consistent makes the streak.",
        "Motivation starts it. Identity sustains it.",
        "You're not chasing a number. You're building a pattern.",
        "One day doesn't define you. Fourteen days start to.",
        "The chain grows one link at a time — so do you.",
        "Progress hides in the days that feel unremarkable.",
        "Consistency compounds quietly, then all at once.",
        "Showing up on the hard days is what the streak actually measures.",
        "You don't need more motivation. You need one more day."
      ];

      var SUGGESTED_HABITS = ["Study", "Diet", "Exercise", "Read", "Sleep on time", "Meditate"];

      // Fixed set so failure reasons can be tallied into patterns later
      // (e.g. "you miss this mostly because you're tired"), rather than
      // free text that can't be aggregated.
      var FAILURE_REASONS = [
        { key: "tired", label: "Tired" },
        { key: "forgot", label: "Forgot" },
        { key: "no_time", label: "No time" },
        { key: "too_hard", label: "Too hard today" },
        { key: "not_motivated", label: "Not feeling it" },
        { key: "other", label: "Other" }
      ];
      var FAILURE_REASON_KEYS = FAILURE_REASONS.map(function (r) { return r.key; });
      function failureReasonLabel(key) {
        var r = FAILURE_REASONS.find(function (x) { return x.key === key; });
        return r ? r.label : key;
      }

      // ---------- date + streak-math helpers ----------
      // Delegated to streak-core.js (loaded above) so this logic is unit-tested
      // in isolation; see streak-core.test.js. Signatures are unchanged from the
      // previous inline versions — every call site below still works as-is.
      var pad = StreakCore.pad;
      var todayStr = StreakCore.todayStr;
      var dateFromStr = StreakCore.dateFromStr;
      var strFromDate = StreakCore.strFromDate;
      var daysAgoStr = StreakCore.daysAgoStr;
      var addDays = StreakCore.addDays;
      var dayDiff = StreakCore.dayDiff;
      var dayOfYear = StreakCore.dayOfYear;
      var mondayOf = StreakCore.mondayOf;
      var nowTimeStr = StreakCore.nowTimeStr;
      var isValidDateStr = StreakCore.isValidDateStr;

      // ---------- storage ----------
      function cryptoId() { return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8); }

      var HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
      var SAFE_ID_RE = /^[A-Za-z0-9_\-]{1,64}$/;

      // Strips control characters and caps length. Used for the display name —
      // typed by the user themselves, but still worth keeping bounded and clean
      // since it's stored and re-rendered on every visit.
      function sanitizeName(raw) {
        if (typeof raw !== "string") return "";
        return raw.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 40);
      }

      // Every value here can come from a source we don't fully trust — a hand-edited
      // localStorage entry, or (more importantly) a JSON backup file / sync code the
      // user imports from someone else. Several of these fields end up concatenated
      // into innerHTML strings during render (colors in style attributes, ids in data-
      // attributes, createdAt as text), so we validate and coerce everything here, at
      // the single boundary all stored/imported/synced data passes through, rather
      // than re-checking at every render call site.
      function normalizeState(s) {
        if (!s || !Array.isArray(s.habits)) s = { habits: [] };
        s.habits.forEach(function (h, i) {
          if (typeof h.id !== "string" || !SAFE_ID_RE.test(h.id)) h.id = cryptoId();
          if (typeof h.name !== "string" || !h.name.trim()) h.name = "Untitled habit";
          h.name = h.name.slice(0, 120);
          if (typeof h.description !== "string") h.description = "";
          h.description = h.description.slice(0, 300);
          if (typeof h.minimum !== "string") h.minimum = "";
          h.minimum = h.minimum.trim().slice(0, 60);
          if (typeof h.implementationIntention !== "string") h.implementationIntention = "";
          h.implementationIntention = h.implementationIntention.trim().slice(0, 140);
          if (typeof h.identity !== "string") h.identity = "";
          h.identity = h.identity.trim().slice(0, 140);
          if (typeof h.color !== "string" || !HEX_COLOR_RE.test(h.color)) h.color = PALETTE[i % PALETTE.length];
          if (typeof h.createdAt !== "string" || !isValidDateStr(h.createdAt)) h.createdAt = todayStr();
          if (!h.frequency || (h.frequency.type !== "daily" && h.frequency.type !== "weekly")) {
            h.frequency = { type: "daily" };
          }
          if (h.frequency.type === "weekly") {
            var t = parseInt(h.frequency.target, 10);
            h.frequency.target = (t >= 1 && t <= 14) ? t : 3;
          }
          if (!Array.isArray(h.history)) h.history = [];
          // Keep only well-formed, de-duplicated date strings.
          var seen = {};
          h.history = h.history.filter(function (d) {
            if (!isValidDateStr(d) || seen[d]) return false;
            seen[d] = true; return true;
          });
          if (!Array.isArray(h.failureLog)) h.failureLog = [];
          // One reason per date (most recent write wins), valid date + known reason key only.
          var byDate = {};
          h.failureLog.forEach(function (entry) {
            if (!entry || !isValidDateStr(entry.date)) return;
            if (FAILURE_REASON_KEYS.indexOf(entry.reason) === -1) return;
            byDate[entry.date] = entry.reason;
          });
          h.failureLog = Object.keys(byDate).sort().slice(-730).map(function (d) {
            return { date: d, reason: byDate[d] };
          });
          // Time-of-day for check-ins (used for the "best time" insight). Only
          // ever set for real-time check-ins on today's date, never backfills —
          // see toggleHabitDay(). Keyed by date so we can validate against history.
          if (!h.checkinTimes || typeof h.checkinTimes !== "object") h.checkinTimes = {};
          var histSet = {};
          h.history.forEach(function (d) { histSet[d] = true; });
          var cleanTimes = {};
          Object.keys(h.checkinTimes).forEach(function (d) {
            var v = h.checkinTimes[d];
            if (isValidDateStr(d) && histSet[d] && typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)) {
              cleanTimes[d] = v;
            }
          });
          h.checkinTimes = cleanTimes;
        });
        if (!Array.isArray(s.customMilestones)) s.customMilestones = [];
        s.customMilestones = s.customMilestones
          .map(function (n) { return parseInt(n, 10); })
          .filter(function (n) { return Number.isFinite(n) && n >= 1 && n <= 9999; })
          .filter(function (n, i, arr) { return arr.indexOf(n) === i; });
        return s;
      }

      // ---------- schema versioning + migrations ----------
      // Stored payloads are wrapped as { schemaVersion, data }. On load we read
      // whatever version is present (treating old un-wrapped data as version 0)
      // and run it through any migration steps needed to reach *_SCHEMA_VERSION,
      // then re-save in the new envelope. Add a new `if (version < N) { ... }`
      // block here whenever the shape of stored data changes.
      function migrateStateData(data, fromVersion) {
        // if (fromVersion < 2) { data = ... } // example future migration
        return data;
      }
      function unwrapVersioned(raw, currentVersion) {
        if (raw && typeof raw === "object" && !Array.isArray(raw) && typeof raw.schemaVersion === "number" && "data" in raw) {
          return { version: raw.schemaVersion, data: raw.data };
        }
        return { version: 0, data: raw }; // legacy, pre-versioning payload
      }
      function wrapVersioned(data, version) { return { schemaVersion: version, data: data }; }

      function load() {
        try {
          var raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) return normalizeState({ habits: [] });
          var unwrapped = unwrapVersioned(JSON.parse(raw), STATE_SCHEMA_VERSION);
          var migrated = migrateStateData(unwrapped.data, unwrapped.version);
          return normalizeState(migrated);
        } catch (e) { return normalizeState({ habits: [] }); }
      }
      function save(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wrapVersioned(state, STATE_SCHEMA_VERSION)));
      }

      function migratePrefsData(data, fromVersion) {
        // if (fromVersion < 2) { data = ... }
        return data;
      }
      function loadPrefs() {
        var fallback = { sound: true, onboarded: false, lastExportAt: null, name: "", lastFailureDismissedDate: null, theme: "dark" };
        try {
          var raw = localStorage.getItem(PREF_KEY);
          if (!raw) return fallback;
          var unwrapped = unwrapVersioned(JSON.parse(raw), PREFS_SCHEMA_VERSION);
          var p = migratePrefsData(unwrapped.data, unwrapped.version) || {};
          return {
            sound: p.sound !== false,
            onboarded: !!p.onboarded,
            lastExportAt: p.lastExportAt || null,
            name: sanitizeName(p.name),
            lastFailureDismissedDate: (typeof p.lastFailureDismissedDate === "string" && isValidDateStr(p.lastFailureDismissedDate)) ? p.lastFailureDismissedDate : null,
            theme: (p.theme === "light" || p.theme === "dark") ? p.theme : "dark"
          };
        } catch (e) { return fallback; }
      }
      function savePrefs(p) {
        localStorage.setItem(PREF_KEY, JSON.stringify(wrapVersioned(p, PREFS_SCHEMA_VERSION)));
      }

      function migrateNotes(raw) {
        var out = {};
        Object.keys(raw || {}).forEach(function (d) {
          if (!StreakCore.isValidDateStr(d)) return; // drop malformed date keys
          var v = raw[d];
          if (typeof v === "string") { out[d] = v ? [{ id: cryptoId(), time: "", text: v }] : []; }
          else if (Array.isArray(v)) { out[d] = v; }
        });
        return out;
      }
      function migrateNotesData(data, fromVersion) {
        // if (fromVersion < 2) { data = ... }
        return data;
      }
      function loadNotes() {
        try {
          var raw = localStorage.getItem(NOTES_KEY);
          if (raw) {
            var unwrapped = unwrapVersioned(JSON.parse(raw), NOTES_SCHEMA_VERSION);
            return migrateNotes(migrateNotesData(unwrapped.data, unwrapped.version));
          }
          // check legacy pre-versioning key
          var legacy = localStorage.getItem("streak_notes_v1");
          if (legacy) return migrateNotes(JSON.parse(legacy));
          return {};
        } catch (e) { return {}; }
      }
      function saveNotes(notes) {
        localStorage.setItem(NOTES_KEY, JSON.stringify(wrapVersioned(notes, NOTES_SCHEMA_VERSION)));
      }

      var state = load();
      var prefs = loadPrefs();
      var notes = loadNotes();
      var selectedAddColor = PALETTE[0];

      // Applied immediately on load (before first paint of the settings panel)
      // so switching pages/sessions never shows a flash of the wrong theme.
      function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "dark");
      }
      applyTheme(prefs.theme);

      function getMilestones() {
        var extra = (state.customMilestones || []).map(function (n) {
          return { days: n, label: "Day " + n, subtitle: "You hit a personal milestone you set for yourself — " + n + " days in.", custom: true };
        });
        return MILESTONES.concat(extra).sort(function (a, b) { return a.days - b.days; });
      }

      // ---------- streak math: daily + weekly-target ----------
      // Also delegated to streak-core.js — see streak-core.test.js for the
      // edge-case coverage (leap years, week/month/year boundaries, gaps,
      // duplicate/garbage history entries, grace-week behavior, etc).
      var computeStreak = StreakCore.computeStreak;
      var computeWeeklyStreak = StreakCore.computeWeeklyStreak;
      var getStats = StreakCore.getStats;

      // ---------- sound ----------
      var audioCtx = null;
      function ensureAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return audioCtx; }
      function playChime(kind) {
        if (!prefs.sound) return;
        var ctx = ensureAudio(); if (!ctx) return;
        var now = ctx.currentTime;
        var freqs = kind === "milestone" ? [523.25, 659.25, 783.99, 1046.5] : [660, 880];
        freqs.forEach(function (f, i) {
          var osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = f;
          var start = now + i * 0.06;
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.13, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(start); osc.stop(start + 0.55);
        });
      }

      // ---------- toast (supports optional undo action) ----------
      var toastEl = document.getElementById("toast");
      var toastTimer = null;
      function toast(msg, action, boldName) {
        toastEl.innerHTML = "";
        var span = document.createElement("span");
        // Bolds the user's name within the message via DOM nodes (never innerHTML),
        // so this stays safe regardless of what characters are in the name.
        if (boldName && msg.indexOf(boldName) > -1) {
          var idx = msg.indexOf(boldName);
          span.appendChild(document.createTextNode(msg.slice(0, idx)));
          var b = document.createElement("b");
          b.textContent = boldName;
          span.appendChild(b);
          span.appendChild(document.createTextNode(msg.slice(idx + boldName.length)));
        } else {
          span.textContent = msg;
        }
        toastEl.appendChild(span);
        if (action) {
          var btn = document.createElement("button");
          btn.className = "toast-undo";
          btn.textContent = action.label;
          btn.addEventListener("click", function () {
            action.onClick();
            toastEl.classList.remove("show");
          });
          toastEl.appendChild(btn);
        }
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, action ? 5000 : 2200);
      }

      // ---------- elements ----------
      var habitsEl = document.getElementById("habits");
      var summaryEl = document.getElementById("summary");
      var todayPill = document.getElementById("todayPill");
      var quoteBanner = document.getElementById("quoteBanner");
      var dashStatsEl = document.getElementById("dashStats");
      var heatmapEl = document.getElementById("heatmap");
      var badgeWallEl = document.getElementById("badgeWall");
      var prevRenderedCurrent = {};
      var justFilledDay = {}; // "habitId|date" -> true

      function fmtDateLong() { var d = new Date(); var opts = { weekday: 'long', month: 'long', day: 'numeric' }; return d.toLocaleDateString(undefined, opts); }
      function escapeHtml(s) { s = String(s == null ? "" : s); return s.replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

      // A quiet, single spot for the user's name: it replaces the static tagline
      // next to the wordmark once they've told us who they are. Deliberately not
      // repeated anywhere else in the day-to-day UI — see celebrateMilestone()
      // for the one other place it shows up, on bigger milestones only.
      var userNameHeadingEl = document.getElementById("userNameHeading");
      function renderGreeting() {
        // "Don't Break The Chain" stays fixed, right next to the STREAK title —
        // the personalized greeting lives on its own line below instead of
        // swapping the tagline out.
        if (prefs.name) {
          userNameHeadingEl.innerHTML = "good to see you, <b>" + escapeHtml(prefs.name) + "</b>";
          userNameHeadingEl.classList.add("show");
        } else {
          userNameHeadingEl.textContent = "";
          userNameHeadingEl.classList.remove("show");
        }
      }

      // ---------- failure-reason tracking ----------
      // Habits that had a day yesterday to miss (they existed by then), did in
      // fact miss it, and don't have a reason logged for that date yet.
      function habitsMissingYesterdayReason() {
        var y = daysAgoStr(1);
        return state.habits.filter(function (h) {
          if (h.createdAt > y) return false; // didn't exist yet yesterday
          if (h.history.indexOf(y) > -1) return false; // wasn't missed
          return !h.failureLog.some(function (e) { return e.date === y; });
        });
      }

      function commonFailureReason(h) {
        if (!h.failureLog || h.failureLog.length < 3) return null;
        var counts = {};
        h.failureLog.forEach(function (e) { counts[e.reason] = (counts[e.reason] || 0) + 1; });
        var best = null;
        Object.keys(counts).forEach(function (key) {
          if (!best || counts[key] > best.count) best = { key: key, count: counts[key] };
        });
        if (!best || best.count < 3) return null;
        return { key: best.key, label: failureReasonLabel(best.key), count: best.count };
      }

      function logFailureReason(habit, dateStr, reasonKey) {
        habit.failureLog = (habit.failureLog || []).filter(function (e) { return e.date !== dateStr; });
        habit.failureLog.push({ date: dateStr, reason: reasonKey });
        save(state);
      }

      // ---------- render ----------
      function render() {
        todayPill.textContent = fmtDateLong();
        quoteBanner.textContent = QUOTES[dayOfYear() % QUOTES.length];
        renderGreeting();
        habitsEl.innerHTML = "";

        if (state.habits.length === 0) {
          habitsEl.innerHTML = '<div class="empty">No habits yet. Add your first one below.</div>';
        }

        var totalActive = 0, totalDoneToday = 0;

        state.habits.forEach(function (h) {
          var stats = getStats(h);
          if (stats.current > 0) totalActive++;
          var doneToday = h.history.indexOf(todayStr()) > -1;
          if (doneToday) totalDoneToday++;

          var glow = Math.min(stats.current, 40) / 40;
          var card = document.createElement("div");
          card.className = "card";
          card.style.setProperty("--accent", h.color);
          card.style.boxShadow = "0 1px 0 rgba(0,0,0,.4), 0 8px 24px -12px rgba(0,0,0,.6), 0 0 " + (14 + glow * 26) + "px -6px color-mix(in srgb, " + h.color + " " + Math.round(20 + glow * 45) + "%, transparent)";

          var numChanged = prevRenderedCurrent[h.id] !== undefined && prevRenderedCurrent[h.id] !== stats.current;
          var freqTag = h.frequency.type === "weekly" ? (h.frequency.target + "x / week") : "daily";

          // Recovery mode: the streak broke (current is 0) but this habit has a
          // history — i.e. it's not brand new, it lapsed. Rather than only showing
          // a bare "0", offer a small, concrete way back in instead. An if-then
          // plan (implementation intention), when set, is literally designed for
          // this exact moment, so it takes priority over the generic minimum note.
          var inRecovery = stats.current === 0 && h.history.length > 0 && !doneToday;
          var recoveryNote = "";
          if (inRecovery) {
            if (h.implementationIntention) {
              recoveryNote = escapeHtml(h.implementationIntention);
            } else {
              recoveryNote = "One small action is enough today" + (prefs.name ? ", <b>" + escapeHtml(prefs.name) + "</b>" : "") + "." +
                (h.minimum ? " Try the minimum: " + escapeHtml(h.minimum) + "." : "");
            }
          }

          // Once there's enough logged data to say something meaningful (3+ tagged
          // misses), surface the most common reason quietly under the description —
          // a first taste of "why did I fail" pattern-spotting, ahead of the full
          // weekly-insights view.
          var insight = commonFailureReason(h);
          var insightLine = insight ? ('<div class="failure-insight">Most common reason you miss this: ' + escapeHtml(insight.label) + ' (' + insight.count + '&times;)</div>') : "";

          // Identity statement: a standing "who am I becoming" declaration, kept
          // visible whenever it's set (unlike the minimum/plan, which are mainly
          // useful in the recovery moment) since identity-based habit language
          // works as an ambient cue, not just a fallback.
          var identityLine = h.identity ? ('<div class="identity-line">"' + escapeHtml(h.identity) + '"</div>') : "";

          card.innerHTML =
            '<div class="card-top">' +
            '<div>' +
            '<div class="card-title-row"><button class="swatch-btn" data-action="editcolor" data-id="' + h.id + '" title="Change color"><span class="swatch"></span></button><span class="card-title">' + escapeHtml(h.name) + '</span></div>' +
            '<div class="card-meta">tracking since ' + h.createdAt + '</div>' +
            '</div>' +
            '<div class="card-actions">' +
            '<button class="icon-btn rename-btn" data-action="rename" data-id="' + h.id + '" title="Edit habit" aria-label="Edit habit">' + PENCIL_SVG + '</button>' +
            '<button class="icon-btn" data-action="delete" data-id="' + h.id + '" title="Delete habit">&#10005;</button>' +
            '</div>' +
            '</div>' +
            identityLine +
            (h.description ? '<div class="card-desc">' + escapeHtml(h.description) + '</div>' : '') +
            insightLine +
            '<div class="freq-tag">' + freqTag + '</div>' +
            (inRecovery ? '<div class="recovery-note">' + recoveryNote + '</div>' : '') +
            '<div class="streak-row">' +
            '<h2 class="streak-count' + (numChanged ? ' pop' : '') + (inRecovery ? ' recovery' : '') + '">' + stats.current + '<span class="unit">' + stats.unit + (stats.current === 1 ? '' : 's') + '</span></h2>' +
            '<div class="best-count">Best: <b>' + stats.longest + ' ' + stats.unit + (stats.longest === 1 ? '' : 's') + '</b></div>' +
            '<button class="checkin-btn ' + (doneToday ? 'done' : 'pulse') + '" data-action="checkin" data-id="' + h.id + '">' +
            (doneToday ? '&#10003; Done today' : (inRecovery && h.minimum ? 'Do the minimum' : 'Mark today done')) +
            '</button>' +
            '</div>' +
            '<div class="chain" data-id="' + h.id + '">' + buildChain(h) + '</div>' +
            '<div class="chain-hint">Click any day to backfill or correct it.</div>';

          habitsEl.appendChild(card);
          prevRenderedCurrent[h.id] = stats.current;
        });

        var snapLinks = habitsEl.querySelectorAll('.link.filled');
        snapLinks.forEach(function (el) {
          var chainDiv = el.closest(".chain");
          var hid = chainDiv ? chainDiv.getAttribute("data-id") : null;
          var ds = el.getAttribute("data-date");
          if (hid && ds && justFilledDay[hid + "|" + ds]) { el.classList.add("snap"); }
        });
        justFilledDay = {};

        summaryEl.innerHTML =
          '<div class="cell"><div class="num">' + state.habits.length + '</div><div class="lbl">Habits tracked</div></div>' +
          '<div class="cell"><div class="num">' + totalActive + '</div><div class="lbl">Active streaks</div></div>' +
          '<div class="cell"><div class="num">' + totalDoneToday + ' / ' + state.habits.length + '</div><div class="lbl">Done today</div></div>';

        renderDashboard();
        renderInsights();
        renderBadgeWall();
        updateSoundIcon();
        renderAddColorRow();
        renderBackupBanner();
        renderFailureBanner();
      }

      function buildChain(h) {
        var days = 30; var set = {}; h.history.forEach(function (d) { set[d] = true; });
        var html = "";
        for (var i = days - 1; i >= 0; i--) {
          var ds = daysAgoStr(i);
          var filled = !!set[ds];
          var isToday = (i === 0);
          html += '<div class="link' + (filled ? ' filled' : '') + (isToday ? ' today' : '') + '" data-date="' + ds + '" title="' + ds + (filled ? ' — done (click to unmark)' : ' — click to mark done') + '"></div>';
          if (i > 0) {
            var nextDs = daysAgoStr(i - 1);
            var on = filled && !!set[nextDs];
            html += '<div class="bar' + (on ? ' on' : '') + '"></div>';
          }
        }
        return html;
      }

      function renderDashboard() {
        var days = 30, totalHabits = state.habits.length;
        var perfectDays = 0, sumRate = 0, cellsHtml = "";
        var dayList = []; for (var j = days - 1; j >= 0; j--) { dayList.push(daysAgoStr(j)); }

        dayList.forEach(function (ds) {
          var doneCount = 0;
          state.habits.forEach(function (h) { if (h.history.indexOf(ds) > -1) doneCount++; });
          var rate = totalHabits > 0 ? doneCount / totalHabits : 0;
          sumRate += rate;
          if (totalHabits > 0 && doneCount === totalHabits) perfectDays++;
          var tier = rate === 0 ? 0 : (rate < 0.4 ? 1 : (rate < 0.75 ? 2 : (rate < 1 ? 3 : 4)));
          var isToday = ds === todayStr();
          var bg = tier === 0 ? "var(--bg-elevated)" : tier === 1 ? "color-mix(in srgb, var(--gold) 25%, var(--bg-elevated))" : tier === 2 ? "color-mix(in srgb, var(--gold) 50%, var(--bg-elevated))" : tier === 3 ? "color-mix(in srgb, var(--gold) 75%, var(--bg-elevated))" : "var(--gold)";
          cellsHtml += '<div class="hm-cell' + (isToday ? ' today-cell' : '') + '" data-date="' + ds + '" style="background:' + bg + ';" title="' + ds + ' — ' + doneCount + '/' + totalHabits + ' done, click for details"></div>';
        });

        var perfectStreak = 0;
        for (var k = dayList.length - 1; k >= 0; k--) {
          var ds2 = dayList[k]; var doneCount2 = 0;
          state.habits.forEach(function (h) { if (h.history.indexOf(ds2) > -1) doneCount2++; });
          var isPerfect = totalHabits > 0 && doneCount2 === totalHabits;
          if (k === dayList.length - 1) { if (isPerfect) { perfectStreak++; } else { continue; } }
          else { if (isPerfect) { perfectStreak++; } else { break; } }
        }

        heatmapEl.innerHTML = cellsHtml;
        var completionRate = totalHabits > 0 ? Math.round((sumRate / days) * 100) : 0;
        dashStatsEl.innerHTML =
          '<div class="dash-stat"><div class="num">' + completionRate + '%</div><div class="lbl">30-day consistency</div></div>' +
          '<div class="dash-stat"><div class="num">' + perfectDays + '</div><div class="lbl">Perfect days</div></div>' +
          '<div class="dash-stat"><div class="num">' + perfectStreak + '</div><div class="lbl">Perfect-day streak</div></div>';
      }

      // ---------- weekly behavioral insights ----------
      // Pulls together data that's collected elsewhere for its own purpose
      // (history for streaks, failureLog for recovery, checkinTimes for nothing
      // else) into a "why did I succeed / fail" view, rather than just "did I
      // do it". Every metric here has its own "not enough data yet" threshold
      // rather than showing a misleading number off a handful of days.
      function computeWeeklyInsights() {
        var result = { bestDay: null, weakestDay: null, bestTime: null, commonReason: null, trend: [] };
        var totalHabits = state.habits.length;
        if (totalHabits === 0) return result;

        // Best / toughest day of week, over the last 8 weeks.
        var WINDOW_DAYS = 56;
        var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var occurrences = [0, 0, 0, 0, 0, 0, 0];
        var dayTotals = [0, 0, 0, 0, 0, 0, 0];
        var dayDone = [0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < WINDOW_DAYS; i++) {
          var ds = daysAgoStr(i);
          var dow = dateFromStr(ds).getDay();
          occurrences[dow]++;
          state.habits.forEach(function (h) {
            if (h.createdAt > ds) return; // habit didn't exist yet that day
            dayTotals[dow]++;
            if (h.history.indexOf(ds) > -1) dayDone[dow]++;
          });
        }
        var bestIdx = -1, worstIdx = -1, bestRate = -1, worstRate = 2;
        for (var d = 0; d < 7; d++) {
          if (occurrences[d] < 2 || dayTotals[d] === 0) continue; // need this weekday to have come around at least twice
          var rate = dayDone[d] / dayTotals[d];
          if (rate > bestRate) { bestRate = rate; bestIdx = d; }
          if (rate < worstRate) { worstRate = rate; worstIdx = d; }
        }
        if (bestIdx > -1) result.bestDay = { name: dayNames[bestIdx], rate: Math.round(bestRate * 100) };
        if (worstIdx > -1 && worstIdx !== bestIdx) result.weakestDay = { name: dayNames[worstIdx], rate: Math.round(worstRate * 100) };

        // Best time of day, from real-time check-in timestamps (never backfills).
        var buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        var bucketLabels = { morning: "mornings", afternoon: "afternoons", evening: "evenings", night: "nights" };
        var totalTimes = 0;
        state.habits.forEach(function (h) {
          Object.keys(h.checkinTimes || {}).forEach(function (dt) {
            var hh = parseInt(h.checkinTimes[dt].split(":")[0], 10);
            totalTimes++;
            if (hh >= 5 && hh <= 11) buckets.morning++;
            else if (hh >= 12 && hh <= 16) buckets.afternoon++;
            else if (hh >= 17 && hh <= 20) buckets.evening++;
            else buckets.night++;
          });
        });
        if (totalTimes >= 5) {
          var bestBucket = Object.keys(buckets).reduce(function (a, b) { return buckets[a] >= buckets[b] ? a : b; });
          result.bestTime = { label: bucketLabels[bestBucket], count: buckets[bestBucket], total: totalTimes };
        }

        // Most common logged miss reason, aggregated across all habits.
        var reasonCounts = {};
        state.habits.forEach(function (h) {
          (h.failureLog || []).forEach(function (e) { reasonCounts[e.reason] = (reasonCounts[e.reason] || 0) + 1; });
        });
        var reasonKeys = Object.keys(reasonCounts);
        var totalReasons = reasonKeys.reduce(function (sum, k) { return sum + reasonCounts[k]; }, 0);
        if (totalReasons >= 3) {
          var bestReasonKey = reasonKeys.reduce(function (a, b) { return reasonCounts[a] >= reasonCounts[b] ? a : b; });
          result.commonReason = { label: failureReasonLabel(bestReasonKey), count: reasonCounts[bestReasonKey] };
        }

        // Weekly consistency trend: % of possible habit-days completed, per
        // Mon-Sun week, for the current week and the 5 before it.
        var thisMonday = mondayOf(todayStr());
        var t = todayStr();
        for (var w = 5; w >= 0; w--) {
          var weekStart = addDays(thisMonday, -7 * w);
          var totalPossible = 0, doneCount = 0;
          for (var dd = 0; dd < 7; dd++) {
            var ds2 = addDays(weekStart, dd);
            if (ds2 > t) break; // don't count days that haven't happened yet
            state.habits.forEach(function (h) {
              if (h.createdAt > ds2) return;
              totalPossible++;
              if (h.history.indexOf(ds2) > -1) doneCount++;
            });
          }
          var pct = totalPossible > 0 ? Math.round((doneCount / totalPossible) * 100) : 0;
          result.trend.push({ label: weekStart.slice(5), pct: pct });
        }
        return result;
      }

      function renderInsights() {
        var grid = document.getElementById("insightGrid");
        var trendEl = document.getElementById("insightTrend");
        if (state.habits.length === 0) {
          grid.innerHTML = '<div class="empty" style="padding:10px 0;grid-column:1 / -1;">Insights will appear here once you have a few habits and some history.</div>';
          trendEl.innerHTML = "";
          return;
        }
        var insights = computeWeeklyInsights();
        function stat(label, val, muted) {
          return '<div class="insight-stat"><div class="lbl">' + escapeHtml(label) + '</div><div class="val' + (muted ? ' muted' : '') + '">' + escapeHtml(val) + '</div></div>';
        }
        grid.innerHTML =
          stat("Best day", insights.bestDay ? (insights.bestDay.name + " (" + insights.bestDay.rate + "%)") : "Not enough data yet", !insights.bestDay) +
          stat("Toughest day", insights.weakestDay ? (insights.weakestDay.name + " (" + insights.weakestDay.rate + "%)") : "Not enough data yet", !insights.weakestDay) +
          stat("Best time", insights.bestTime ? ("Mostly " + insights.bestTime.label) : "Not enough data yet", !insights.bestTime) +
          stat("Common miss reason", insights.commonReason ? (insights.commonReason.label + " (" + insights.commonReason.count + "\u00d7)") : "Not enough data yet", !insights.commonReason);

        var maxPct = Math.max(10, Math.max.apply(null, insights.trend.map(function (w) { return w.pct; })));
        trendEl.innerHTML = insights.trend.map(function (w) {
          var barHeight = Math.max(2, Math.round((w.pct / maxPct) * 40));
          return '<div class="insight-trend-bar" title="' + w.pct + '% that week"><div class="insight-trend-fill" style="height:' + barHeight + 'px;"></div><div class="insight-trend-wk">' + escapeHtml(w.label) + '</div></div>';
        }).join("");
      }

      function renderBadgeWall() {
        if (state.habits.length === 0) {
          badgeWallEl.innerHTML = '<div class="empty" style="padding:20px;">Badges will appear here as your streaks grow.</div>';
          return;
        }
        var milestones = getMilestones();
        var html = '<div class="notes-sub" style="margin-bottom:14px;">Badges use positive reinforcement, not loss framing — they mark progress you\'ve already banked, so a missed day can\'t take one away.</div>';
        state.habits.forEach(function (h) {
          var stats = getStats(h);
          html += '<div class="badge-habit">';
          html += '<div class="badge-habit-name"><span class="swatch" style="background:' + h.color + ';width:8px;height:8px;border-radius:2px;display:inline-block;"></span>' + escapeHtml(h.name) + '</div>';
          html += '<div class="badge-row">';
          milestones.forEach(function (m) {
            var unlocked = stats.longest >= m.days;
            html += '<div class="badge' + (unlocked ? ' unlocked' : '') + '" style="--bhcolor:' + h.color + ';" title="' + m.label + ' — ' + m.days + ' ' + stats.unit + 's' + (unlocked ? ' (earned)' : ' (locked)') + '">' +
              '<div class="badge-icon">' + m.days + '</div><div class="badge-label">' + m.label + '</div></div>';
          });
          html += '</div></div>';
        });
        html += '<div class="custom-milestone-row">' +
          '<span style="font-size:12px;color:var(--ink-faint);">Add a personal milestone:</span>' +
          '<input type="number" id="customMilestoneInput" min="1" max="9999" placeholder="e.g. 21">' +
          '<button id="addCustomMilestoneBtn">Add</button>' +
          '</div>';
        badgeWallEl.innerHTML = html;

        document.getElementById("addCustomMilestoneBtn").addEventListener("click", function () {
          var input = document.getElementById("customMilestoneInput");
          var n = parseInt(input.value, 10);
          if (!n || n < 1) { toast("Enter a valid number of days first."); return; }
          var exists = MILESTONES.some(function (m) { return m.days === n; }) || (state.customMilestones || []).indexOf(n) > -1;
          if (exists) { toast("That milestone already exists."); return; }
          state.customMilestones = state.customMilestones || [];
          state.customMilestones.push(n);
          save(state); input.value = ""; renderBadgeWall();
          toast("Custom milestone added: " + n + ".");
        });
      }

      function renderAddColorRow() {
        var row = document.getElementById("addColorRow");
        row.innerHTML = "";
        PALETTE.forEach(function (c) {
          var dot = document.createElement("div");
          dot.className = "color-dot" + (c === selectedAddColor ? " selected" : "");
          dot.style.background = c; dot.title = COLOR_NAMES[c] || c;
          dot.addEventListener("click", function () { selectedAddColor = c; renderAddColorRow(); });
          row.appendChild(dot);
        });
        var custom = document.createElement("input");
        custom.type = "color";
        custom.className = "custom-color-input";
        custom.title = "Custom color";
        custom.value = PALETTE.indexOf(selectedAddColor) === -1 ? selectedAddColor : "#888888";
        custom.addEventListener("input", function () { selectedAddColor = custom.value; renderAddColorRow(); });
        row.appendChild(custom);
      }

      function updateSoundIcon() {
        var btn = document.getElementById("soundToggle");
        btn.innerHTML = prefs.sound ? "&#128266; Sound: On" : "&#128263; Sound: Off";
        btn.classList.toggle("off", !prefs.sound);
      }

      function renderBackupBanner() {
        var banner = document.getElementById("backupBanner");
        var text = document.getElementById("backupBannerText");
        if (state.habits.length === 0) { banner.classList.remove("show"); return; }
        var overdue = false;
        if (!prefs.lastExportAt) { overdue = true; }
        else {
          var last = new Date(prefs.lastExportAt);
          var days = (Date.now() - last.getTime()) / 86400000;
          if (days > 14) overdue = true;
        }
        if (overdue && !bannerDismissed) {
          text.textContent = prefs.lastExportAt ? "You haven't backed up in a while — export a copy so a browser reset can't wipe your streaks." : "You haven't exported a backup yet — do it once so a browser reset can't wipe your streaks.";
          banner.classList.add("show");
        } else {
          banner.classList.remove("show");
        }
      }
      var bannerDismissed = false;
      document.getElementById("backupBannerDismiss").addEventListener("click", function () { bannerDismissed = true; renderBackupBanner(); });
      document.getElementById("backupBannerExport").addEventListener("click", function () { exportBackup(); });

      // ---------- failure-reason banner + modal ----------
      function renderFailureBanner() {
        var banner = document.getElementById("failureBanner");
        var text = document.getElementById("failureBannerText");
        var missed = habitsMissingYesterdayReason();
        var dismissedToday = prefs.lastFailureDismissedDate === todayStr();
        if (missed.length === 0 || dismissedToday) { banner.classList.remove("show"); return; }
        text.textContent = missed.length === 1
          ? ("You missed \"" + missed[0].name + "\" yesterday — want to log why? It helps spot patterns.")
          : ("You missed " + missed.length + " habits yesterday — want to log why? It helps spot patterns.");
        banner.classList.add("show");
      }
      document.getElementById("failureBannerDismiss").addEventListener("click", function () {
        prefs.lastFailureDismissedDate = todayStr(); savePrefs(prefs);
        renderFailureBanner();
      });

      var failureOverlay = document.getElementById("failureOverlay");
      var failureListEl = document.getElementById("failureList");
      function renderFailureList() {
        var missed = habitsMissingYesterdayReason();
        if (missed.length === 0) { failureOverlay.classList.remove("open"); return; }
        failureListEl.innerHTML = missed.map(function (h) {
          var chips = FAILURE_REASONS.map(function (r) {
            return '<button class="failure-chip" data-action="logfailure" data-id="' + h.id + '" data-reason="' + r.key + '">' + escapeHtml(r.label) + '</button>';
          }).join("");
          return '<div class="failure-row"><div class="failure-row-name">' + escapeHtml(h.name) + '</div><div class="failure-chips">' + chips + '</div></div>';
        }).join("");
      }
      function openFailureModal() {
        renderFailureList();
        failureOverlay.classList.add("open");
      }
      document.getElementById("failureBannerLogBtn").addEventListener("click", openFailureModal);
      document.getElementById("failureCloseBtn").addEventListener("click", function () { failureOverlay.classList.remove("open"); });
      failureOverlay.addEventListener("click", function (e) { if (e.target === failureOverlay) failureOverlay.classList.remove("open"); });
      failureListEl.addEventListener("click", function (e) {
        var chip = e.target.closest(".failure-chip");
        if (!chip) return;
        var habit = state.habits.find(function (x) { return x.id === chip.getAttribute("data-id"); });
        if (!habit) return;
        logFailureReason(habit, daysAgoStr(1), chip.getAttribute("data-reason"));
        render();
        renderFailureList();
        renderFailureBanner();
        if (habitsMissingYesterdayReason().length === 0) {
          toast("Thanks — logged.");
          failureOverlay.classList.remove("open");
        }
      });

      // ---------- reflection notes ----------
      var noteInput = document.getElementById("noteInput");
      var noteDateLabel = document.getElementById("noteDateLabel");
      var notesListEl = document.getElementById("notesList");

      function renderNotes() {
        noteDateLabel.textContent = "Today — " + todayStr();
        var dates = Object.keys(notes).filter(function (d) { return notes[d] && notes[d].length > 0; }).sort().reverse().slice(0, 14);
        if (dates.length === 0) {
          notesListEl.innerHTML = '<div class="empty" style="padding:14px 4px;">Past entries will show up here.</div>';
          return;
        }
        notesListEl.innerHTML = dates.map(function (d) {
          var entries = notes[d];
          var entriesHtml = entries.map(function (e) {
            var truncated = e.text.length > 220 ? e.text.slice(0, 220) + "…" : e.text;
            return '<div class="note-entry">' +
              '<div><div class="note-entry-time">' + (e.time || "") + '</div><div class="note-entry-text">' + escapeHtml(truncated) + '</div></div>' +
              '<button class="note-del" data-date="' + d + '" data-eid="' + e.id + '" title="Delete this entry">&#10005;</button>' +
              '</div>';
          }).join("");
          return '<div class="note-day-group"><div class="note-day-date">' + d + '</div>' + entriesHtml + '</div>';
        }).join("");
      }

      document.getElementById("noteSaveBtn").addEventListener("click", function () {
        var text = noteInput.value.trim();
        if (!text) { toast("Write something first."); return; }
        var t = todayStr();
        notes[t] = notes[t] || [];
        notes[t].push({ id: cryptoId(), time: nowTimeStr(), text: text });
        saveNotes(notes);
        noteInput.value = "";
        renderNotes();
        toast("Note saved.");
      });

      notesListEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".note-del");
        if (!btn) return;
        var d = btn.getAttribute("data-date"), eid = btn.getAttribute("data-eid");
        if (confirm("Delete this note entry from " + d + "?")) {
          notes[d] = (notes[d] || []).filter(function (x) { return x.id !== eid; });
          if (notes[d].length === 0) delete notes[d];
          saveNotes(notes);
          renderNotes();
        }
      });

      document.getElementById("notesExportBtn").addEventListener("click", function () {
        var dates = Object.keys(notes).sort();
        if (dates.length === 0) { toast("No notes to export yet."); return; }
        var lines = ["STREAK — Reflection Log", "Exported " + todayStr(), ""];
        dates.forEach(function (d) {
          lines.push("## " + d);
          notes[d].forEach(function (e) {
            lines.push((e.time ? "[" + e.time + "] " : "") + e.text);
          });
          lines.push("");
        });
        downloadFile("streak-reflection-log-" + todayStr() + ".txt", lines.join("\n"), "text/plain");
        markExported();
        toast("Reflection log exported.");
      });

      // ---------- day detail modal ----------
      var dayDetailOverlay = document.getElementById("dayDetailOverlay");
      heatmapEl.addEventListener("click", function (e) {
        var cell = e.target.closest(".hm-cell");
        if (!cell) return;
        var ds = cell.getAttribute("data-date");
        document.getElementById("dayDetailTitle").textContent = ds;
        var list = document.getElementById("dayDetailList");
        if (state.habits.length === 0) {
          list.innerHTML = '<div class="empty" style="padding:10px 0;">No habits tracked that day.</div>';
        } else {
          list.innerHTML = state.habits.map(function (h) {
            var done = h.history.indexOf(ds) > -1;
            return '<div class="day-detail-row"><span class="day-detail-dot' + (done ? '' : ' off') + '" style="' + (done ? ('background:' + h.color + ';') : '') + '"></span>' + escapeHtml(h.name) + (done ? " — done" : " — not done") + '</div>';
          }).join("");
        }
        dayDetailOverlay.classList.add("open");
      });
      document.getElementById("dayDetailCloseBtn").addEventListener("click", function () { dayDetailOverlay.classList.remove("open"); });
      dayDetailOverlay.addEventListener("click", function (e) { if (e.target === dayDetailOverlay) dayDetailOverlay.classList.remove("open"); });

      // ---------- confetti + milestones ----------
      function spawnConfetti(container) {
        container.innerHTML = "";
        var colors = PALETTE.concat(["#e8c468"]);
        for (var i = 0; i < 28; i++) {
          var piece = document.createElement("div");
          piece.className = "confetti-piece";
          piece.style.left = (Math.random() * 100) + "%";
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.animationDuration = (1.1 + Math.random() * 0.9) + "s";
          piece.style.animationDelay = (Math.random() * 0.3) + "s";
          piece.style.borderRadius = (Math.random() > 0.5) ? "50%" : "2px";
          container.appendChild(piece);
        }
        setTimeout(function () { container.innerHTML = ""; }, 2400);
      }
      var milestoneOverlay = document.getElementById("milestoneOverlay");
      var milestoneModal = document.getElementById("milestoneModal");
      function celebrateMilestone(habit, milestone) {
        milestoneModal.style.setProperty("--mcolor", habit.color);
        document.getElementById("milestoneBadgeIcon").textContent = milestone.days;
        document.getElementById("milestoneHabitName").textContent = habit.name + " — " + milestone.label;
        // A quiet personal touch on the bigger milestones only — see renderGreeting()
        // for the one other spot the name shows up. Small milestones stay as-is so
        // the name doesn't feel repeated everywhere.
        var subtitleHtml = escapeHtml(milestone.subtitle);
        if (prefs.name && milestone.days >= 30) {
          subtitleHtml = "<b>" + escapeHtml(prefs.name) + "</b> — " + milestone.days + " days. " + subtitleHtml;
        }
        document.getElementById("milestoneSubtitle").innerHTML = subtitleHtml;
        document.getElementById("milestoneQuote").textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        milestoneOverlay.classList.add("open");
        spawnConfetti(document.getElementById("confettiLayer"));
        playChime("milestone");
      }
      document.getElementById("milestoneCloseBtn").addEventListener("click", function () { milestoneOverlay.classList.remove("open"); });
      milestoneOverlay.addEventListener("click", function (e) { if (e.target === milestoneOverlay) milestoneOverlay.classList.remove("open"); });

      // ---------- check-in / backfill toggle (shared) ----------
      function toggleHabitDay(habit, dateStr) {
        var idx = habit.history.indexOf(dateStr);
        var before = getStats(habit);
        if (idx > -1) {
          habit.history.splice(idx, 1);
          var oldTime = habit.checkinTimes[dateStr];
          delete habit.checkinTimes[dateStr];
          save(state); render();
          var isToday = dateStr === todayStr();
          toast((isToday ? "Unmarked today" : "Unmarked " + dateStr) + " for " + habit.name + ".", {
            label: "Undo",
            onClick: function () {
              habit.history.push(dateStr);
              if (oldTime) habit.checkinTimes[dateStr] = oldTime;
              save(state); render();
            }
          });
        } else {
          habit.history.push(dateStr);
          justFilledDay[habit.id + "|" + dateStr] = true;
          var isToday2 = dateStr === todayStr();
          // Only record a real check-in time for today — backfilling a past date
          // doesn't tell us anything about when that day's action actually happened.
          if (isToday2) habit.checkinTimes[dateStr] = nowTimeStr();
          save(state); render();
          playChime("checkin");
          toast((isToday2 ? habit.name + " marked done — keep the chain going." : habit.name + " backfilled for " + dateStr + "."), {
            label: "Undo",
            onClick: function () {
              var i2 = habit.history.indexOf(dateStr);
              if (i2 > -1) habit.history.splice(i2, 1);
              delete habit.checkinTimes[dateStr];
              save(state); render();
            }
          });
          var after = getStats(habit);
          var hit = getMilestones().find(function (m) { return after.current === m.days && before.current < m.days; });
          if (hit) { setTimeout(function () { celebrateMilestone(habit, hit); }, 350); }
        }
      }

      habitsEl.addEventListener("click", function (e) {
        var link = e.target.closest(".link");
        if (link) {
          var chainDiv = link.closest(".chain");
          var hid = chainDiv.getAttribute("data-id");
          var habit = state.habits.find(function (x) { return x.id === hid; });
          var ds = link.getAttribute("data-date");
          if (habit) toggleHabitDay(habit, ds);
          return;
        }
        var btn = e.target.closest("button[data-action]");
        if (!btn) return;
        var id = btn.getAttribute("data-id");
        var action = btn.getAttribute("data-action");
        var habit2 = state.habits.find(function (x) { return x.id === id; });
        if (!habit2) return;

        if (action === "checkin") { toggleHabitDay(habit2, todayStr()); }
        if (action === "delete") { openDeleteModal(habit2); }
        if (action === "editcolor") { openColorModal(habit2); }
        if (action === "rename") { openRenameModal(habit2); }
      });

      // ---------- frequency UI toggle ----------
      var freqType = document.getElementById("freqType");
      var freqTarget = document.getElementById("freqTarget");
      var freqTargetLabel = document.getElementById("freqTargetLabel");
      freqType.addEventListener("change", function () {
        var isWeekly = freqType.value === "weekly";
        freqTarget.style.display = isWeekly ? "inline-block" : "none";
        freqTargetLabel.style.display = isWeekly ? "inline" : "none";
      });

      // ---------- add habit ----------
      document.getElementById("addHabitBtn").addEventListener("click", addHabit);
      document.getElementById("newHabitName").addEventListener("keydown", function (e) { if (e.key === "Enter") addHabit(); });
      function addHabit() {
        var input = document.getElementById("newHabitName");
        var descInput = document.getElementById("newHabitDesc");
        var name = input.value.trim();
        if (!name) { toast("Give the habit a name first."); return; }
        if (state.habits.some(function (h) { return h.name.toLowerCase() === name.toLowerCase(); })) {
          toast("You already have a habit called that."); return;
        }
        var frequency = freqType.value === "weekly" ? { type: "weekly", target: Math.max(1, Math.min(6, parseInt(freqTarget.value, 10) || 3)) } : { type: "daily" };
        var minInput = document.getElementById("newHabitMin");
        var ifThenInput = document.getElementById("newHabitIfThen");
        var identityInput = document.getElementById("newHabitIdentity");
        state.habits.push({
          id: cryptoId(), name: name, color: selectedAddColor, createdAt: todayStr(),
          description: descInput.value.trim(), minimum: minInput.value.trim(),
          implementationIntention: ifThenInput.value.trim(), identity: identityInput.value.trim(),
          frequency: frequency, history: [], failureLog: [], checkinTimes: {}
        });
        save(state);
        input.value = ""; descInput.value = ""; minInput.value = ""; ifThenInput.value = ""; identityInput.value = "";
        freqType.value = "daily"; freqTarget.style.display = "none"; freqTargetLabel.style.display = "none";
        render();
        toast(name + " added.");
      }

      // ---------- rename modal ----------
      var renameOverlay = document.getElementById("renameOverlay");
      var renameInput = document.getElementById("renameInput");
      var renameColorRow = document.getElementById("renameColorRow");
      var renameMinInput = document.getElementById("renameMinInput");
      var renameIfThenInput = document.getElementById("renameIfThenInput");
      var renameIdentityInput = document.getElementById("renameIdentityInput");
      var pendingRenameId = null;
      function renderRenameColorRow(habit) {
        renameColorRow.innerHTML = "";
        PALETTE.forEach(function (c) {
          var dot = document.createElement("div");
          dot.className = "color-dot" + (c === habit.color ? " selected" : "");
          dot.style.background = c; dot.title = COLOR_NAMES[c] || c;
          dot.addEventListener("click", function () {
            var h = state.habits.find(function (x) { return x.id === pendingRenameId; });
            if (h) { h.color = c; save(state); render(); renderRenameColorRow(h); }
          });
          renameColorRow.appendChild(dot);
        });
        var custom = document.createElement("input");
        custom.type = "color";
        custom.className = "custom-color-input";
        custom.title = "Custom color";
        custom.value = habit.color;
        custom.addEventListener("input", function () {
          var h = state.habits.find(function (x) { return x.id === pendingRenameId; });
          if (h) { h.color = custom.value; save(state); render(); }
        });
        renameColorRow.appendChild(custom);
      }
      function openRenameModal(habit) {
        pendingRenameId = habit.id;
        renameInput.value = habit.name;
        renderRenameColorRow(habit);
        renameMinInput.value = habit.minimum || "";
        renameIfThenInput.value = habit.implementationIntention || "";
        renameIdentityInput.value = habit.identity || "";
        renameOverlay.classList.add("open");
        setTimeout(function () { renameInput.focus(); renameInput.select(); }, 30);
      }
      document.getElementById("renameCancelBtn").addEventListener("click", function () { renameOverlay.classList.remove("open"); });
      document.getElementById("renameSaveBtn").addEventListener("click", function () {
        var newName = renameInput.value.trim();
        if (!newName) { toast("Name can't be empty."); return; }
        var dup = state.habits.some(function (h) { return h.id !== pendingRenameId && h.name.toLowerCase() === newName.toLowerCase(); });
        if (dup) { toast("Another habit already has that name."); return; }
        var habit = state.habits.find(function (x) { return x.id === pendingRenameId; });
        if (habit) {
          habit.name = newName;
          habit.minimum = renameMinInput.value.trim().slice(0, 60);
          habit.implementationIntention = renameIfThenInput.value.trim().slice(0, 140);
          habit.identity = renameIdentityInput.value.trim().slice(0, 140);
          save(state); render(); renderBadgeWall(); toast("Saved.");
        }
        renameOverlay.classList.remove("open");
      });
      renameInput.addEventListener("keydown", function (e) { if (e.key === "Enter") document.getElementById("renameSaveBtn").click(); });
      renameOverlay.addEventListener("click", function (e) { if (e.target === renameOverlay) renameOverlay.classList.remove("open"); });

      // ---------- color edit modal ----------
      var colorOverlay = document.getElementById("colorOverlay");
      var colorHabitName = document.getElementById("colorHabitName");
      var colorModalGrid = document.getElementById("colorModalGrid");
      var pendingColorHabitId = null;
      function openColorModal(habit) {
        pendingColorHabitId = habit.id;
        colorHabitName.textContent = habit.name;
        colorModalGrid.innerHTML = "";
        PALETTE.forEach(function (c) {
          var dot = document.createElement("div");
          dot.className = "color-dot" + (c === habit.color ? " selected" : "");
          dot.style.background = c; dot.style.width = "30px"; dot.style.height = "30px";
          dot.title = COLOR_NAMES[c] || c;
          dot.addEventListener("click", function () {
            var h = state.habits.find(function (x) { return x.id === pendingColorHabitId; });
            if (h) { h.color = c; save(state); render(); }
            colorOverlay.classList.remove("open");
            toast("Color updated.");
          });
          colorModalGrid.appendChild(dot);
        });
        var custom = document.createElement("input");
        custom.type = "color"; custom.className = "custom-color-input";
        custom.style.width = "30px"; custom.style.height = "30px";
        custom.title = "Custom color"; custom.value = habit.color;
        custom.addEventListener("input", function () {
          var h = state.habits.find(function (x) { return x.id === pendingColorHabitId; });
          if (h) { h.color = custom.value; save(state); render(); }
        });
        colorModalGrid.appendChild(custom);
        colorOverlay.classList.add("open");
      }
      document.getElementById("colorCancelBtn").addEventListener("click", function () { colorOverlay.classList.remove("open"); });
      colorOverlay.addEventListener("click", function (e) { if (e.target === colorOverlay) colorOverlay.classList.remove("open"); });

      // ---------- delete-habit modal ----------
      var deleteOverlay = document.getElementById("deleteOverlay");
      var deleteHabitName = document.getElementById("deleteHabitName");
      var deleteConfirmInput = document.getElementById("deleteConfirmInput");
      var deleteConfirmBtn = document.getElementById("deleteConfirmBtn");
      var pendingDeleteId = null;
      function openDeleteModal(habit) {
        pendingDeleteId = habit.id;
        deleteHabitName.textContent = habit.name;
        deleteConfirmInput.value = "";
        deleteConfirmBtn.classList.remove("active");
        deleteOverlay.classList.add("open");
        setTimeout(function () { deleteConfirmInput.focus(); }, 30);
      }
      function closeDeleteModal() { deleteOverlay.classList.remove("open"); pendingDeleteId = null; }
      deleteConfirmInput.addEventListener("input", function () {
        var habit = state.habits.find(function (x) { return x.id === pendingDeleteId; });
        if (habit && deleteConfirmInput.value === habit.name) { deleteConfirmBtn.classList.add("active"); }
        else { deleteConfirmBtn.classList.remove("active"); }
      });
      document.getElementById("deleteCancelBtn").addEventListener("click", closeDeleteModal);
      deleteConfirmBtn.addEventListener("click", function () {
        if (!deleteConfirmBtn.classList.contains("active")) return;
        state.habits = state.habits.filter(function (x) { return x.id !== pendingDeleteId; });
        save(state); closeDeleteModal(); render();
        toast("Habit deleted.");
      });
      deleteOverlay.addEventListener("click", function (e) { if (e.target === deleteOverlay) closeDeleteModal(); });

      // ---------- wipe-all modal ----------
      var wipeOverlay = document.getElementById("wipeOverlay");
      var wipeConfirmInput = document.getElementById("wipeConfirmInput");
      var wipeConfirmBtn = document.getElementById("wipeConfirmBtn");
      document.getElementById("wipeBtn").addEventListener("click", function () {
        wipeConfirmInput.value = ""; wipeConfirmBtn.classList.remove("active");
        wipeOverlay.classList.add("open");
        setTimeout(function () { wipeConfirmInput.focus(); }, 30);
      });
      document.getElementById("wipeCancelBtn").addEventListener("click", function () { wipeOverlay.classList.remove("open"); });
      wipeConfirmInput.addEventListener("input", function () {
        if (wipeConfirmInput.value === "ERASE ALL") { wipeConfirmBtn.classList.add("active"); }
        else { wipeConfirmBtn.classList.remove("active"); }
      });
      wipeConfirmBtn.addEventListener("click", function () {
        if (!wipeConfirmBtn.classList.contains("active")) return;
        state = { habits: [], customMilestones: [] };
        notes = {};
        prefs = { sound: true, onboarded: false, lastExportAt: null, name: "", lastFailureDismissedDate: null };
        save(state);
        saveNotes(notes);
        savePrefs(prefs);
        wipeOverlay.classList.remove("open");
        render();
        renderNotes();
        if (!prefs.onboarded) {
          renderOnboardList();
          onboardOverlay.classList.add("open");
        }
        toast("All data erased.");
      });
      wipeOverlay.addEventListener("click", function (e) { if (e.target === wipeOverlay) wipeOverlay.classList.remove("open"); });

      // ---------- sound toggle ----------
      document.getElementById("soundToggle").addEventListener("click", function () {
        prefs.sound = !prefs.sound; savePrefs(prefs); updateSoundIcon();
        if (prefs.sound) playChime("checkin");
      });

      // ---------- settings / data side panel ----------
      var sidePanelOverlay = document.getElementById("sidePanelOverlay");
      document.getElementById("settingsTriggerBtn").addEventListener("click", function () {
        sidePanelOverlay.classList.add("open");
      });
      document.getElementById("sidePanelCloseBtn").addEventListener("click", function () {
        sidePanelOverlay.classList.remove("open");
      });
      sidePanelOverlay.addEventListener("click", function (e) {
        if (e.target === sidePanelOverlay) sidePanelOverlay.classList.remove("open");
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") sidePanelOverlay.classList.remove("open");
      });

      // ---------- floating "jump to reflection log" button ----------
      // Scrolls to the note box AND focuses it, so the person can start typing
      // immediately — no extra click into the textarea needed.
      document.getElementById("fabNotesBtn").addEventListener("click", function () {
        var target = document.getElementById("notesSection");
        var input = document.getElementById("noteInput");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (input) {
          setTimeout(function () {
            input.focus();
            var len = input.value.length;
            input.setSelectionRange(len, len);
          }, 550);
        }
      });

      // ---------- theme switch ----------
      var themeDarkBtn = document.getElementById("themeDarkBtn");
      var themeLightBtn = document.getElementById("themeLightBtn");
      function renderThemeSwitch() {
        themeDarkBtn.classList.toggle("active", prefs.theme === "dark");
        themeLightBtn.classList.toggle("active", prefs.theme === "light");
      }
      function setTheme(theme) {
        prefs.theme = theme === "light" ? "light" : "dark";
        savePrefs(prefs);
        applyTheme(prefs.theme);
        renderThemeSwitch();
      }
      themeDarkBtn.addEventListener("click", function () { setTheme("dark"); });
      themeLightBtn.addEventListener("click", function () { setTheme("light"); });
      renderThemeSwitch();

      // ---------- export / import / sync ----------
      function downloadFile(filename, content, mime) {
        var blob = new Blob([content], { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a"); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      function markExported() { prefs.lastExportAt = new Date().toISOString(); savePrefs(prefs); bannerDismissed = false; renderBackupBanner(); }
      function exportBackup() {
        var backup = {
          format: "STREAK backup",
          version: 2,
          exportedAt: new Date().toISOString(),
          state: state,
          prefs: prefs,
          notes: notes
        };
        downloadFile("streak-backup-" + todayStr() + ".json", JSON.stringify(backup, null, 2), "application/json");
        markExported();
        toast("Backup downloaded.");
      }
      document.getElementById("exportBtn").addEventListener("click", exportBackup);

      document.getElementById("changeNameBtn").addEventListener("click", function () {
        var input = window.prompt("What should we call you? (leave blank to remove)", prefs.name || "");
        if (input === null) return; // cancelled
        prefs.name = sanitizeName(input);
        savePrefs(prefs);
        renderGreeting();
        toast(prefs.name ? ("Got it, " + prefs.name + ".") : "Name cleared.", null, prefs.name);
      });

      var importFile = document.getElementById("importFile");
      document.getElementById("importBtn").addEventListener("click", function () { importFile.click(); });
      importFile.addEventListener("change", function () {
        var file = importFile.files[0]; if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(reader.result);
            var importedState = parsed && parsed.state ? parsed.state : parsed; // accepts v2 and legacy backups
            if (!importedState || !Array.isArray(importedState.habits)) throw new Error("bad format");
            var ok = confirm("Import this backup? It will replace everything currently stored in this browser.");
            if (ok) {
              state = normalizeState(importedState);
              if (parsed && parsed.prefs) prefs = Object.assign(prefs, parsed.prefs);
              notes = parsed && parsed.notes ? migrateNotes(parsed.notes) : {};
              save(state);
              savePrefs(prefs);
              saveNotes(notes);
              render();
              renderNotes();
              toast("Backup imported.");
            }
          } catch (e) { toast("That file doesn't look like a STREAK backup."); }
          importFile.value = "";
        };
        reader.readAsText(file);
      });

      // sync code
      function encodeState(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
      function decodeState(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
      var syncOverlay = document.getElementById("syncOverlay");
      document.getElementById("syncBtn").addEventListener("click", function () {
        var payload = { habits: state.habits, customMilestones: state.customMilestones, notes: notes };
        document.getElementById("syncCodeOut").value = encodeState(payload);
        document.getElementById("syncCodeIn").value = "";
        syncOverlay.classList.add("open");
      });
      document.getElementById("syncCopyBtn").addEventListener("click", function () {
        var ta = document.getElementById("syncCodeOut");
        ta.select();
        try { document.execCommand("copy"); toast("Sync code copied."); }
        catch (e) {
          navigator.clipboard && navigator.clipboard.writeText(ta.value).then(function () { toast("Sync code copied."); });
        }
      });
      document.getElementById("syncImportBtn").addEventListener("click", function () {
        var code = document.getElementById("syncCodeIn").value.trim();
        if (!code) { toast("Paste a code first."); return; }
        try {
          var payload = decodeState(code);
          if (!payload || !Array.isArray(payload.habits)) throw new Error("bad");
          var ok = confirm("Import this sync code? It replaces everything currently stored in this browser.");
          if (!ok) return;
          state = normalizeState({ habits: payload.habits, customMilestones: payload.customMilestones || [] });
          notes = migrateNotes(payload.notes || {});
          save(state); saveNotes(notes);
          render(); renderNotes();
          syncOverlay.classList.remove("open");
          toast("Synced from code.");
        } catch (e) { toast("That doesn't look like a valid sync code."); }
      });
      document.getElementById("syncCancelBtn").addEventListener("click", function () { syncOverlay.classList.remove("open"); });
      syncOverlay.addEventListener("click", function (e) { if (e.target === syncOverlay) syncOverlay.classList.remove("open"); });

      // ---------- onboarding ----------
      var onboardOverlay = document.getElementById("onboardOverlay");
      var onboardList = document.getElementById("onboardList");
      function renderOnboardList() {
        onboardList.innerHTML = SUGGESTED_HABITS.map(function (name, i) {
          var checked = i < 3 ? "checked" : "";
          return '<label class="onboard-item"><input type="checkbox" value="' + name + '" ' + checked + '><span>' + name + '</span></label>';
        }).join("");
      }
      document.getElementById("onboardStartBtn").addEventListener("click", function () {
        var checked = Array.prototype.slice.call(onboardList.querySelectorAll("input:checked")).map(function (i) { return i.value; });
        var custom = document.getElementById("onboardCustom").value.trim();
        if (custom) checked.push(custom);
        checked.forEach(function (name, i) {
          state.habits.push({ id: cryptoId(), name: name, color: PALETTE[i % PALETTE.length], createdAt: todayStr(), description: "", minimum: "", implementationIntention: "", identity: "", frequency: { type: "daily" }, history: [], failureLog: [], checkinTimes: {} });
        });
        save(state);
        prefs.name = sanitizeName(document.getElementById("onboardName").value);
        prefs.onboarded = true; savePrefs(prefs);
        onboardOverlay.classList.remove("open");
        render();
        if (checked.length > 0) {
          toast(prefs.name ? ("Welcome, " + prefs.name + " — let's build your first streak.") : "Welcome — let's build your first streak.", null, prefs.name);
        }
      });

      // ---------- init ----------
      if (!prefs.onboarded && state.habits.length === 0) {
        renderOnboardList();
        onboardOverlay.classList.add("open");
      } else if (!prefs.onboarded) {
        prefs.onboarded = true; savePrefs(prefs);
      }
      render();
      renderNotes();
    })();
