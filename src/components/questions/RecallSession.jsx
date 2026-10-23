import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RATINGS, friendlyDate } from '@/lib/scheduler';
import { TOPIC_MAP } from '@/lib/syllabus';
import { pickFrom, pickQuote, TASK_CHEERS } from '@/lib/quotes';

/**
 * Active recall first, then the answer. The rating you give decides when this
 * question comes back.
 */
export default function RecallSession({ questions, onRate, onFinish, onClose }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState({ total: 0, confident: 0 });

  const current = questions[index];
  const finished = index >= questions.length;

  const rate = async (ratingKey) => {
    setBusy(true);
    await onRate(current, ratingKey);
    const remembered = ratingKey === 'good' || ratingKey === 'easy';
    const nextSummary = {
      total: summary.total + 1,
      confident: summary.confident + (remembered ? 1 : 0)
    };
    const nextIndex = index + 1;
    setSummary(nextSummary);
    setBusy(false);
    setRevealed(false);
    setIndex(nextIndex);
    if (nextIndex >= questions.length) onFinish(nextSummary);
  };

  if (!questions.length) {
    return (
      <div className="panel p-6">
        <p className="text-[0.92rem] text-muted-foreground">
          Nothing is due right now. Come back when a question is scheduled, or add a new one.
        </p>
        <Button variant="secondary" className="mt-4 rounded-full" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  if (finished) {
    const accuracy = summary.total ? Math.round((summary.confident / summary.total) * 100) : 0;
    const quote = pickQuote(`finish:${summary.total}`);
    return (
      <div className="panel animate-rise-in p-7 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-gold" />
        <h2 className="mt-3 font-heading text-3xl">{pickFrom(TASK_CHEERS, summary.total)}</h2>
        <p className="mt-2 text-[0.92rem] text-muted-foreground">
          {summary.total} question{summary.total > 1 ? 's' : ''} revised · {accuracy}% recalled without help. Every
          one has a new date in the schedule.
        </p>
        <div className="mx-auto mt-5 max-w-md rounded-2xl bg-secondary/70 p-4">
          <p className="font-heading text-[1.05rem] leading-snug">{quote.text}</p>
          <p className="mt-1 text-[0.72rem] text-muted-foreground">— {quote.author}</p>
        </div>
        <Button className="mt-6 rounded-full px-6" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  const topic = TOPIC_MAP[current.topic_id];

  return (
    <div className="panel animate-rise-in p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            {index + 1} / {questions.length}
          </span>
          {topic ? <span className="chip">{topic.title}</span> : null}
          <span className="chip">Box {current.box || 1}</span>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <h2 className="mt-4 font-heading text-2xl leading-snug">{current.question}</h2>
      {current.next_review_date ? (
        <p className="mt-2 text-[0.75rem] text-muted-foreground">
          Scheduled {friendlyDate(current.next_review_date)} · reviewed {current.times_reviewed || 0} time
          {(current.times_reviewed || 0) === 1 ? '' : 's'}
        </p>
      ) : null}

      {revealed ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl bg-secondary/70 p-4">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">Your answer</p>
            <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed">{current.answer}</p>
            {current.source ? (
              <p className="mt-3 text-[0.72rem] text-muted-foreground">Source: {current.source}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="pr-1 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
              How close were you?
            </span>
            {RATINGS.map((rating) => (
              <button
                key={rating.key}
                type="button"
                disabled={busy}
                title={rating.hint}
                onClick={() => rate(rating.key)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[0.8rem] transition-colors hover:border-primary hover:bg-secondary disabled:opacity-50"
              >
                {rating.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-[0.86rem] text-muted-foreground">
            Answer it out loud or on paper first. Looking at the answer before you try is the one thing that does
            not work.
          </p>
          <Button className="mt-4 rounded-full px-5" onClick={() => setRevealed(true)}>
            Reveal my answer
          </Button>
        </div>
      )}
    </div>
  );
}