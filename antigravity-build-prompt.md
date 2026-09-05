# Build Prompt for Antigravity: Self-Improvement Tracker & Leaderboard App

## Project Overview

Build a full-stack web application called a "Self-Improvement Tracker." Users log daily fitness activity, nutrition, and skill-learning progress. The app calculates a weekly composite score for each user and displays a leaderboard so friends can compare progress over time.

The core value proposition: gamify self-improvement (fitness + skill-building) through social accountability and competition.

---

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js with Express (or Next.js API routes if using Next.js for the frontend too — pick whichever keeps this a single deployable app)
- **Database**: PostgreSQL via Supabase (use Supabase for DB + Auth + Storage to avoid building auth from scratch)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Hosting target**: Vercel (frontend) + Supabase (backend/DB)
- **Notifications**: skip for MVP, stub the interface for later (OneSignal/FCM)

---

## MVP Feature Scope (build this first)

### 1. Authentication
- Sign up / log in / log out
- Basic profile: name, avatar, username

### 2. Daily Logging
- Steps walked today (manual number entry)
- Did you run today? (yes/no + optional distance)
- Calories burned today (manual entry)
- Food eaten today (free text list, each entry with an estimated calorie value entered manually)
- One log per user per day (editable until midnight, then locked)

### 3. Skill Tracking
- User can create custom "skills" (e.g. "Web Development")
- Each skill has sub-areas the user defines (e.g. "Frontend", "Backend") with a 0–100% self-reported progress slider per sub-area
- Daily log includes: which skill(s) did you work on today, and for how many minutes

### 4. Scoring Engine
Calculate a **Weekly Score (0–100)** per user, recomputed every Sunday night (or on-demand for the current week), using this formula:

```
Fitness Score   = min(100, (avg_daily_steps / step_goal) * 60 + (calories_burned_avg / calorie_goal) * 40)
Skill Score     = min(100, (total_minutes_this_week / weekly_minutes_goal) * 100)
Nutrition Score = 100 - penalty_for_days_without_logging_food

Weekly Score = (0.4 * Fitness Score) + (0.4 * Skill Score) + (0.2 * Nutrition Score)
```

- Let users set their own `step_goal`, `calorie_goal`, and `weekly_minutes_goal` per skill during onboarding (default sensible values if skipped)
- Store computed scores historically (don't just overwrite) so we can show trend lines later

### 5. Leaderboard
- A "friends" concept: users can add each other by username
- Leaderboard view scoped to a user's friend group, ranked by current week's score
- Show rank movement vs. last week (up/down arrow)

### 6. Dashboard (home screen)
- Today's logged stats at a glance
- This week's running score with a breakdown (fitness/skill/nutrition contribution)
- Quick "log today" button/form

---

## Database Schema (starting point — adjust as needed)

```
users
  id, email, username, display_name, avatar_url, created_at

user_goals
  user_id, step_goal, calorie_burn_goal, weekly_skill_minutes_goal

daily_logs
  id, user_id, log_date, steps, ran_today (bool), run_distance_km,
  calories_burned, created_at

food_entries
  id, daily_log_id, food_name, estimated_calories

skills
  id, user_id, name, created_at

skill_areas
  id, skill_id, name, progress_percent

skill_time_logs
  id, user_id, skill_id, log_date, minutes_spent

weekly_scores
  id, user_id, week_start_date, fitness_score, skill_score,
  nutrition_score, total_score, rank_in_friend_group

friendships
  id, user_id, friend_id, status (pending/accepted), created_at
```

---

## UI Requirements

- Clean, mobile-first responsive design — most logging will happen on phones
- Dashboard, Log Entry form, Skills page, Leaderboard page, Profile page as the five core screens
- Use a simple bottom nav bar on mobile, sidebar on desktop
- Score breakdowns should be visualized (simple bar or radial chart is fine) — don't just show a number

---

## Build Instructions for the Agent

1. Start by proposing the full database schema and confirming it before writing any code.
2. Set up authentication and a basic protected dashboard shell first — get login working end-to-end before building features.
3. Build the daily logging flow next (this is the core loop users will repeat).
4. Build the scoring engine as an isolated, testable function — write unit tests for the scoring formula with a few sample inputs before wiring it into the UI.
5. Build the skills tracking feature.
6. Build the friends + leaderboard feature last, since it depends on scores already existing.
7. After each major feature, run the app and verify it works before moving to the next.
8. Keep the codebase in a single repo with a clear folder structure (`/frontend`, `/backend` or `/app`, `/api` if using Next.js).

---

## Explicitly Out of Scope for MVP (do not build yet)

- Food photo AI calorie estimation
- Push notifications / nudges
- Badges and achievements
- Public shareable profile pages
- Health app (Google Fit/Apple Health) integration

These are planned as Phase 2 once the core loop is validated with real users.
