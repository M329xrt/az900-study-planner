import React from 'react';
import { BookOpen } from 'lucide-react';

const POINTS = [
  'Every topic comes back after 1, then 3, 7, 14 and 30 days — sooner if you tell me it felt shaky.',
  'Each return uses a different activity: blank-page recall, answering your questions, teaching it back, a practical task.',
  'Topics from different skill areas are mixed into one session instead of blocked together, so recall survives exam pressure.',
  'When the exam gets close the gaps compress automatically, so everything gets at least one more pass before the day.'
];

export default function MethodPanel() {
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        Why the plan looks like this
      </div>
      <ul className="mt-4 space-y-3">
        {POINTS.map((point) => (
          <li key={point} className="flex gap-3 text-[0.88rem] leading-relaxed text-muted-foreground">
            <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.78rem] leading-relaxed text-muted-foreground">
        The techniques come from{' '}
        <a
          href="https://summer.harvard.edu/blog/5-tips-to-retain-what-you-learn/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted underline-offset-4 hover:text-foreground"
        >
          Harvard Summer School’s five tips to retain what you learn
        </a>
        . Everything is stored on your device, so this page opens with no signal and syncs when you are back online.
      </p>
    </div>
  );
}