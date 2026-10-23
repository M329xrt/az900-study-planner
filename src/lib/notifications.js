/** Fun, Duolingo-style reminders — in the app, and out of it when allowed. */
import { NUDGE_LINES, NUDGE_TITLES, pickFrom, pickQuote } from './quotes';

const NOTIFIED_KEY = 'momentum:notified';

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (error) {
    return 'denied';
  }
}

/**
 * Placeholders: {n} scheduled items, {q} questions due, {streak} days,
 * {p} readiness %. The single-letter variants keep the grammar right at one.
 */
function fill(template, data) {
  const count = data.planItems || data.dueTopics + data.dueQuestions || 0;
  const questionCount = data.dueQuestions || 0;
  const streak = data.streak || 0;

  return template
    .replace(/\{n\}/g, String(count))
    .replace(/\{s\}/g, count === 1 ? '' : 's')
    .replace(/\{is\}/g, count === 1 ? 'is' : 'are')
    .replace(/\{q\}/g, String(questionCount))
    .replace(/\{qs\}/g, questionCount === 1 ? '' : 's')
    .replace(/\{qis\}/g, questionCount === 1 ? 'is' : 'are')
    .replace(/\{streak\}/g, String(streak))
    .replace(/\{ss\}/g, streak === 1 ? '' : 's')
    .replace(/\{p\}/g, String(data.readinessPct || 0));
}

export function buildNudge({
  dueTopics = 0,
  dueQuestions = 0,
  planItems = 0,
  streak = 0,
  readinessPct = 0,
  style = 'playful',
  seed = ''
}) {
  const lines = NUDGE_LINES[style] || NUDGE_LINES.playful;
  const titles = NUDGE_TITLES[style] || NUDGE_TITLES.playful;
  const line = fill(pickFrom(lines, `${seed}:body`) || lines[0], {
    dueTopics,
    dueQuestions,
    planItems,
    streak,
    readinessPct
  });
  return {
    title: pickFrom(titles, `${seed}:title`) || titles[0],
    body: line,
    quote: pickQuote(`${seed}:quote`)
  };
}

function afterReminderTime(reminderTime, now = new Date()) {
  if (!reminderTime) return true;
  const [hour, minute] = reminderTime.split(':').map(Number);
  if (Number.isNaN(hour)) return true;
  return now.getHours() * 60 + now.getMinutes() >= hour * 60 + (minute || 0);
}

export function seenToday(today) {
  return seenKey(`momentum:nudge:${today}`);
}

function seenKey(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch (error) {
    return false;
  }
}

export function markSeen(today) {
  try {
    localStorage.setItem(`momentum:nudge:${today}`, '1');
  } catch (error) {
    /* ignore */
  }
}

/**
 * Fire a system notification when something is due, the user asked for it and
 * the app is not already on screen (the in-app card covers that case).
 */
export function maybeNotify({ plan, dueTopics = 0, dueQuestions = 0, streak = 0, readinessPct = 0, today }) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false;
  if (!dueTopics && !dueQuestions) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') return false;
  if (!afterReminderTime(plan?.reminder_time)) return false;
  if (!plan?.reminder_time && !afterReminderTime('17:00')) return false;

  try {
    if (localStorage.getItem(`${NOTIFIED_KEY}:${today}`) === '1') return false;
  } catch (error) {
    /* ignore */
  }

  const nudge = buildNudge({
    dueTopics,
    dueQuestions,
    streak,
    readinessPct,
    style: plan?.cheer_style || 'playful',
    seed: today
  });

  try {
    new Notification(nudge.title, {
      body: `${nudge.body}\n“${nudge.quote.text}” — ${nudge.quote.author}`,
      icon: '/mark.svg',
      badge: '/mark.svg',
      tag: 'momentum-daily'
    });
    localStorage.setItem(`${NOTIFIED_KEY}:${today}`, '1');
    return true;
  } catch (error) {
    return false;
  }
}