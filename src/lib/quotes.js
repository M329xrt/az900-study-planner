/** Motivational lines used by the nudges, cheers and celebration screens. */

export const QUOTES = [
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Little by little, one travels far.', author: 'J.R.R. Tolkien' },
  { text: 'Knowledge is of no value unless you put it into practice.', author: 'Anton Chekhov' },
  { text: 'I am still learning.', author: 'Michelangelo' },
  { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  { text: 'You do not have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Do not be afraid of going slowly; be afraid of standing still.', author: 'Chinese proverb' },
  { text: 'The mind is not a vessel to be filled, but a fire to be kindled.', author: 'Plutarch' },
  { text: 'Perseverance is not a long race; it is many short races one after another.', author: 'Walter Elliot' },
  { text: 'It is not that I am so smart, it is just that I stay with problems longer.', author: 'Albert Einstein' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'Repetition is the mother of learning, the father of action.', author: 'Zig Ziglar' },
  { text: 'Small daily improvements are the key to staggering long-term results.', author: 'Robin Sharma' },
  { text: 'Take care of the minutes and the hours will take care of themselves.', author: 'Lord Chesterfield' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'You are always a student, never a master. You have to keep moving forward.', author: 'Conrad Hall' },
  { text: 'There are no shortcuts to any place worth going.', author: 'Beverly Sills' },
  { text: 'Whether you think you can or you think you cannot, you are right.', author: 'Henry Ford' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'One hour of focused work beats three hours of half-attention.', author: 'Momentum' },
  { text: 'You are allowed to forget. That is exactly why the schedule brings things back.', author: 'Momentum' }
];

function hash(value) {
  const text = String(value ?? '');
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function pickFrom(list, seed) {
  if (!list || !list.length) return null;
  return list[hash(seed) % list.length];
}

export function pickQuote(seed) {
  return pickFrom(QUOTES, seed);
}

/** Duolingo-style reminders: cheeky, but never shaming. */
export const NUDGE_LINES = {
  calm: [
    'A short revision block is ready whenever you have a quiet moment.',
    'Your schedule has {n} item{s} ready. No rush — the plan is patient.',
    'A small session today keeps everything exactly where you left it.',
    'You are {p}% of the way to exam ready. One block at a time.'
  ],
  playful: [
    'Your brain quietly dropped something you learned last week. Shall we go and get it?',
    '{n} thing{s} in your schedule {is} waving at you.',
    'Tiny session, big brain. Fifteen minutes and you are done.',
    'Breaking a streak is easy. Keeping one is more fun — {streak} day{ss} so far.',
    '{q} question{qs} of yours {qis} asking for a rematch. You know you want to.',
    'You are {p}% exam ready. The last few percent are the satisfying ones.'
  ],
  hype: [
    '{n} revision block{s} on the board. Let us clear them.',
    'Fifteen minutes of recall beats two hours of reading. Go get it.',
    '{streak} day{ss} on the board. Do not let it end on your watch.',
    '{p}% exam ready. Push it higher.',
    'The exam does not care how you feel today. The schedule does. Go.'
  ]
};

export const NUDGE_TITLES = {
  calm: ['A gentle nudge', 'Whenever you are ready', 'Your plan is waiting'],
  playful: ['Your brain called', 'Um, excuse me?', 'Small reminder, big deal', 'Today is a good day to pass'],
  hype: ['Time to move', 'Let us go', 'On it today']
};

export const TASK_CHEERS = [
  'Done and dusted.',
  'That is one more memory saved.',
  'Beautiful. Straight into long-term storage.',
  'That is how it sticks.',
  'Nice recall. The exam should be worried.',
  'Logged. Your future self says thanks.',
  'Another block cleared.',
  'Quietly excellent.'
];

export const STREAK_CHEERS = [
  '{streak} days in a row — that is a habit forming.',
  '{streak} days straight. Consistency is doing the heavy lifting.',
  '{streak} days. This is why you will pass.'
];

export const REFLECTION_PROMPTS = [
  'Explain today’s trickiest idea in two sentences, as if to a friend.',
  'What still feels fuzzy after today’s session?',
  'Which analogy made it click for you today?',
  'What would you put on a one-page cheat sheet for this topic?'
];