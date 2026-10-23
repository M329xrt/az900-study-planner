import React, { useState } from 'react';
import { PenLine, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStudy } from '@/lib/StudyContext';
import { pickFrom, REFLECTION_PROMPTS } from '@/lib/quotes';

/**
 * Teaching an idea back in your own words is one of the retention techniques
 * from the Harvard Summer School guide — this is where that lands.
 */
export default function ReflectionCard() {
  const { today, todaySession, logStudy } = useStudy();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const prompt = pickFrom(REFLECTION_PROMPTS, today);
  const existing = todaySession?.reflection || '';

  const save = async () => {
    if (!text.trim()) return;
    await logStudy({ reflection: text.trim() });
    setSaved(true);
    setText('');
  };

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
        <PenLine className="h-3.5 w-3.5" />
        Teach it back
      </div>
      <h2 className="mt-2 font-heading text-2xl">{prompt}</h2>

      {existing ? (
        <div className="mt-4 space-y-2 rounded-2xl bg-secondary/70 p-4">
          {existing.split('\n').map((line, index) => (
            <p key={`${line}-${index}`} className="text-[0.88rem] leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {saved && !text ? (
        <p className="mt-4 inline-flex items-center gap-2 text-[0.85rem] text-sage">
          <Check className="h-4 w-4" />
          Saved to today’s session.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Two or three sentences in your own words — no jargon, no copying."
            rows={3}
          />
          <div className="flex items-center gap-3">
            <Button size="sm" variant="secondary" className="rounded-full" onClick={save} disabled={!text.trim()}>
              Save to today
            </Button>
            <span className="text-[0.72rem] text-muted-foreground">Explaining it out loud works too.</span>
          </div>
        </div>
      )}
    </div>
  );
}