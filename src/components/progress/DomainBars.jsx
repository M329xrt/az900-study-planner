import React from 'react';

export default function DomainBars({ domains }) {
  return (
    <div className="space-y-5">
      {domains.map((domain) => (
        <div key={domain.id}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[0.9rem]">{domain.name}</p>
            <p className="text-[0.75rem] text-muted-foreground">
              {domain.mastered}/{domain.total} mastered · {domain.mastery}%
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${domain.mastery}%` }}
            />
          </div>
          <p className="mt-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {domain.weight}% of the exam
          </p>
        </div>
      ))}
    </div>
  );
}