import React from 'react';
import { Flame, Clock, HelpCircle, CalendarCheck } from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import DomainBars from '@/components/progress/DomainBars';
import ForecastChart from '@/components/progress/ForecastChart';
import { useStudy } from '@/lib/StudyContext';
import { TOPICS } from '@/lib/syllabus';
import { formatMinutes, mastery, progressMap } from '@/lib/scheduler';

export default function Progress() {
  const { progress, stats, plan } = useStudy();
  const map = progressMap(progress);

  const weakest = TOPICS.map((topic) => ({ topic, score: mastery(topic, map[topic.id]) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const tiles = [
    { icon: Flame, label: 'Current streak', value: `${stats.streak} days`, tone: 'text-gold' },
    { icon: Clock, label: 'Time studied', value: formatMinutes(stats.totalMinutes), tone: 'text-primary' },
    { icon: CalendarCheck, label: 'Study days logged', value: `${stats.studyDays}`, tone: 'text-sage' },
    {
      icon: HelpCircle,
      label: 'Question recall',
      value: stats.questionAccuracy === null ? '—' : `${stats.questionAccuracy}%`,
      tone: 'text-clay'
    }
  ];

  return (
    <div className="space-y-5">
      <header className="panel flex flex-wrap items-center justify-between gap-6 p-6">
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Where you stand</p>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Progress and readiness</h1>
          <p className="mt-2 max-w-xl text-[0.92rem] leading-relaxed text-muted-foreground">
            {stats.masteredTopics} of {stats.totalTopics} topics are mastered and {stats.startedTopics} are in
            progress. Readiness weights each area by how much of the exam it carries.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip">{stats.level.name}</span>
            <span className="chip">{stats.xp} points</span>
            {stats.level.next ? (
              <span className="chip">{stats.level.toNext} points to {stats.level.next}</span>
            ) : null}
            {plan?.exam_date ? <span className="chip">Exam {plan.exam_date}</span> : null}
          </div>
        </div>
        <ProgressRing value={stats.readiness} label={`${stats.readiness}%`} caption="exam ready" size={132} thickness={10} />
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className="panel p-4">
              <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                <Icon className={`h-3.5 w-3.5 ${tile.tone}`} />
                <span className="truncate">{tile.label}</span>
              </div>
              <p className="mt-2 font-heading text-2xl leading-none">{tile.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-heading text-2xl">Mastery by skill area</h2>
          <div className="mt-5">
            <DomainBars domains={stats.domains} />
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-heading text-2xl">Revision forecast</h2>
          <p className="mt-1 text-[0.85rem] text-muted-foreground">
            What is already scheduled over the next two weeks.
          </p>
          <div className="mt-5">
            <ForecastChart rows={stats.forecast} />
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="font-heading text-2xl">Your five weakest topics</h2>
        <p className="mt-1 text-[0.85rem] text-muted-foreground">
          Weakest first — these are where the next revision will pay off most.
        </p>
        <ul className="mt-4 space-y-3">
          {weakest.map(({ topic, score }) => (
            <li key={topic.id} className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9rem]">{topic.title}</p>
                <p className="text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">{topic.domainName}</p>
              </div>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:w-40">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.round(score * 100)}%` }} />
              </div>
              <span className="w-10 text-right text-[0.78rem] text-muted-foreground">
                {Math.round(score * 100)}%
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[0.78rem] text-muted-foreground">
          Every question in your bank: {stats.questionCount} active, {stats.completedTasks} revision blocks logged
          across {stats.studyDays} study days.
        </p>
      </div>
    </div>
  );
}