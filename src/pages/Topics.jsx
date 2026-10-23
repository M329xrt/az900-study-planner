import React, { useState } from 'react';
import TopicCard from '@/components/topics/TopicCard';
import { useStudy } from '@/lib/StudyContext';
import { DOMAINS } from '@/lib/syllabus';
import {
  addDays,
  confidenceForRating,
  progressMap,
  REVIEW_MINUTES,
  scheduleAfterReview,
  statusForReview
} from '@/lib/scheduler';
import { celebrate } from '@/lib/celebrate';

export default function Topics() {
  const { plan, progress, today, saveProgress, logStudy, stats } = useStudy();
  const [filter, setFilter] = useState('all');
  const map = progressMap(progress);

  const needsAttention = (topic) => {
    const record = map[topic.id];
    if (!record || record.status === 'not_started') return true;
    return Boolean(record.next_review_date && record.next_review_date <= today);
  };

  const rate = async (topic, rating) => {
    const record = map[topic.id];
    const schedule = scheduleAfterReview({
      stage: record?.review_stage || 0,
      rating,
      examDate: plan?.exam_date,
      today
    });
    const checklistComplete = (record?.checklist_done || []).length === topic.focus.length;
    await saveProgress(topic.id, {
      status: statusForReview({
        currentStatus: record?.status || 'not_started',
        stage: schedule.review_stage,
        rating,
        checklistComplete
      }),
      confidence: confidenceForRating(record?.confidence || 2, rating),
      review_stage: schedule.review_stage,
      last_studied_date: today,
      next_review_date: schedule.next_review_date,
      times_studied: (record?.times_studied || 0) + 1
    });
    await logStudy({ minutes: REVIEW_MINUTES, tasks: 1, topicIds: [topic.id] });
    if (rating === 'good' || rating === 'easy') celebrate();
  };

  const toggleChecklist = async (topic, item) => {
    const record = map[topic.id];
    const current = record?.checklist_done || [];
    const next = current.includes(item) ? current.filter((value) => value !== item) : [...current, item];
    await saveProgress(topic.id, {
      checklist_done: next,
      status: record?.status && record.status !== 'not_started' ? record.status : 'learning',
      last_studied_date: today,
      next_review_date: record?.next_review_date || addDays(today, 1),
      confidence: record?.confidence || 1
    });
  };

  const setConfidence = async (topic, level) => {
    const record = map[topic.id];
    await saveProgress(topic.id, {
      confidence: level,
      status: record?.status && record.status !== 'not_started' ? record.status : 'learning',
      last_studied_date: today,
      next_review_date: record?.next_review_date || addDays(today, 1)
    });
  };

  return (
    <div className="space-y-5">
      <header className="panel p-6">
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">AZ-900 syllabus</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Topics, topic by topic</h1>
        <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-muted-foreground">
          Tick off the checklist as you cover each point, and log the topic afterwards so its next revision lands in
          the schedule. {stats.masteredTopics} of {stats.totalTopics} topics are mastered, {stats.readiness}% overall
          readiness.
        </p>
        <div className="mt-4 flex gap-2">
          {[
            { key: 'all', label: 'All topics' },
            { key: 'attention', label: 'Needs attention' }
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={`rounded-full border px-4 py-1.5 text-[0.82rem] transition-colors ${
                filter === option.key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-secondary'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {DOMAINS.map((domain) => {
        const topics = domain.topics.filter((topic) => filter === 'all' || needsAttention(topic));
        if (!topics.length) return null;
        return (
          <section key={domain.id} className="space-y-4">
            <div className="px-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-heading text-2xl">{domain.name}</h2>
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {domain.weight}% of the exam
                </p>
              </div>
              <p className="mt-1 max-w-2xl text-[0.85rem] leading-relaxed text-muted-foreground">{domain.summary}</p>
            </div>
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                record={map[topic.id]}
                today={today}
                onRate={rate}
                onToggleChecklist={toggleChecklist}
                onConfidence={setConfidence}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}