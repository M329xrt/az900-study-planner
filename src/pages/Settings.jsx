import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BellRing, CloudOff, Moon, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useStudy } from '@/lib/StudyContext';
import useTheme from '@/hooks/useTheme';
import { addDays, toISODate } from '@/lib/scheduler';
import { notificationPermission, requestNotificationPermission } from '@/lib/notifications';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CHEER_STYLES = [
  { key: 'calm', label: 'Gentle', detail: 'Quiet reminders, no drama.' },
  { key: 'playful', label: 'Playful', detail: 'Cheeky nudges that tease you a little.' },
  { key: 'hype', label: 'Hype', detail: 'Full sports coach. No excuses.' }
];

export default function Settings() {
  const { plan, savePlan, online, pending, sync } = useStudy();
  const { theme, setTheme } = useTheme();
  const [savedFlash, setSavedFlash] = useState(false);
  const [permission, setPermission] = useState(notificationPermission());
  const [confirmReset, setConfirmReset] = useState(false);

  const save = async (patch) => {
    await savePlan(patch);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const toggleDay = (day) => {
    const current = plan?.study_days || [];
    const next = current.includes(day)
      ? current.filter((value) => value !== day)
      : [...current, day].sort();
    if (next.length) save({ study_days: next });
  };

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const reset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    try {
      await Promise.all([
        base44.entities.StudySession.deleteMany({}),
        base44.entities.StudyQuestion.deleteMany({}),
        base44.entities.TopicProgress.deleteMany({}),
        base44.entities.StudyPlan.deleteMany({})
      ]);
    } catch (error) {
      /* offline — the local copy is cleared below regardless */
    }
    ['plan', 'progress', 'questions', 'sessions', 'queue'].forEach((key) => {
      localStorage.removeItem(`momentum:${key}`);
    });
    window.location.href = '/';
  };

  return (
    <div className="space-y-5">
      <header className="panel p-6">
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Your plan</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-muted-foreground">
          Change any of this and the schedule recalculates straight away.
          {savedFlash ? ' Saved.' : ''}
        </p>
      </header>

      <section className="panel space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="settings-exam">Exam date</Label>
          <Input
            id="settings-exam"
            type="date"
            value={plan?.exam_date || ''}
            min={addDays(toISODate(), 1)}
            onChange={(event) => save({ exam_date: event.target.value })}
            className="max-w-xs"
          />
        </div>

        <div className="space-y-3">
          <Label>Time per study day</Label>
          <div className="flex flex-wrap gap-2">
            {[20, 30, 45, 60, 90].map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => save({ daily_minutes: minutes })}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  plan?.daily_minutes === minutes
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-secondary'
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Study days</Label>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, day) => (
              <button
                key={DAY_NAMES[day]}
                type="button"
                aria-label={DAY_NAMES[day]}
                onClick={() => toggleDay(day)}
                className={`h-10 w-10 rounded-full border text-sm transition-colors ${
                  (plan?.study_days || []).includes(day)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-reminder">Nudge me after</Label>
          <Input
            id="settings-reminder"
            type="time"
            value={plan?.reminder_time || '18:30'}
            onChange={(event) => save({ reminder_time: event.target.value })}
            className="max-w-[10rem]"
          />
        </div>

        <div className="space-y-3">
          <Label>Reminder personality</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {CHEER_STYLES.map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() => save({ cheer_style: style.key })}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  (plan?.cheer_style || 'playful') === style.key
                    ? 'border-primary bg-secondary'
                    : 'border-border hover:bg-secondary/60'
                }`}
              >
                <p className="text-[0.9rem]">{style.label}</p>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">{style.detail}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="settings-cheer">Goal you are working towards</Label>
          <Input
            id="settings-cheer"
            value={plan?.goal_note || ''}
            placeholder="Pass AZ-900 on the first attempt"
            onChange={(event) => save({ goal_note: event.target.value })}
            className="max-w-md"
          />
        </div>
      </section>

      <section className="panel space-y-5 p-6">
        <div className="flex items-start gap-3">
          <BellRing className="mt-0.5 h-4 w-4 text-gold" />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-xl">Reminders outside the app</h2>
            <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
              {permission === 'granted'
                ? 'On. When something is due after your nudge time and the app is not on screen, you get one notification with a quote.'
                : permission === 'denied'
                  ? 'Blocked by your browser. Re-enable notifications for this site in your browser settings if you change your mind.'
                  : 'Optional and off by default. If you allow it, one nudge a day arrives with a motivational quote — nothing else.'}
            </p>
            {permission !== 'granted' && permission !== 'denied' && permission !== 'unsupported' ? (
              <Button variant="outline" className="mt-3 rounded-full" onClick={enableNotifications}>
                Allow reminders
              </Button>
            ) : null}
            {permission === 'unsupported' ? (
              <p className="mt-2 text-[0.78rem] text-muted-foreground">
                This browser does not support system notifications, so nudges stay inside the app.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-5">
          <div>
            <h2 className="font-heading text-xl">Dark theme</h2>
            <p className="mt-1 text-[0.85rem] text-muted-foreground">
              Easier on the eyes at night, and it saves a little battery on OLED screens.
            </p>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={(value) => setTheme(value ? 'dark' : 'light')} />
        </div>
      </section>

      <section className="panel space-y-4 p-6">
        <div className="flex items-start gap-3">
          {online ? <RefreshCw className="mt-0.5 h-4 w-4 text-sage" /> : <CloudOff className="mt-0.5 h-4 w-4 text-clay" />}
          <div>
            <h2 className="font-heading text-xl">{online ? 'Working offline, ready online' : 'Working offline'}</h2>
            <p className="mt-1 text-[0.85rem] leading-relaxed text-muted-foreground">
              Your plan, topics and questions live on this device, so the app opens with no signal and costs almost no
              data. {pending ? `${pending} change${pending > 1 ? 's are' : ' is'} waiting to sync.` : 'Everything is synced.'}{' '}
              No images, no tracking scripts and no background timers run in this app.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full" onClick={sync}>
                Sync now
              </Button>
              <span className="self-center text-[0.72rem] text-muted-foreground">
                {theme === 'dark' ? 'Dark' : 'Light'} theme ·{' '}
                {typeof navigator !== 'undefined' && navigator.onLine ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel space-y-3 p-6">
        <h2 className="font-heading text-xl">Start over</h2>
        <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
          This deletes your study plan, topic progress, question bank and session history. It cannot be undone.
        </p>
        <Button variant={confirmReset ? 'destructive' : 'outline'} className="rounded-full" onClick={reset}>
          <Trash2 className="mr-2 h-4 w-4" />
          {confirmReset ? 'Tap again to delete everything' : 'Reset my study data'}
        </Button>
      </section>

      <p className="px-2 pb-2 text-[0.72rem] leading-relaxed text-muted-foreground">
        Momentum is an independent study planner for the AZ-900 exam. It is not affiliated with, endorsed by or
        sponsored by Microsoft, and it uses no Microsoft artwork or logos. Please check the official exam skills
        outline before your test.
      </p>
    </div>
  );
}