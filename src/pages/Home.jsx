import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TodayHeader from '@/components/today/TodayHeader';
import PlanCard from '@/components/today/PlanCard';
import StatsRow from '@/components/today/StatsRow';
import ReflectionCard from '@/components/today/ReflectionCard';
import MethodPanel from '@/components/today/MethodPanel';
import { useStudy } from '@/lib/StudyContext';
import {
  confidenceForRating,
  progressMap,
  scheduleAfterReview,
  statusForReview
} from '@/lib/scheduler';
import { bigCelebrate, celebrate } from '@/lib/celebrate';
import { pickQuote } from '@/lib/quotes';

export default function Home() {
  const { plan, progress, todayPlan, today, doneKeys, saveProgress, logStudy } = useStudy();
  const map = progressMap(progress);
  const done = new Set(doneKeys);
  const allDone = todayPlan.items.length > 0 && todayPlan.items.every((item) => done.has(item.key));
  const celebrated = useRef(false);

  useEffect(() => {
    if (allDone && !celebrated.current) {
      celebrated.current = true;
      bigCelebrate();
    }
  }, [allDone]);

  const complete = async (item, { minutes, rating = 'good' } = {}) => {
    const topic = item.topic;
    const isTopicWork = topic && (item.type === 'review' || item.type === 'new');

    if (isTopicWork) {
      const record = map[topic.id];
      const schedule = scheduleAfterReview({
        stage: record?.review_stage || 0,
        rating,
        examDate: plan?.exam_date,
        today
      });
      const checklistComplete = (record?.checklist_done || []).length === topic.focus.length;
      await saveProgress(topic.id, {
        status: statusForReview({
          currentStatus: record?.status || 'not_started',
          stage: schedule.review_stage,
          rating,
          checklistComplete
        }),
        confidence: confidenceForRating(record?.confidence || 2, rating),
        review_stage: schedule.review_stage,
        last_studied_date: today,
        next_review_date: schedule.next_review_date,
        times_studied: (record?.times_studied || 0) + 1
      });
    }

    await logStudy({
      minutes: minutes ?? item.minutes,
      tasks: 1,
      topicIds: topic ? [topic.id] : [],
      taskKey: item.key
    });
    celebrate();
  };

  const quote = pickQuote(`done:${today}`);

  return (
    <div className="space-y-5">
      <TodayHeader />

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-2xl">Today’s plan</h2>
          <span className="text-[0.75rem] text-muted-foreground">
            {done.size}/{todayPlan.items.length} done
          </span>
        </div>

        {todayPlan.items.length ? (
          todayPlan.items.map((item) => (
            <PlanCard key={item.key} item={item} done={done.has(item.key)} onComplete={complete} />
          ))
        ) : (
          <div className="panel p-6">
            <h3 className="font-heading text-2xl">Nothing due today.</h3>
            <p className="mt-2 max-w-lg text-[0.9rem] leading-relaxed text-muted-foreground">
              Your schedule has nothing waiting, and that is on purpose — the rest days are part of the plan. If you
              feel like getting ahead, you can open the next topic yourself.
            </p>
            <Button asChild variant="secondary" className="mt-4 rounded-full">
              <Link to="/topics">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Get ahead on a topic
              </Link>
            </Button>
          </div>
        )}

        {allDone ? (
          <div className="panel animate-rise-in p-6">
            <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Today is done
            </div>
            <h3 className="mt-2 font-heading text-2xl">Everything scheduled is revised. Genuinely done.</h3>
            <p className="mt-3 font-heading text-[1.05rem] leading-snug text-muted-foreground">
              “{quote.text}”
            </p>
            <p className="mt-1 text-[0.72rem] text-muted-foreground">— {quote.author}</p>
          </div>
        ) : null}
      </section>

      <StatsRow />
      <ReflectionCard />
      <MethodPanel />
    </div>
  );
}