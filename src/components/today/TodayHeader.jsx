import React from 'react';
import { Flame, Target } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import { useAuth } from '@/lib/AuthContext';
import { useStudy } from '@/lib/StudyContext';
import { displayName } from '@/lib/userName';
import { formatMinutes } from '@/lib/scheduler';

function greeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayHeader() {
  const { plan, todayPlan, stats, todaySession } = useStudy();
  const { user } = useAuth();
  const minutesToday = todaySession?.minutes || 0;
  const target = plan?.daily_minutes || 45;
  const pct = Math.min(100, Math.round((minutesToday / target) * 100));
  const examDays = todayPlan.examDays;
  const name = displayName(user);

  return (
    <header className="panel p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight sm:text-4xl">
            {greeting(new Date().getHours())}
            {name ? `, ${name}` : ''}.
          </h1>
          <p className="mt-2 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
            {todayPlan.items.length
              ? `${todayPlan.items.length} block${todayPlan.items.length > 1 ? 's' : ''} planned — about ${formatMinutes(todayPlan.totalMinutes)} of focused work.`
              : 'Nothing is due today. Rest properly, or get ahead on the next topic.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="chip">
              <Target className="h-3 w-3" />
              {examDays === null ? 'No exam date' : examDays <= 0 ? 'Exam is today' : `${examDays} days to the exam`}
            </span>
            <span className="chip">
              <Flame className="h-3 w-3 text-gold" />
              {stats.streak} day streak
            </span>
            <span className="chip">{stats.level.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <ProgressRing
            value={pct}
            label={`${pct}%`}
            caption="today"
            size={116}
            thickness={9}
            tone={pct >= 100 ? 'gold' : 'primary'}
          />
          <div className="hidden sm:block">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">Focused today</p>
            <p className="mt-1 font-heading text-2xl">{formatMinutes(minutesToday)}</p>
            <p className="mt-1 text-[0.78rem] text-muted-foreground">of {formatMinutes(target)} planned</p>
            <p className="mt-3 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">Exam readiness</p>
            <p className="mt-1 font-heading text-2xl">{stats.readiness}%</p>
          </div>
        </div>
      </div>
    </header>
  );
}