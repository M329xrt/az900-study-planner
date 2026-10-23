import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Sun as SunIcon,
  ListChecks,
  HelpCircle,
  TrendingUp,
  Settings as SettingsIcon,
  Flame,
  CloudOff,
  Moon,
  RefreshCw
} from 'lucide-react';
import { StudyProvider, useStudy } from '@/lib/StudyContext';
import useTheme from '@/hooks/useTheme';
import { daysUntilExam } from '@/lib/scheduler';
import { pickQuote } from '@/lib/quotes';
import { maybeNotify } from '@/lib/notifications';
import ExamSetup from '@/components/ExamSetup';
import NudgeCard from '@/components/NudgeCard';

const NAV = [
  { to: '/', label: 'Today', icon: SunIcon },
  { to: '/topics', label: 'Topics', icon: ListChecks },
  { to: '/questions', label: 'Questions', icon: HelpCircle },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: SettingsIcon }
];

function NavItems({ orientation = 'sidebar' }) {
  return NAV.map((item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          } ${orientation === 'bottom' ? 'flex-col gap-1 rounded-xl px-2 py-1.5 text-[0.62rem]' : ''}`
        }
      >
        <Icon className={orientation === 'bottom' ? 'h-[18px] w-[18px]' : 'h-4 w-4'} />
        <span className={orientation === 'bottom' ? 'tracking-wide' : ''}>{item.label}</span>
      </NavLink>
    );
  });
}

function Shell() {
  const { plan, loading, online, pending, stats, todayPlan, today, sync } = useStudy();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const check = () =>
      maybeNotify({
        plan,
        dueTopics: todayPlan.dueTopicCount,
        dueQuestions: todayPlan.dueQuestionCount,
        streak: stats.streak,
        readinessPct: stats.readiness,
        today
      });

    check();
    const interval = setInterval(() => {
      if (document.visibilityState === 'hidden') check();
    }, 15 * 60 * 1000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', check);
    };
  }, [plan, todayPlan.dueTopicCount, todayPlan.dueQuestionCount, stats.streak, stats.readiness, today]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-primary" />
      </div>
    );
  }

  if (!plan) return <ExamSetup />;

  const examDays = daysUntilExam(plan.exam_date, today);
  const quote = pickQuote(today);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1240px] gap-6 px-4 pb-28 pt-5 lg:px-8 lg:pb-10 lg:pt-8">
        <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-[240px] shrink-0 flex-col justify-between lg:flex">
          <div>
            <div className="flex items-center gap-3 px-2">
              <img src="/mark.svg" alt="" className="h-9 w-9 rounded-xl" />
              <div>
                <p className="font-heading text-xl leading-none">Momentum</p>
                <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">AZ-900 planner</p>
              </div>
            </div>

            <nav className="mt-8 space-y-1">
              <NavItems />
            </nav>
          </div>

          <div className="space-y-4 px-2">
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">Exam in</p>
              <p className="mt-1 font-heading text-3xl leading-none">
                {examDays === null ? '—' : examDays <= 0 ? 'Today' : `${examDays} days`}
              </p>
              <div className="mt-3 flex items-center justify-between text-[0.72rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-gold" />
                  {stats.streak} day streak
                </span>
                <span>{stats.readiness}% ready</span>
              </div>
            </div>

            <p className="font-heading text-[0.95rem] leading-snug text-muted-foreground">{quote.text}</p>

            <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Moon className="h-3.5 w-3.5" />
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              {!online ? (
                <span className="inline-flex items-center gap-1.5 text-clay">
                  <CloudOff className="h-3.5 w-3.5" />
                  Offline
                </span>
              ) : pending ? (
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Syncing
                </span>
              ) : null}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <img src="/mark.svg" alt="" className="h-8 w-8 rounded-lg" />
              <div>
                <p className="font-heading text-lg leading-none">Momentum</p>
                <p className="text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {examDays === null ? 'AZ-900' : examDays <= 0 ? 'Exam today' : `${examDays} days to go`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!online ? <CloudOff className="h-4 w-4 text-clay" /> : null}
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-gold" />
                {stats.streak}
              </span>
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={toggle}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Outlet />

          {pending && online ? (
            <p className="mt-8 text-center text-[0.72rem] text-muted-foreground">
              Syncing {pending} saved change{pending > 1 ? 's' : ''}…
            </p>
          ) : null}
          {!online ? (
            <p className="mt-8 text-center text-[0.72rem] text-muted-foreground">
              You are offline. Everything keeps working and your changes sync when the signal returns.
            </p>
          ) : null}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between px-3 py-2">
          <NavItems orientation="bottom" />
        </div>
      </nav>

      <NudgeCard />
    </div>
  );
}

export default function AppShell() {
  return (
    <StudyProvider>
      <Shell />
    </StudyProvider>
  );
}