/**
 * The revision engine.
 *
 * Planning rules come from Harvard Summer School's "5 tips to retain what you
 * learn": space repetitions out (and let the harder concepts keep longer gaps),
 * learn the same idea through different activities, teach it back in your own
 * words, connect it to what you already know, and get practical experience
 * rather than only re-reading.
 */
import { DOMAINS, TOPICS, TOTAL_TOPICS } from './syllabus';

/** Days between successful reviews. A concept that feels hard comes back sooner. */
export const INTERVALS = [1, 3, 7, 14, 30];

export const REVIEW_MODES = [
  {
    key: 'recall',
    label: 'Blank-page recall',
    detail: 'Close everything and write down what you remember. Then check what is missing.',
    science: 'active recall'
  },
  {
    key: 'quiz',
    label: 'Answer your questions',
    detail: 'Work through your questions for this topic before you allow yourself to peek.',
    science: 'practice testing'
  },
  {
    key: 'teach',
    label: 'Teach it back',
    detail: 'Explain it out loud the way you would to a classmate who missed the lesson.',
    science: 'teaching others'
  },
  {
    key: 'connect',
    label: 'Connect it up',
    detail: 'Link it to something you already know well, and say why the link holds.',
    science: 'building on prior knowledge'
  },
  {
    key: 'apply',
    label: 'Use it for real',
    detail: 'Work through a hands-on scenario or a sample task rather than reading again.',
    science: 'practical experience'
  }
];

export const RATINGS = [
  { key: 'forgot', label: 'Blank', hint: 'See it again tomorrow' },
  { key: 'hard', label: 'Shaky', hint: 'Shorter gap this time' },
  { key: 'good', label: 'Solid', hint: 'Normal gap' },
  { key: 'easy', label: 'Effortless', hint: 'Longest gap' }
];

/** Minutes a single revision block should take. */
export const REVIEW_MINUTES = 15;

export function toISODate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function parseISO(value) {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function addDays(iso, days) {
  const base = parseISO(iso) || new Date();
  base.setDate(base.getDate() + days);
  return toISODate(base);
}

export function diffDays(fromISO, toISOString) {
  const a = parseISO(fromISO);
  const b = parseISO(toISOString);
  if (!a || !b) return 0;
  return Math.round((b - a) / 86400000);
}

export function daysUntilExam(examDate, today = toISODate()) {
  if (!examDate) return null;
  return diffDays(today, examDate);
}

export function friendlyDate(iso, today = toISODate()) {
  if (!iso) return 'not scheduled';
  const delta = diffDays(today, iso);
  if (delta === 0) return 'today';
  if (delta === 1) return 'tomorrow';
  if (delta === -1) return 'yesterday';
  if (delta < 0) return `${Math.abs(delta)} days overdue`;
  if (delta <= 6) return `in ${delta} days`;
  return parseISO(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatMinutes(total = 0) {
  const minutes = Math.round(total);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function progressMap(progress = []) {
  return progress.reduce((acc, record) => {
    if (record?.topic_id) acc[record.topic_id] = record;
    return acc;
  }, {});
}

export function checklistDone(record, topic) {
  const done = record?.checklist_done || [];
  return done.filter((key) => topic.focus.includes(key)).length;
}

/** 0–1 score for one topic, blending checklist progress, confidence and review depth. */
export function mastery(topic, record) {
  if (!record || record.status === 'not_started') return 0;
  const checklist = topic.focus.length ? checklistDone(record, topic) / topic.focus.length : 0;
  const confidence = Math.min(5, record.confidence || 0) / 5;
  const depth = Math.min(INTERVALS.length - 1, record.review_stage || 0) / (INTERVALS.length - 1);
  return Math.min(1, checklist * 0.35 + confidence * 0.4 + depth * 0.25);
}

export function readiness(progress = []) {
  const map = progressMap(progress);
  let weighted = 0;
  let weights = 0;
  DOMAINS.forEach((domain) => {
    const domainScore = domain.topics.reduce((sum, topic) => sum + mastery(topic, map[topic.id]), 0) / domain.topics.length;
    weighted += domainScore * domain.weight;
    weights += domain.weight;
  });
  return weights ? Math.round((weighted / weights) * 100) : 0;
}

/** Clamp a review date so nothing lands after the exam (or before tomorrow). */
function clampReviewDate(iso, examDate, today) {
  const earliest = addDays(today, 1);
  let next = iso < earliest ? earliest : iso;
  if (examDate) {
    const lastDay = addDays(examDate, -1);
    if (lastDay > today && next > lastDay) next = lastDay;
  }
  return next;
}

export function scheduleAfterReview({ stage = 0, rating = 'good', examDate, today = toISODate() }) {
  const daysLeft = examDate ? diffDays(today, examDate) : null;
  const urgency = daysLeft !== null && daysLeft <= 12 ? 0.7 : daysLeft !== null && daysLeft <= 25 ? 0.85 : 1;

  let nextStage = stage;
  let gap;

  if (rating === 'forgot') {
    nextStage = 0;
    gap = 1;
  } else if (rating === 'hard') {
    nextStage = Math.max(0, stage);
    gap = Math.max(2, Math.round(INTERVALS[Math.min(stage, INTERVALS.length - 1)] * 0.6));
  } else if (rating === 'easy') {
    nextStage = Math.min(INTERVALS.length - 1, stage + 2);
    gap = Math.round(INTERVALS[nextStage] * 1.3);
  } else {
    nextStage = Math.min(INTERVALS.length - 1, stage + 1);
    gap = INTERVALS[nextStage];
  }

  gap = Math.max(1, Math.round(gap * urgency));

  return {
    review_stage: nextStage,
    interval: gap,
    next_review_date: clampReviewDate(addDays(today, gap), examDate, today)
  };
}

export function statusForReview({ currentStatus = 'not_started', stage, rating, checklistComplete }) {
  if (rating === 'forgot') return 'reviewing';
  if (stage >= INTERVALS.length - 1 && (rating === 'easy' || checklistComplete)) return 'mastered';
  if (currentStatus === 'not_started') return 'reviewing';
  if (stage >= 2) return 'reviewing';
  return 'learning';
}

export function confidenceForRating(current = 2, rating = 'good') {
  const deltas = { forgot: -2, hard: -1, good: 1, easy: 2 };
  return Math.max(1, Math.min(5, current + (deltas[rating] ?? 0)));
}

function interleave(items) {
  const groups = new Map();
  items.forEach((item) => {
    const key = item.domainId || 'other';
    groups.set(key, [...(groups.get(key) || []), item]);
  });
  const lists = [...groups.values()];
  const out = [];
  let index = 0;
  while (out.length < items.length) {
    let added = false;
    lists.forEach((list) => {
      if (list[index]) {
        out.push(list[index]);
        added = true;
      }
    });
    if (!added) break;
    index += 1;
  }
  return out;
}

/** Topics whose scheduled revision moment has arrived. */
export function dueTopics(progress = [], today = toISODate()) {
  const map = progressMap(progress);
  return TOPICS.filter((topic) => {
    const record = map[topic.id];
    return record?.next_review_date && record.next_review_date <= today;
  }).sort((a, b) => {
    const left = map[a.id].next_review_date;
    const right = map[b.id].next_review_date;
    if (left === right) return a.title.localeCompare(b.title);
    return left < right ? -1 : 1;
  });
}

/** Questions that are ready for another run. */
export function dueQuestions(questions = [], today = toISODate()) {
  return questions
    .filter((question) => question.status !== 'archived')
    .filter((question) => !question.next_review_date || question.next_review_date <= today)
    .sort((a, b) => {
      const left = a.next_review_date || '0000-00-00';
      const right = b.next_review_date || '0000-00-00';
      if (left === right) return (a.box || 1) - (b.box || 1);
      return left < right ? -1 : 1;
    });
}

export function untouchedTopics(progress = []) {
  const map = progressMap(progress);
  const pending = TOPICS.filter((topic) => !map[topic.id] || map[topic.id].status === 'not_started');
  return interleave(pending.map((topic) => ({ ...topic, topicId: topic.id })));
}

/**
 * Build today's short plan: overdue revision first, then your questions, then a
 * new topic if there is room, then any remaining revision. Kept to a handful of
 * blocks so it is realistic on a busy day.
 */
export function buildTodayPlan({ plan, progress = [], questions = [], today = toISODate() }) {
  const map = progressMap(progress);
  const dailyMinutes = plan?.daily_minutes || 45;
  const examDate = plan?.exam_date;

  const reviews = interleave(
    dueTopics(progress, today).map((topic) => {
      const record = map[topic.id] || {};
      const stage = Math.min(record.review_stage || 0, REVIEW_MODES.length - 1);
      return {
        key: `review:${topic.id}`,
        type: 'review',
        topicId: topic.id,
        topic,
        domainId: topic.domainId,
        minutes: REVIEW_MINUTES,
        overdue: diffDays(record.next_review_date, today),
        mode: REVIEW_MODES[stage]
      };
    })
  );

  const questionsDue = dueQuestions(questions, today);
  const questionBlock = questionsDue.length
    ? {
        key: `questions:${today}`,
        type: 'questions',
        minutes: Math.min(25, Math.max(8, Math.round(questionsDue.length * 2.5))),
        count: questionsDue.length,
        sample: questionsDue.slice(0, 3),
        mode: {
          key: 'questions',
          label: 'Revise your questions',
          detail: 'Answer first, then reveal. Rate each one honestly so the schedule stays honest.',
          science: 'practice testing'
        }
      }
    : null;

  const next = untouchedTopics(progress)[0];
  const newBlock = next
    ? {
        key: `new:${next.topicId}`,
        type: 'new',
        topicId: next.topicId,
        topic: next,
        domainId: next.domainId,
        minutes: next.minutes,
        mode: {
          key: 'first-pass',
          label: 'First pass',
          detail: 'Read or watch the module, then write a three-line summary in your own words.',
          science: 'make it personal'
        }
      }
    : null;

  const items = [];
  let used = 0;

  while (reviews.length && used + REVIEW_MINUTES <= dailyMinutes && items.length < 2) {
    items.push(reviews.shift());
    used += REVIEW_MINUTES;
  }

  if (questionBlock && used + questionBlock.minutes <= dailyMinutes + 4) {
    items.push(questionBlock);
    used += questionBlock.minutes;
  }

  if (newBlock && used + newBlock.minutes <= dailyMinutes + 4) {
    items.push(newBlock);
    used += newBlock.minutes;
  }

  while (reviews.length && used + REVIEW_MINUTES <= dailyMinutes + 4 && items.length < 6) {
    items.push(reviews.shift());
    used += REVIEW_MINUTES;
  }

  return {
    items,
    totalMinutes: used,
    overdueTopics: reviews.length,
    dueTopicCount: dueTopics(progress, today).length,
    dueQuestionCount: questionsDue.length,
    nextTopic: next || null,
    examDays: examDate ? daysUntilExam(examDate, today) : null
  };
}

export function computeStreak(sessions = [], today = toISODate()) {
  const active = new Set(
    sessions
      .filter((session) => (session.minutes || 0) > 0 || (session.tasks_completed || 0) > 0 || (session.questions_reviewed || 0) > 0)
      .map((session) => session.date)
  );
  let cursor = today;
  if (!active.has(cursor)) {
    cursor = addDays(today, -1);
    if (!active.has(cursor)) return 0;
  }
  let streak = 0;
  while (active.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export const LEVELS = [
  { name: 'Warming up', at: 0 },
  { name: 'Finding rhythm', at: 150 },
  { name: 'Building momentum', at: 400 },
  { name: 'Sharp', at: 800 },
  { name: 'Exam ready', at: 1400 }
];

export function levelFor(xp = 0) {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (xp >= level.at) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const span = next ? next.at - current.at : 1;
  return {
    index,
    name: current.name,
    next: next?.name || null,
    toNext: next ? Math.max(0, next.at - xp) : 0,
    pct: next ? Math.min(100, Math.round(((xp - current.at) / span) * 100)) : 100
  };
}

export function forecast(progress = [], questions = [], days = 14, today = toISODate()) {
  const rows = [];
  for (let i = 0; i < days; i += 1) {
    const date = addDays(today, i);
    const topics = progress.filter((record) => record.next_review_date === date).length;
    const questionCount = questions.filter((q) => q.status !== 'archived' && q.next_review_date === date).length;
    rows.push({ date, weekday: parseISO(date).getDay(), topics, questions: questionCount, count: topics + questionCount });
  }
  return rows;
}

export function computeStats({ plan, progress = [], questions = [], sessions = [], today = toISODate() }) {
  const map = progressMap(progress);
  const streak = computeStreak(sessions, today);
  const totalMinutes = sessions.reduce((sum, session) => sum + (session.minutes || 0), 0);
  const completedTasks = sessions.reduce((sum, session) => sum + (session.tasks_completed || 0), 0);
  const questionsReviewed = questions.reduce((sum, q) => sum + (q.times_reviewed || 0), 0);
  const questionsRecalled = questions.reduce((sum, q) => sum + (q.times_recalled || 0), 0);
  const xp = completedTasks * 15 + Math.round(totalMinutes / 2);
  const activeQuestions = questions.filter((q) => q.status !== 'archived');
  const weekStart = addDays(today, -6);
  const weekMinutes = sessions
    .filter((session) => session.date >= weekStart && session.date <= today)
    .reduce((sum, session) => sum + (session.minutes || 0), 0);

  const domains = DOMAINS.map((domain) => {
    const scores = domain.topics.map((topic) => mastery(topic, map[topic.id]));
    return {
      id: domain.id,
      name: domain.name,
      weight: domain.weight,
      mastery: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100),
      mastered: domain.topics.filter((topic) => map[topic.id]?.status === 'mastered').length,
      total: domain.topics.length
    };
  });

  return {
    streak,
    xp,
    level: levelFor(xp),
    totalMinutes,
    completedTasks,
    weekMinutes,
    readiness: readiness(progress),
    domains,
    forecast: forecast(progress, questions, 14, today),
    masteredTopics: TOPICS.filter((topic) => map[topic.id]?.status === 'mastered').length,
    startedTopics: progress.filter((record) => record.status && record.status !== 'not_started').length,
    totalTopics: TOTAL_TOPICS,
    questionCount: activeQuestions.length,
    questionAccuracy: questionsReviewed ? Math.round((questionsRecalled / questionsReviewed) * 100) : null,
    studyDays: sessions.filter((session) => (session.minutes || 0) > 0).length,
    examDays: plan?.exam_date ? daysUntilExam(plan.exam_date, today) : null
  };
}