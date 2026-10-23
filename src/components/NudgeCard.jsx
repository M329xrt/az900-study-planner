import React from 'react';
import { X, Quote, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudy } from '@/lib/StudyContext';
import { buildNudge, markSeen, seenToday } from '@/lib/notifications';

/**
 * The in-app Duolingo-style nudge: a friendly interruption with today's plan and
 * a motivational quote. Dismissing it stays dismissed until tomorrow.
 */
export default function NudgeCard() {
  const { plan, todayPlan, stats, today, online, pending } = useStudy();

  if (!plan || !todayPlan?.items?.length) return null;
  if (seenToday(today)) return null;

  const nudge = buildNudge({
    dueTopics: todayPlan.dueTopicCount,
    dueQuestions: todayPlan.dueQuestionCount,
    planItems: todayPlan.items.length,
    streak: stats?.streak || 0,
    readinessPct: stats?.readiness || 0,
    style: plan.cheer_style || 'playful',
    seed: today
  });

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-24 z-40 flex justify-end lg:inset-x-auto lg:bottom-6 lg:right-8">
      <div className="panel pointer-events-auto w-full max-w-sm animate-rise-in p-5 shadow-[0_18px_50px_-24px_rgba(28,27,24,0.45)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            {nudge.title}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => markSeen(today)}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground">{nudge.body}</p>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-secondary/70 p-3">
          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
          <div>
            <p className="font-heading text-[0.98rem] leading-snug text-foreground">{nudge.quote.text}</p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">— {nudge.quote.author}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[0.72rem] text-muted-foreground">
            {todayPlan.totalMinutes} min planned
            {!online && pending ? ' · saved offline' : ''}
          </span>
          <Button size="sm" className="rounded-full px-4" onClick={() => markSeen(today)}>
            Let’s go
          </Button>
        </div>
      </div>
    </div>
  );
}