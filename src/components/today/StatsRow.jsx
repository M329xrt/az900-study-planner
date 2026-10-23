import React from 'react';
import { Flame, Zap, Clock, HelpCircle } from 'lucide-react';
import { useStudy } from '@/lib/StudyContext';
import { formatMinutes } from '@/lib/scheduler';

export default function StatsRow() {
  const { stats, todayPlan } = useStudy();

  const tiles = [
    {
      icon: Flame,
      tone: 'text-gold',
      label: 'Streak',
      value: `${stats.streak} day${stats.streak === 1 ? '' : 's'}`,
      detail: stats.streak ? 'Keep it alive' : 'Start one today'
    },
    {
      icon: Zap,
      tone: 'text-sage',
      label: stats.level.name,
      value: `${stats.xp} pts`,
      detail: stats.level.next ? `${stats.level.toNext} to ${stats.level.next}` : 'Top level reached'
    },
    {
      icon: Clock,
      tone: 'text-primary',
      label: 'Last 7 days',
      value: formatMinutes(stats.weekMinutes),
      detail: `${formatMinutes(stats.totalMinutes)} in total`
    },
    {
      icon: HelpCircle,
      tone: 'text-clay',
      label: 'Questions due',
      value: `${todayPlan.dueQuestionCount}`,
      detail: stats.questionAccuracy === null ? 'No reviews yet' : `${stats.questionAccuracy}% recalled`
    }
  ];

  return (
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
            <p className="mt-1.5 text-[0.72rem] text-muted-foreground">{tile.detail}</p>
          </div>
        );
      })}
    </div>
  );
}