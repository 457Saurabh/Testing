# STREAK

**STREAK** is a single-file, browser-based habit tracker focused on
consistency, streaks, minimum viable actions, behavioral evidence, habit
stacking, experiments, notes, and long-term analytics.

The application is designed to work without a backend or account. Your
working data is stored locally in the browser.

------------------------------------------------------------------------

## 1. What STREAK Is

STREAK combines a traditional habit tracker with a lightweight
behavioral-analysis system.

Instead of only asking:

> "Did I complete the habit?"

it also tracks:

-   how often the habit is completed
-   whether completion was **Full** or **Minimum**
-   streak length and best streak
-   missed days and failure reasons
-   completion timing
-   duration/time spent
-   notes and habit mentions
-   contextual factors recorded in notes
-   habit lifecycle stage
-   relationships between habits
-   controlled habit experiments
-   evidence-based behavioral suggestions
-   milestones and badges

The main workflow is:

**Create habit → define target/minimum/cue → check in → record context →
review evidence → experiment → refine the habit.**

------------------------------------------------------------------------

# 2. Main Dashboard

## Today Command Center

The **Today** section is the primary daily workspace.

It provides:

-   current date
-   visual completion percentage
-   completed habits / total habits
-   remaining habits
-   Full vs Minimum completion breakdown
-   contextual status message
-   habit priority ordering
-   next-best-action guidance
-   category/habit filters
-   quick check-in controls

The progress ring gives an immediate visual indication of how much of
today's scheduled work is complete.

### Habit filtering

The dashboard shows habits by default.

Filters can be used to narrow the displayed habits by:

-   All
-   Uncategorized
-   frequently used/top habit categories
-   additional categories through the **More...** menu
-   lifecycle states such as Paused and Archived where applicable

Filtering changes what is displayed; it does not delete or modify
habits.

------------------------------------------------------------------------

# 3. Habit Cards

Each habit is represented by a card containing the information needed
for daily execution and review.

A habit can include:

-   habit name
-   description
-   category
-   target
-   minimum version
-   identity statement
-   if-then implementation intention
-   frequency
-   current streak
-   best streak
-   completion status
-   completion mode
-   habit chain
-   progress toward milestones
-   cue/stack information
-   behavioral insights
-   lifecycle state
-   analytics

## Full completion

A normal check-in records the habit as **Full**.

Example:

> Study for 60 minutes.

## Minimum completion

A habit can define a smaller fallback behavior.

Example:

> Full target: Study for 60 minutes\
> Minimum: Study for 10 minutes

Minimum completion is designed for difficult days where maintaining
continuity is more important than achieving the full target.

The system distinguishes Full and Minimum rather than treating them as
identical outcomes.

------------------------------------------------------------------------

# 4. Streak System

STREAK tracks:

-   current streak
-   best streak
-   daily completion history
-   weekly frequency targets
-   Full completions
-   Minimum completions
-   missed opportunities
-   recovery behavior

The habit chain provides a visual sequence of historical days.

Different states can represent:

-   Full
-   Minimum
-   Missed
-   Frozen
-   Today

Clicking historical chain cells can provide access to the corresponding
day information.

------------------------------------------------------------------------

# 5. Minimum Mode and Hard Days

STREAK includes a **minimum version** for each habit.

This creates a fallback behavior for difficult days.

When a habit is at risk, the application can surface a hard-day/minimum
action such as:

> Don't quit. Do the minimum.

This is useful when the normal target is unrealistic for the current
day.

The system separately records Minimum completions so long-term analysis
can distinguish:

-   full execution
-   reduced execution
-   missed execution

------------------------------------------------------------------------

# 6. Failure Logging

When a habit is missed, STREAK can ask:

> What got in the way?

The failure system records structured reasons so repeated obstacles can
be analyzed later.

Failure data can contribute to:

-   failure-pattern detection
-   recommendations
-   target-problem detection
-   behavioral intelligence
-   experiment design

The purpose is not to punish a missed day; it is to turn repeated
failures into usable evidence.

------------------------------------------------------------------------

# 7. Habit Notes

The Notes section provides a daily reflection log.

A note can contain:

-   free-form text
-   habit mentions
-   optional context
-   date/time information

Example:

``` text
@Study
I was tired after school, so I only completed the minimum.
```

## Habit tagging

Use:

``` text
@HabitName
```

to associate a note with a habit.

The system can detect habit mentions and maintain habit IDs/tags for
filtering and analysis.

## Compact note display

Long notes are automatically condensed in the note list.

The default view keeps the note compact and expands it when the user
selects the relevant **Read more / Show less** control.

This prevents long reflections from dominating the dashboard.

## Tag overflow

The Notes filter area keeps the most important tags visible.

When there are many habit tags:

-   the first four remain visible
-   additional tags are placed inside a **More / +N** menu
-   the menu can be used to filter by the hidden tags

This keeps the Notes interface usable as the number of habits grows.

------------------------------------------------------------------------

# 8. Notes Search and Filtering

Notes can be filtered using:

-   text search
-   start date
-   end date
-   habit tags

The filter bar also shows the number of matching entries.

The **Clear** control resets the filters.

Notes can be exported independently using **Export log**.

------------------------------------------------------------------------

# 9. Optional Note Context

A note can contain structured contextual information.

This allows STREAK to connect subjective reflections with habit
outcomes.

Context can help answer questions such as:

-   Did this habit work better in the morning?
-   Does poor sleep appear alongside missed sessions?
-   Does location affect consistency?
-   Does a particular mood or situation correlate with completion?

The system uses repeated observations before generating context-based
insights.

------------------------------------------------------------------------

# 10. Today Priority System

STREAK does not simply display habits in an arbitrary order.

The Today Command Center calculates habit priority and can surface a
**Next Best Action**.

The recommendation can consider factors such as:

-   whether the habit is already completed
-   whether it is due today
-   current streak status
-   risk of losing continuity
-   minimum availability
-   weekly frequency requirements
-   habit lifecycle
-   active experiments
-   behavioral evidence

The goal is to reduce decision overhead during the daily check-in
process.

------------------------------------------------------------------------

# 11. Tomorrow Preview

The Today area can provide a preview of tomorrow's scheduled habits.

This helps users see upcoming workload before finishing the current day.

------------------------------------------------------------------------

# 12. Weekly Review

STREAK includes a weekly review workflow.

The review can capture:

### What worked

Example:

> Doing it immediately after coffee.

### What didn't work

Example:

> Evenings kept getting skipped.

### What to adjust

Example:

> Move it to the morning.

The review can also provide:

-   weekly behavior intelligence
-   contextual observations
-   lifecycle suggestions
-   habit-stack observations
-   minimum-behavior guidance

The review can be saved or skipped.

------------------------------------------------------------------------

# 13. Analytics and Insights

The **Analytics & Insights** section contains historical information
including:

-   30-day heatmap
-   weekly trends
-   badges
-   consistency statistics
-   perfect days
-   perfect-day streak
-   streak wave/trend
-   Full vs Minimum vs Missed breakdown
-   habit-level analytics

The historical section is intentionally separate from the daily command
center so daily execution remains focused.

------------------------------------------------------------------------

# 14. Habit Analytics

STREAK calculates multiple habit-level metrics.

The analytics system includes measurements for:

-   consistency
-   recent trend
-   recovery rate
-   time-of-day performance
-   failure distribution
-   duration/time metrics
-   completion modes
-   opportunity dates
-   outcome distribution
-   experiment performance
-   overall habit health

The application also provides supporting evidence instead of presenting
every insight as a simple unexplained score.

------------------------------------------------------------------------

# 15. Behavior Intelligence

STREAK contains an explainable behavior-intelligence layer.

It looks for repeated patterns in historical habit evidence.

The system can identify:

-   recurring failure patterns
-   timing patterns
-   consistency patterns
-   minimum-vs-full behavior
-   contextual relationships
-   habit-stack relationships
-   actionable opportunities

Recommendations can include actions such as:

-   applying the minimum version
-   trying a controlled experiment
-   reviewing a target
-   changing a cue
-   changing a habit anchor

Insights can be:

-   accepted
-   dismissed
-   snoozed
-   reviewed through their evidence

The system also exposes a **Why am I seeing this?** explanation with
sample-size/data-quality information where available.

------------------------------------------------------------------------

# 16. Target Problem Detection

STREAK can detect when a habit's configured target may be creating a
repeated execution problem.

The target-problem workflow can offer:

-   **Review target**
-   **Not now**

The detection uses historical completion/minimum behavior rather than
only the user's most recent day.

------------------------------------------------------------------------

# 17. Habit Context Analysis

Notes can be analyzed alongside habit outcomes.

STREAK can associate relevant notes with a habit and examine repeated
context.

Context analysis can surface:

-   number of related notes
-   notes containing structured context
-   successful days
-   failed days
-   repeated contextual factors

Evidence can be inspected before creating a context experiment.

------------------------------------------------------------------------

# 18. Habit Lifecycle

Every habit can move through a lifecycle:

1.  **Building**
2.  **Stabilizing**
3.  **Maintaining**
4.  **Paused**
5.  **Archived**

## Building

The habit is being established.

## Stabilizing

The habit has started working and is being made more reliable.

## Maintaining

The habit is sufficiently established for maintenance.

## Paused

The habit is temporarily inactive.

Paused habits can later be resumed.

## Archived

The habit is kept as historical information but is removed from the
normal active workflow.

Archived habits are not counted in the normal daily list or active
streak statistics.

Lifecycle history is retained.

------------------------------------------------------------------------

# 19. Habit Stacking

STREAK supports habit stacking.

A habit can be configured to happen after another habit.

Example:

``` text
Drink water → Study
```

The first habit becomes the anchor and the second becomes the target
behavior.

The application analyzes historical timing to understand whether the
configured order appears consistent with observed behavior.

------------------------------------------------------------------------

# 20. Stack Evidence

Habit-stack analysis can examine:

-   how often both habits were completed
-   whether the anchor was completed
-   whether the target was completed
-   the observed order
-   timing relationships
-   evidence over a recent historical window

Users can open **View evidence** to inspect the underlying observations.

------------------------------------------------------------------------

# 21. Reverse Stack Detection

STREAK can detect situations where the configured stack order may not
match observed behavior.

For example, if the application is configured:

``` text
A → B
```

but historical check-in times repeatedly show:

``` text
B → A
```

the application can present evidence for the possible reverse
relationship.

A **Reverse Stack** workflow can then be used if the user wants to
change the relationship.

The application also prevents circular habit dependencies.

------------------------------------------------------------------------

# 22. Habit Experiments

STREAK includes a controlled experiment system.

An experiment asks the user to change **one variable** and observe the
result.

Possible variables include:

-   Target
-   Cue
-   Time
-   Minimum

Experiment durations can be:

-   7 days
-   14 days
-   21 days

The user defines:

-   hypothesis
-   change from
-   change to
-   duration
-   success criteria

A baseline from recent behavior is calculated before comparison.

------------------------------------------------------------------------

# 23. Experiment Results

When an experiment ends, STREAK can compare:

**Before**

against

**Experiment**

The result view can show:

-   baseline completion rate
-   experiment completion rate
-   number of completed days
-   total observed days
-   change/delta
-   success criteria
-   subjective reflection notes

The user can then choose an action such as:

-   keep the setup
-   modify and run another experiment
-   return to the previous setup
-   try a different change
-   end the experiment

Experiment history remains available for later review.

------------------------------------------------------------------------

# 24. Habit Calendar

Each habit has a detailed calendar view.

The calendar can show historical daily states such as:

-   completed
-   minimum
-   missed
-   frozen
-   today

The calendar also provides statistics including:

-   total completed days
-   Full days
-   Minimum days
-   Missed days
-   current streak
-   best streak
-   total recorded time where available

Lifecycle information is also available in the habit calendar/details
view.

------------------------------------------------------------------------

# 25. Milestones

STREAK includes milestone tracking.

Milestones can trigger recognition when a habit reaches important streak
lengths.

Users can also create **custom milestones**.

For example:

``` text
21 days
50 days
100 days
365 days
```

Custom milestones can be added and removed from Settings.

Milestone completion can produce a dedicated celebration dialog.

------------------------------------------------------------------------

# 26. Badges

The Analytics section includes a badge wall.

Badges are displayed per habit and can represent achievement milestones.

Unlocked badges are visually distinguished from locked/unearned badges.

------------------------------------------------------------------------

# 27. Onboarding

New users can go through a guided onboarding process.

The onboarding helps define:

1.  improvement area
2.  specific behavior
3.  minimum version
4.  cue/time
5.  identity statement
6.  name
7.  first habit

The onboarding also provides examples to reduce the difficulty of
creating the first habit.

The final step summarizes the habit before creation.

------------------------------------------------------------------------

# 28. Add Habit

New habits can be created from the **Add habit** control.

A habit can contain:

-   name
-   description
-   full target
-   minimum version
-   if-then plan
-   identity statement
-   frequency
-   category
-   color
-   habit-stack anchor

Frequency can be configured as:

-   daily
-   weekly with a target number of days

------------------------------------------------------------------------

# 29. Edit Habit

Existing habits can be edited.

The edit interface supports changes to:

-   name
-   color
-   full target
-   minimum
-   if-then plan
-   identity
-   category
-   stack anchor

This allows the habit definition to evolve without deleting its
historical record.

------------------------------------------------------------------------

# 30. Habit Colors

Each habit can have its own color.

Colors are used throughout the interface for:

-   habit cards
-   streak indicators
-   progress
-   calendar cells
-   badges
-   visual identification

A color picker is available when editing a habit.

------------------------------------------------------------------------

# 31. Freeze / Streak Protection

The application includes freeze-related streak functionality.

Frozen days are represented separately from normal completions and are
visible in chain/calendar views.

This allows the history to distinguish a protected/frozen day from a
normal completion.

------------------------------------------------------------------------

# 32. Time and Duration Tracking

STREAK records check-in timing and can record duration information where
provided.

This enables analytics such as:

-   time-of-day performance
-   total duration
-   duration trends
-   completion timing relationships
-   habit-stack timing analysis

------------------------------------------------------------------------

# 33. Cue and Time-of-Day Nudges

STREAK supports time-of-day nudges based on a habit's usual check-in
behavior.

The Settings panel allows these nudges to be enabled or disabled.

Browser notifications are separately configurable.

------------------------------------------------------------------------

# 34. Sound

Sound feedback can be enabled or disabled.

The application can use audio feedback for relevant events such as
check-ins and milestone interactions.

Sound is controlled from Settings.

------------------------------------------------------------------------

# 35. Themes

STREAK supports:

-   Dark theme
-   Light theme

The selected theme is stored as a preference.

The UI uses CSS custom properties so the major interface components
adapt consistently between themes.

------------------------------------------------------------------------

# 36. Reduced Motion

The interface includes a reduced-motion mode in its styling system.

When reduced motion is enabled by the application state, animations are
disabled to make the interface less visually dynamic.

------------------------------------------------------------------------

# 37. Keyboard Shortcuts

Default shortcuts are:

  Key     Action
  ------- ---------------------
  `S`     Open Settings
  `N`     Jump to Notes
  `A`     Add a habit
  `F`     Focus note search
  `G`     Jump to Analytics
  `Esc`   Close panels/modals

Shortcuts can be rebound from Settings.

Shortcuts are ignored while the user is typing in an input field.

------------------------------------------------------------------------

# 38. Data Storage

STREAK is designed as a local-first application.

The interface explicitly states that application data is stored in the
browser using **localStorage**.

This means:

-   no required account
-   no required backend
-   data is associated with the browser/device where it was created
-   clearing browser storage can remove the local data
-   moving data to another browser/device requires export or manual sync

Because local browser storage is not a substitute for backup, regular
exports are recommended for important data.

------------------------------------------------------------------------

# 39. Backup and Recovery

STREAK provides several data-management options.

## JSON backup

Exports the complete application state in a structured backup format.

This is the primary full-data backup format.

## CSV

Exports habit-oriented data in spreadsheet-compatible form.

CSV can be useful for:

-   spreadsheet analysis
-   external data processing
-   archival
-   importing structured habit records

## Text summary

Exports a human-readable `.txt` summary of habit information and
historical status.

## Share backup

Where supported by the browser/device, a backup can be shared through
the operating system/browser share interface.

Otherwise, the application falls back to a normal download.

------------------------------------------------------------------------

# 40. Automatic Backups

STREAK supports automatic backup behavior.

The user can configure an interval measured in days since opening the
application.

The application can also support choosing a backup folder where the
browser provides the required file-system capability.

If folder access is unavailable or cannot be reused, the application can
fall back to a normal downloaded backup.

------------------------------------------------------------------------

# 41. Scheduled Backup

A scheduled backup option is available.

The user can specify:

-   date
-   time

The Settings panel displays the current scheduled-backup status.

------------------------------------------------------------------------

# 42. Import

The application supports importing:

-   JSON backups
-   CSV data

Importing replaces the currently stored data after confirmation.

Because import can replace existing browser data, a current backup
should be created before importing another dataset.

------------------------------------------------------------------------

# 43. Manual Device Sync

STREAK provides account-free manual synchronization.

The process is:

1.  Open **Sync across devices**.
2.  Generate the sync code.
3.  Copy the code.
4.  Open STREAK on another device/browser.
5.  Paste the code.
6.  Import it.

The sync mechanism is intentionally manual and does not require an
online account.

Importing a sync code replaces the current data in that browser.

------------------------------------------------------------------------

# 44. Data Deletion

Two destructive operations are protected by explicit confirmation.

## Delete one habit

The user must type the habit name exactly before deletion.

This removes the habit and its associated streak history.

## Erase all data

The user must type:

``` text
ERASE ALL
```

before all browser-stored STREAK data is erased.

These confirmations reduce accidental destructive actions.

------------------------------------------------------------------------

# 45. Responsive Design

The interface includes responsive styling for smaller screens.

The application adapts:

-   Today section spacing
-   progress ring size
-   category filters
-   habit cards
-   streak chains
-   modal widths
-   analytics layouts

The goal is to keep the same core workflow usable on desktop and
mobile-sized screens.

------------------------------------------------------------------------

# 46. Visual Design System

STREAK uses a compact productivity-oriented visual language.

Primary design characteristics include:

-   neutral background
-   restrained borders
-   compact typography
-   JetBrains Mono for data-oriented elements
-   Inter for interface text
-   colored habit accents
-   rounded cards
-   small status badges
-   subtle shadows
-   lightweight animations
-   clear hierarchy between execution and analytics

The Today Command Center has a dedicated visual treatment so the daily
workflow is visually separated from historical analysis.

------------------------------------------------------------------------

# 47. Single-File Architecture

The application is intentionally packaged as a single HTML file.

The file contains:

-   HTML structure
-   CSS
-   JavaScript
-   UI components
-   application state handling
-   analytics
-   persistence
-   import/export logic

External font resources are referenced from Google Fonts.

Because the application is self-contained at the code level, it can be
opened directly in a modern browser without a build step.

------------------------------------------------------------------------

# 48. Browser Technologies Used

The implementation uses standard browser technologies including:

-   HTML5
-   CSS3
-   JavaScript
-   localStorage
-   browser notification APIs where supported
-   Web Audio API where supported
-   File APIs
-   browser share capabilities where supported
-   File System Access APIs where supported
-   IndexedDB for persisted backup-folder handles where supported
-   SVG for visual progress/chart elements

No server-side application is required for the core experience.

------------------------------------------------------------------------

# 49. Recommended Daily Workflow

A practical workflow is:

### Morning

1.  Open STREAK.
2.  Review Today progress.
3.  Check the highest-priority habit.
4.  Complete the Full target or Minimum version.
5.  Continue through the remaining habits.

### During the day

1.  Use the check-in controls.
2.  Record failures when something prevents completion.
3.  Add short notes when useful.
4.  Use `@HabitName` when a reflection relates to a specific habit.

### Evening

1.  Review remaining habits.
2.  Complete minimum versions where appropriate.
3.  Add a short reflection.
4.  Check tomorrow's preview.

### Weekly

1.  Open Weekly Review.
2.  Record what worked.
3.  Record what failed.
4.  Identify one adjustment.
5.  Review behavior intelligence and habit-stack evidence.
6.  Use experiments when a specific change is worth testing.

------------------------------------------------------------------------

# 50. Data Model --- Conceptual Overview

A habit can conceptually contain:

``` text
Habit
├── Identity
│   ├── name
│   ├── description
│   ├── category
│   └── color
│
├── Behavior definition
│   ├── target
│   ├── minimum
│   ├── if-then plan
│   ├── identity statement
│   └── frequency
│
├── History
│   ├── completion dates
│   ├── completion modes
│   ├── failure log
│   ├── check-in times
│   ├── durations
│   └── frozen dates
│
├── Lifecycle
│   ├── stage
│   └── lifecycle history
│
├── Relationships
│   └── anchor habit
│
└── Experiments
    ├── hypothesis
    ├── variable change
    ├── baseline
    ├── duration
    ├── criteria
    └── result
```

Notes are stored separately and can reference habits through tags/habit
IDs.

------------------------------------------------------------------------

# 51. Important Safety and Data Notes

STREAK is a productivity application, not a medical, financial, or
professional decision-making system.

Behavioral insights are based on the data recorded in the application.
Small sample sizes can produce weak or misleading patterns.

For reliable interpretation:

-   record data consistently
-   avoid changing several habit variables simultaneously when testing a
    hypothesis
-   treat recommendations as suggestions
-   inspect the underlying evidence
-   use experiments to validate important changes
-   maintain backups of important history

------------------------------------------------------------------------

# 52. Quick Feature Checklist

### Daily execution

-   [x] Today dashboard
-   [x] Progress ring
-   [x] Habit priority
-   [x] Full check-in
-   [x] Minimum check-in
-   [x] Streak tracking
-   [x] Habit chain
-   [x] Hard-day/minimum workflow
-   [x] Tomorrow preview

### Habit management

-   [x] Add habits
-   [x] Edit habits
-   [x] Delete habits
-   [x] Colors
-   [x] Categories
-   [x] Daily frequency
-   [x] Weekly frequency
-   [x] Target
-   [x] Minimum
-   [x] If-then plan
-   [x] Identity statement
-   [x] Habit stacking
-   [x] Lifecycle stages

### Notes

-   [x] Daily notes
-   [x] Habit tagging
-   [x] Tag filtering
-   [x] Search
-   [x] Date filtering
-   [x] Compact long-note display
-   [x] Tag overflow menu
-   [x] Optional context
-   [x] Note export

### Analytics

-   [x] 30-day heatmap
-   [x] Weekly trends
-   [x] Streak analytics
-   [x] Consistency metrics
-   [x] Perfect-day metrics
-   [x] Recovery analysis
-   [x] Time-of-day analysis
-   [x] Duration metrics
-   [x] Failure analysis
-   [x] Habit health
-   [x] Behavior intelligence
-   [x] Context analysis
-   [x] Stack evidence
-   [x] Experiment analysis

### Motivation

-   [x] Milestones
-   [x] Custom milestones
-   [x] Badges
-   [x] Milestone celebration
-   [x] Progress feedback
-   [x] Optional sound

### Data

-   [x] Local browser storage
-   [x] JSON export
-   [x] CSV export
-   [x] Text summary export
-   [x] JSON import
-   [x] CSV import
-   [x] Manual device sync
-   [x] Automatic backup
-   [x] Scheduled backup
-   [x] Share backup
-   [x] Full data deletion

### Interface

-   [x] Light theme
-   [x] Dark theme
-   [x] Responsive layout
-   [x] Keyboard shortcuts
-   [x] Reduced-motion support
-   [x] Toast notifications
-   [x] Modal workflows
-   [x] Compact filters
-   [x] Mobile-friendly layouts

------------------------------------------------------------------------

# 53. Project Philosophy

STREAK is built around a simple principle:

> **Consistency is data, not just a feeling.**

A missed day is not only a failure state. It can become evidence.

A minimum completion is not treated as a full completion, but it can
preserve continuity.

A note is not only a diary entry. When linked to a habit and repeated
over time, it can become contextual evidence.

An experiment is not just a feature. It provides a structured way to
test whether changing one part of a habit actually changes behavior.

The result is a tracker intended to move from:

**tracking → reflection → evidence → experimentation → habit
refinement.**

------------------------------------------------------------------------

## Project File

The application is distributed as a single HTML file:

``` text
STREAK_SINGLE_FILE(1).html
```

Open the HTML file in a modern browser to run the application.

No installation or build process is required for the core application.
