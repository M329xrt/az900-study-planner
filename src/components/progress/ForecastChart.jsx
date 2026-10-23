import React from 'react';
import { toISODate } from '@/lib/scheduler';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Plain CSS bars — no chart library, no canvas, no battery cost. */
export default function ForecastChart({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.count || 0));
  const today = toISODate();

  return (
    <div>
      <div className="flex items-end gap-1 sm:gap-2">
        {rows.map((row) => {
          const height = row.count ? Math.max(8, Math.round((row.count / max) * 100)) : 3;
          const isToday = row.date === today;
          return (
            <div key={row.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-24 w-full items-end justify-center">
                <div
                  title={`${row.count} item${row.count === 1 ? '' : 's'} due on ${row.date}`}
                  className={`w-full rounded-t-md transition-[height] duration-500 ease-out ${
                    isToday ? 'bg-gold' : row.count ? 'bg-primary/70' : 'bg-secondary'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span
                className={`text-[0.62rem] uppercase tracking-wide ${
                  isToday ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {WEEKDAYS[row.weekday]}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[0.72rem] text-muted-foreground">
        Bars show what already sits in the schedule for the next two weeks. The taller the bar, the more revision
        is waiting that day — nothing lands after your exam date.
      </p>
    </div>
  );
}