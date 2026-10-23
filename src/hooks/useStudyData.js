import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { enqueue, flushQueue, readCache, readQueue, removeQueued, writeCache } from '@/lib/offline';
import { toISODate } from '@/lib/scheduler';

const CACHE_KEYS = ['plan', 'progress', 'questions', 'sessions'];

function stripMeta(record = {}) {
  const { id, created_date, updated_date, created_by_id, localKey, ...rest } = record;
  return rest;
}

/**
 * One source of truth for the planner's data.
 * Cache first (instant, works offline), then a quiet refresh when online.
 */
export default function useStudyData() {
  const [plan, setPlan] = useState(() => readCache('plan', null));
  const [progress, setProgress] = useState(() => readCache('progress', []));
  const [questions, setQuestions] = useState(() => readCache('questions', []));
  const [sessions, setSessions] = useState(() => readCache('sessions', []));
  const [loading, setLoading] = useState(() => readCache('plan', null) === null);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [pending, setPending] = useState(() => readQueue().length);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const sync = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (mounted.current) setLoading(false);
      return;
    }
    try {
      const [plans, progressRows, questionRows, sessionRows] = await Promise.all([
        base44.entities.StudyPlan.filter({}, { sort: '-created_date', limit: 1 }),
        base44.entities.TopicProgress.filter({}, { sort: '-created_date', limit: 500 }),
        base44.entities.StudyQuestion.filter({}, { sort: '-created_date', limit: 500 }),
        base44.entities.StudySession.filter({}, { sort: '-created_date', limit: 400 })
      ]);
      if (!mounted.current) return;
      const nextPlan = plans?.items?.[0] || null;
      const nextProgress = progressRows?.items || [];
      const nextQuestions = questionRows?.items || [];
      const nextSessions = sessionRows?.items || [];
      setPlan(nextPlan);
      setProgress(nextProgress);
      setQuestions(nextQuestions);
      setSessions(nextSessions);
      writeCache('plan', nextPlan);
      writeCache('progress', nextProgress);
      writeCache('questions', nextQuestions);
      writeCache('sessions', nextSessions);
    } catch (error) {
      /* no connection or a temporary failure — the cached data stays on screen */
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const goOnline = async () => {
      setOnline(true);
      const remaining = await flushQueue();
      setPending(remaining.length);
      sync();
    };
    const goOffline = () => setOnline(false);
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sync]);

  /** Create or update one record, writing locally first so it never blocks. */
  const write = useCallback(async (entity, existing, patch, dedupe) => {
    const localKey =
      existing?.localKey ||
      (existing?.id
        ? undefined
        : `local-${
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2)
          }`);
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('offline');
      const saved = existing?.id
        ? await base44.entities[entity].update(existing.id, patch)
        : await base44.entities[entity].create(patch);
      return { ...existing, ...patch, ...saved };
    } catch (error) {
      enqueue({
        entity,
        action: existing?.id ? 'update' : 'create',
        id: existing?.id,
        data: patch,
        localKey,
        dedupe: existing?.id ? undefined : dedupe
      });
      setPending(readQueue().length);
      return { ...existing, ...patch, localKey };
    }
  }, []);

  const savePlan = useCallback(
    async (patch) => {
      const merged = { ...(plan || {}), ...patch };
      setPlan(merged);
      writeCache('plan', merged);
      if (plan?.id) {
        const saved = await write('StudyPlan', plan, patch);
        setPlan(saved);
        writeCache('plan', saved);
        return saved;
      }
      const saved = await write('StudyPlan', null, stripMeta(merged), null);
      setPlan(saved);
      writeCache('plan', saved);
      return saved;
    },
    [plan, write]
  );

  const saveProgress = useCallback(
    async (topicId, patch) => {
      const existing = progress.find((row) => row.topic_id === topicId) || null;
      const saved = await write('TopicProgress', existing, { ...patch, topic_id: topicId }, { topic_id: topicId });
      const next = existing
        ? progress.map((row) => (row.topic_id === topicId ? { ...row, ...saved } : row))
        : [...progress, saved];
      setProgress(next);
      writeCache('progress', next);
      return saved;
    },
    [progress, write]
  );

  const saveQuestion = useCallback(
    async (question) => {
      const existing = question.id ? questions.find((row) => row.id === question.id) : null;
      const saved = await write('StudyQuestion', existing, stripMeta(question), null);
      const next = existing
        ? questions.map((row) => (row.id === existing.id ? { ...row, ...saved } : row))
        : [...questions, saved];
      setQuestions(next);
      writeCache('questions', next);
      return saved;
    },
    [questions, write]
  );

  const deleteQuestion = useCallback(
    async (question) => {
      const next = questions.filter((row) => row.id !== question.id && row.localKey !== question.localKey);
      setQuestions(next);
      writeCache('questions', next);
      if (question.id) {
        try {
          if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('offline');
          await base44.entities.StudyQuestion.delete(question.id);
        } catch (error) {
          enqueue({ entity: 'StudyQuestion', action: 'delete', id: question.id, localKey: question.localKey });
          setPending(readQueue().length);
        }
      } else {
        removeQueued(question.localKey);
        setPending(readQueue().length);
      }
    },
    [questions]
  );

  /** Fold today's work into one session record per day, so streaks stay honest offline. */
  const logStudy = useCallback(
    async ({ minutes = 0, tasks = 0, questionsReviewed = 0, topicIds = [], taskKey = null, reflection = '' }) => {
      const today = toISODate();
      const existing = sessions.find((row) => row.date === today) || null;
      const base = existing || { date: today, minutes: 0, tasks_completed: 0, questions_reviewed: 0, topic_ids: [], task_keys: [] };
      const patch = {
        minutes: (base.minutes || 0) + minutes,
        tasks_completed: (base.tasks_completed || 0) + tasks,
        questions_reviewed: (base.questions_reviewed || 0) + questionsReviewed,
        topic_ids: Array.from(new Set([...(base.topic_ids || []), ...topicIds])),
        task_keys: taskKey ? Array.from(new Set([...(base.task_keys || []), taskKey])) : base.task_keys || [],
        reflection: reflection ? [base.reflection, reflection].filter(Boolean).join('\n') : base.reflection || ''
      };
      const saved = await write('StudySession', existing, patch, { date: today });
      const next = existing
        ? sessions.map((row) => (row.date === today ? { ...row, ...saved } : row))
        : [...sessions, saved];
      setSessions(next);
      writeCache('sessions', next);
      return saved;
    },
    [sessions, write]
  );

  const pendingItems = readQueue().length;

  return {
    plan,
    progress,
    questions,
    sessions,
    loading,
    online,
    pending: Math.max(pending, pendingItems),
    sync,
    savePlan,
    saveProgress,
    saveQuestion,
    deleteQuestion,
    logStudy
  };
}

export { CACHE_KEYS };