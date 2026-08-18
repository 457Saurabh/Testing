const assert = require('assert');
// Load into globalThis.
require('./streak-core.js');
const C = global.StreakCore;
assert(C);
assert(C.isValidDateStr('2026-08-14'));
assert(!C.isValidDateStr('2026-02-30'));
assert.strictEqual(C.dayDiff('2026-08-14', '2026-08-15'), 1);
assert.strictEqual(C.addDays('2026-08-14', 7), '2026-08-21');
const today = C.todayStr();
const yesterday = C.daysAgoStr(1);
const habit = { frequency: { type: 'daily' }, history: [C.daysAgoStr(2), yesterday, today] };
assert.strictEqual(C.getStats(habit).current, 3);
assert.strictEqual(C.getStats(habit).longest, 3);
const broken = { frequency: { type: 'daily' }, history: [C.daysAgoStr(3), C.daysAgoStr(1), today] };
assert.strictEqual(C.getStats(broken).current, 2);
console.log('streak-core tests: PASS');
