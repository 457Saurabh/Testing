/* STREAK Core — pure date and streak calculations.
   No DOM, no localStorage, no browser UI dependencies. */
(function (root) {
  "use strict";

  function pad(n) { return String(n).padStart(2, "0"); }

  function dateFromStr(s) {
    if (!isValidDateStr(s)) return new Date(NaN);
    var parts = s.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function strFromDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function isValidDateStr(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = dateFromStrRaw(s);
    return d.getFullYear() === Number(s.slice(0, 4)) &&
           d.getMonth() + 1 === Number(s.slice(5, 7)) &&
           d.getDate() === Number(s.slice(8, 10));
  }

  function dateFromStrRaw(s) {
    var parts = s.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function todayStr() { return strFromDate(new Date()); }

  function daysAgoStr(n) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - Number(n || 0));
    return strFromDate(d);
  }

  function addDays(dateStr, delta) {
    var d = dateFromStr(dateStr);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + Number(delta));
    return strFromDate(d);
  }

  function dayDiff(a, b) {
    var da = dateFromStr(a), db = dateFromStr(b);
    da.setHours(12, 0, 0, 0);
    db.setHours(12, 0, 0, 0);
    return Math.round((db - da) / 86400000);
  }

  function dayOfYear() {
    var d = new Date();
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function mondayOf(dateStr) {
    var d = dateFromStr(dateStr);
    d.setHours(12, 0, 0, 0);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return strFromDate(d);
  }

  function nowTimeStr() {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function uniqueValidDates(history) {
    var seen = Object.create(null);
    (Array.isArray(history) ? history : []).forEach(function (d) {
      if (isValidDateStr(d)) seen[d] = true;
    });
    return Object.keys(seen).sort();
  }

  function longestDailyStreak(dates) {
    if (!dates.length) return 0;
    var longest = 1, run = 1;
    for (var i = 1; i < dates.length; i++) {
      if (dayDiff(dates[i - 1], dates[i]) === 1) run++;
      else run = 1;
      if (run > longest) longest = run;
    }
    return longest;
  }

  function currentDailyStreak(dates) {
    if (!dates.length) return 0;
    var set = Object.create(null);
    dates.forEach(function (d) { set[d] = true; });
    var current = todayStr();
    if (!set[current]) return 0;
    var count = 1;
    while (set[addDays(current, -1)]) {
      current = addDays(current, -1);
      count++;
    }
    return count;
  }

  function weekKey(dateStr) {
    return mondayOf(dateStr);
  }

  function weeklyBuckets(dates, createdAt) {
    var map = Object.create(null);
    dates.forEach(function (d) {
      if (createdAt && d < createdAt) return;
      var k = weekKey(d);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }

  function eligibleWeeksUntilToday(createdAt) {
    var currentMonday = mondayOf(todayStr());
    var start = createdAt && isValidDateStr(createdAt) ? mondayOf(createdAt) : currentMonday;
    var weeks = [];
    var cursor = start;
    while (cursor <= currentMonday) {
      weeks.push(cursor);
      cursor = addDays(cursor, 7);
    }
    return weeks;
  }

  function computeWeeklyStreak(habit) {
    var target = Math.max(1, Math.min(14, parseInt(habit && habit.frequency && habit.frequency.target, 10) || 3));
    var dates = uniqueValidDates(habit && habit.history);
    if (!dates.length) return 0;
    var createdAt = habit && isValidDateStr(habit.createdAt) ? habit.createdAt : dates[0];
    var counts = weeklyBuckets(dates, createdAt);
    var weeks = eligibleWeeksUntilToday(createdAt);
    if (!weeks.length) return 0;

    // A weekly streak is active only when the current calendar week has hit its target.
    // This preserves the app's existing visual contract where current=0 means recovery.
    var currentWeek = weeks[weeks.length - 1];
    if ((counts[currentWeek] || 0) < target) return 0;

    var streak = 0;
    for (var i = weeks.length - 1; i >= 0; i--) {
      if ((counts[weeks[i]] || 0) >= target) streak++;
      else break;
    }
    return streak;
  }

  function longestWeeklyStreak(habit) {
    var target = Math.max(1, Math.min(14, parseInt(habit && habit.frequency && habit.frequency.target, 10) || 3));
    var dates = uniqueValidDates(habit && habit.history);
    if (!dates.length) return 0;
    var createdAt = habit && isValidDateStr(habit.createdAt) ? habit.createdAt : dates[0];
    var counts = weeklyBuckets(dates, createdAt);
    var weeks = eligibleWeeksUntilToday(createdAt);
    var longest = 0, run = 0;
    weeks.forEach(function (w) {
      if ((counts[w] || 0) >= target) { run++; longest = Math.max(longest, run); }
      else run = 0;
    });
    return longest;
  }

  function getStats(habit) {
    var weekly = habit && habit.frequency && habit.frequency.type === "weekly";
    var dates = uniqueValidDates(habit && habit.history);
    if (weekly) {
      return {
        current: computeWeeklyStreak(habit),
        longest: longestWeeklyStreak(habit),
        unit: "week"
      };
    }
    return {
      current: currentDailyStreak(dates),
      longest: longestDailyStreak(dates),
      unit: "day"
    };
  }

  root.StreakCore = {
    pad: pad,
    todayStr: todayStr,
    dateFromStr: dateFromStr,
    strFromDate: strFromDate,
    daysAgoStr: daysAgoStr,
    addDays: addDays,
    dayDiff: dayDiff,
    dayOfYear: dayOfYear,
    mondayOf: mondayOf,
    nowTimeStr: nowTimeStr,
    isValidDateStr: isValidDateStr,
    computeStreak: function (habit) {
      return habit && habit.frequency && habit.frequency.type === "weekly" ? computeWeeklyStreak(habit) : currentDailyStreak(uniqueValidDates(habit && habit.history));
    },
    computeWeeklyStreak: computeWeeklyStreak,
    getStats: getStats
  };
})(typeof window !== "undefined" ? window : globalThis);
