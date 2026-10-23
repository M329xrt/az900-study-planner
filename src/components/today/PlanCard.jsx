import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Timer, ArrowRight, Lightbulb, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FocusTimer from '@/components/today/FocusTimer';
import { RATINGS } from '@/lib/scheduler';

const TYPE_STYLES = {
  review: 'bg-sage/15 text-sage',
  new: 'bg-gold/20 text-gold',
  questions: 'bg-primary/10 text-primary'
};

const TYPE_LABELS = {
  review: 'Revise',
  new: 'New topic',
  questions: 'Your questions'
};

export default function PlanCard({ item, done, onComplete }) {
  const [timerOpen, setTimerOpen] = useState(false);
  const isQuestions = item.type === 'questions';

  return (
    <div className={`panel lift animate-rise-in p-5 ${done ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`chip ${TYPE_STYLES[item.type]}`}>{TYPE_LABELS[item.type]}</span>
        {item.topic?.domainName ? <span className="chip">{item.topic.domainName}</span> : null}
        <span className="chip">
          <Timer className="h-3 w-3" />
          {item.minutes} min
        </span>
        {item.overdue > 0 ? <span className="chip bg-clay/15 text-clay">Due {item.overdue}d ago</span> : null}
        {item.mode?.science ? (
          <span className="ml-auto text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
            {item.mode.science}
          </span>
        ) : null}
      </div>

      <h3 className={`mt-3 font-heading text-2xl leading-snug ${done ? 'line-through decoration-1' : ''}`}>
        {isQuestions ? `Revise ${item.count} question${item.count > 1 ? 's' : ''}` : item.topic?.title}
      </h3>

      <p className="mt-1.5 text-[0.88rem] leading-relaxed text-muted-foreground">{item.mode?.detail}</p>

      {isQuestions && item.sample?.length ? (
        <ul className="mt-3 space-y-1.5">
          {item.sample.map((question) => (
            <li key={question.id || question.question} className="flex gap-2 text-[0.84rem] text-muted-foreground">
              <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
              <span className="line-clamp-1">{question.question}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {item.topic?.teachBack && !isQuestions ? (
        <p className="mt-3 flex gap-2 rounded-2xl bg-secondary/70 p-3 text-[0.84rem] leading-relaxed">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          {item.topic.teachBack}
        </p>
      ) : null}

      {done ? (
        <p className="mt-4 inline-flex items-center gap-2 text-[0.85rem] text-sage">
          <Check className="h-4 w-4" />
          Logged for today
        </p>
      ) : null}

      {isQuestions ? (
        <div className="mt-4">
          <Button asChild size="sm" className="rounded-full">
            <Link to="/questions?recall=1">
              {done ? 'Revise more questions' : 'Revise now'}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : done ? null : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setTimerOpen(true)}>
              <Play className="mr-2 h-3.5 w-3.5" />
              Start focus
            </Button>
            <span className="text-[0.78rem] text-muted-foreground">or log it straight away:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="self-center pr-1 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
              How did it feel?
            </span>
            {RATINGS.map((rating) => (
              <button
                key={rating.key}
                type="button"
                title={rating.hint}
                onClick={() => onComplete(item, { rating: rating.key })}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-[0.78rem] transition-colors hover:border-primary hover:bg-secondary"
              >
                {rating.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isQuestions ? (
        <FocusTimer
          open={timerOpen}
          item={item}
          onClose={() => setTimerOpen(false)}
          onLog={(minutes) => {
            setTimerOpen(false);
            onComplete(item, { minutes, rating: 'good' });
          }}
        />
      ) : null}
    </div>
  );
}