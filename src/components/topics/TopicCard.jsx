import React, { useState } from 'react';
import { Check, ChevronDown, RefreshCw } from 'lucide-react';
import { RATINGS, friendlyDate, checklistDone } from '@/lib/scheduler';

const STATUS_LABELS = {
  not_started: 'Not started',
  learning: 'Learning',
  reviewing: 'Reviewing',
  mastered: 'Mastered'
};

const STATUS_STYLES = {
  not_started: 'bg-secondary text-muted-foreground',
  learning: 'bg-gold/20 text-gold',
  reviewing: 'bg-primary/10 text-primary',
  mastered: 'bg-sage/20 text-sage'
};

export default function TopicCard({ topic, record, today, onRate, onToggleChecklist, onConfidence }) {
  const [open, setOpen] = useState(false);
  const doneItems = (record?.checklist_done || []).filter((item) => topic.focus.includes(item));
  const status = record?.status || 'not_started';
  const confidence = record?.confidence || 0;

  return (
    <div className="panel lift p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-xl leading-snug">{topic.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`chip ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
            <span className="chip">
              <RefreshCw className="h-3 w-3" />
              {record?.next_review_date ? `Revise ${friendlyDate(record.next_review_date, today)}` : 'No review scheduled'}
            </span>
            <span className="chip">
              {doneItems.length}/{topic.focus.length} checklist
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              aria-label={`Confidence ${level}`}
              onClick={() => onConfidence(topic, level)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                level <= confidence ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-3 inline-flex items-center gap-1.5 text-[0.8rem] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {open ? 'Hide the exam checklist' : 'Show the exam checklist'}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <ul className="space-y-1.5">
            {topic.focus.map((item) => {
              const checked = doneItems.includes(item);
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onToggleChecklist(topic, item)}
                    className="flex w-full items-start gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[0.35rem] border ${
                        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                      }`}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className={`text-[0.86rem] leading-snug ${checked ? 'text-muted-foreground line-through' : ''}`}>
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="grid gap-2 sm:grid-cols-2">
            <p className="rounded-2xl bg-secondary/70 p-3 text-[0.82rem] leading-relaxed">
              <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">Teach it back</span>
              <br />
              {topic.teachBack}
            </p>
            <p className="rounded-2xl bg-secondary/70 p-3 text-[0.82rem] leading-relaxed">
              <span className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">Practical task</span>
              <br />
              {topic.practical}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="self-center pr-1 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
          Log this topic
        </span>
        {RATINGS.map((rating) => (
          <button
            key={rating.key}
            type="button"
            title={rating.hint}
            onClick={() => onRate(topic, rating.key)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-[0.78rem] transition-colors hover:border-primary hover:bg-secondary"
          >
            {rating.label}
          </button>
        ))}
      </div>
    </div>
  );
}