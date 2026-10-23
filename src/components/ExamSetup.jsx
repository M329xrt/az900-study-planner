import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudy } from '@/lib/StudyContext';
import { addDays, toISODate } from '@/lib/scheduler';
import { TOTAL_MINUTES, TOTAL_TOPICS } from '@/lib/syllabus';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ExamSetup() {
  const { savePlan } = useStudy();
  const [examDate, setExamDate] = useState(addDays(toISODate(), 28));
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [studyDays, setStudyDays] = useState([1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState('18:30');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day) =>
    setStudyDays((current) =>
      current.includes(day) ? current.filter((value) => value !== day) : [...current, day].sort()
    );

  const submit = async () => {
    if (!examDate) {
      setError('Pick the day of your exam so the schedule knows how much room it has.');
      return;
    }
    if (examDate <= toISODate()) {
      setError('That date has already passed — choose a future exam date.');
      return;
    }
    if (!studyDays.length) {
      setError('Choose at least one study day.');
      return;
    }
    setSaving(true);
    await savePlan({
      exam_date: examDate,
      daily_minutes: dailyMinutes,
      study_days: studyDays,
      reminder_time: reminderTime,
      onboarded: true
    });
    setSaving(false);
  };

  const weeks = Math.max(1, Math.round((new Date(examDate) - new Date()) / (7 * 86400000)));
  const minutesPerWeek = dailyMinutes * Math.max(1, studyDays.length);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-10">
      <div className="animate-rise-in">
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">Momentum</p>
        <h1 className="mt-3 font-heading text-4xl leading-tight sm:text-5xl">
          Let’s plan your AZ-900, <em className="italic">properly</em>.
        </h1>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
          {TOTAL_TOPICS} exam topics and your own questions, spread across the days you actually have —
          reviewed at widening intervals so the material keeps coming back before you forget it.
        </p>

        <div className="panel mt-8 space-y-7 p-6 sm:p-8">
          <div className="space-y-2">
            <Label htmlFor="exam-date">Exam date</Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              min={addDays(toISODate(), 1)}
              onChange={(event) => setExamDate(event.target.value)}
              className="max-w-xs"
            />
            <p className="text-[0.78rem] text-muted-foreground">
              About {weeks} week{weeks > 1 ? 's' : ''} from today. The plan compresses as the date gets closer.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Time you can realistically give on a study day</Label>
            <div className="flex flex-wrap gap-2">
              {[20, 30, 45, 60, 90].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setDailyMinutes(minutes)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    dailyMinutes === minutes
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <p className="text-[0.78rem] text-muted-foreground">
              Roughly {Math.round(minutesPerWeek / 6) / 10} hours a week. Honest beats ambitious — a plan you
              keep works better than one you abandon.
            </p>
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
                    studyDays.includes(day)
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
            <Label htmlFor="reminder-time">When should I nudge you?</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              className="max-w-[10rem]"
            />
          </div>

          <div className="rounded-2xl bg-secondary/70 p-4 text-[0.82rem] leading-relaxed text-muted-foreground">
            The total syllabus is about {Math.round(TOTAL_MINUTES / 60)} hours of first-pass material.
            Momentum spreads it out and schedules every revision for you.
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            size="lg"
            disabled={saving}
            onClick={submit}
            className="w-full rounded-full sm:w-auto sm:px-8"
          >
            {saving ? 'Building your schedule…' : 'Build my revision schedule'}
          </Button>
        </div>
      </div>
    </div>
  );
}