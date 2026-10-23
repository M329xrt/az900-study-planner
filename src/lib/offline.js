/**
 * Offline support.
 *
 * Every read is served from a local cache first, so the app opens instantly and
 * works with no signal. Writes are applied locally immediately and pushed to the
 * server when there is a connection; if there is not, they queue up and flush
 * the moment the device is back online. Records that were never saved get a
 * localKey so repeated edits offline stay a single queued change.
 */
import { base44 } from '@/api/base44Client';

const PREFIX = 'momentum:';
const QUEUE_KEY = 'queue';

export function readCache(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    /* storage full or unavailable — the app still works for this session */
  }
}

export function readQueue() {
  return readCache(QUEUE_KEY, []);
}

export function writeQueue(queue) {
  writeCache(QUEUE_KEY, queue);
}

export function enqueue(op) {
  const queue = readQueue().filter((existing) => !(op.localKey && existing.localKey === op.localKey));
  queue.push(op);
  writeQueue(queue);
  return queue;
}

export function removeQueued(localKey) {
  if (!localKey) return readQueue();
  const queue = readQueue().filter((op) => op.localKey !== localKey);
  writeQueue(queue);
  return queue;
}

export async function flushQueue() {
  const queue = readQueue();
  if (!queue.length || typeof navigator === 'undefined' || !navigator.onLine) return queue;

  const remaining = [];
  for (const op of queue) {
    try {
      const entity = base44.entities[op.entity];
      if (!entity) continue;

      if (op.action === 'delete') {
        if (op.id) await entity.delete(op.id);
        continue;
      }

      if (op.action === 'create') {
        let existing = null;
        if (op.dedupe) {
          const found = await entity.filter(op.dedupe, { limit: 1 });
          existing = found?.items?.[0] || null;
        }
        if (existing) await entity.update(existing.id, op.data);
        else await entity.create(op.data);
        continue;
      }

      if (op.id) await entity.update(op.id, op.data);
    } catch (error) {
      remaining.push(op);
    }
  }

  writeQueue(remaining);
  return remaining;
}