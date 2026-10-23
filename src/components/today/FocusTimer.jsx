import React, { useEffect, useState } from 'react';
import { Play, Pause, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function clock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
}

/**
 * A deliberately plain focus timer: one interval while running, nothing at all
 * when paused or closed.
 */
export default function FocusTimer({ open, item, onClose, onLog }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const target = Math.max(300, (item?.minutes || 15) * 60);

  useEffect(() => {
    if (open) {
      setSeconds(0);
      setRunning(true);
    }
  }, [open, item?.key]);

  useEffect(() => {
    if (!open || !running) return undefined;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [open, running]);

  const pct = Math.min(100, Math.round((seconds / target) * 100));

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{item?.topic?.title || 'Revision block'}</DialogTitle>
          <DialogDescription>{item?.mode?.label}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-2">
          <p className="font-heading text-6xl leading-none tracking-tight">{clock(seconds)}</p>
          <p className="mt-2 text-[0.75rem] text-muted-foreground">
            {seconds >= target ? 'Past the estimate — finish whenever it feels done.' : `${item?.minutes || 15} min block`}
          </p>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="mt-6 max-w-sm text-center text-[0.88rem] leading-relaxed text-muted-foreground">
            {item?.mode?.detail}
          </p>
          {item?.topic?.teachBack ? (
            <p className="mt-3 max-w-sm text-center font-heading text-[0.98rem] text-foreground">
              {item.topic.teachBack}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" className="rounded-full" onClick={() => setRunning((value) => !value)}>
            {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {running ? 'Pause' : 'Resume'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full" onClick={onClose}>
              Close
            </Button>
            <Button
              className="rounded-full"
              onClick={() => onLog(Math.max(1, Math.round(seconds / 60)))}
            >
              <Check className="mr-2 h-4 w-4" />
              Finish &amp; log
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}