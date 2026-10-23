import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QuestionDialog from '@/components/questions/QuestionDialog';
import RecallSession from '@/components/questions/RecallSession';
import { useStudy } from '@/lib/StudyContext';
import { TOPIC_MAP, TOPICS } from '@/lib/syllabus';
import { dueQuestions, friendlyDate, scheduleAfterReview } from '@/lib/scheduler';
import { bigCelebrate } from '@/lib/celebrate';

export default function Questions() {
  const { questions, plan, today, saveQuestion, deleteQuestion, logStudy } = useStudy();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const [session, setSession] = useState(null);
  const startedAt = useRef(null);

  const due = useMemo(() => dueQuestions(questions, today), [questions, today]);

  const startRecall = (list) => {
    const queue = list && list.length ? list : due;
    if (!queue.length) return;
    startedAt.current = Date.now();
    setSession(queue);
  };

  useEffect(() => {
    if (searchParams.get('recall') === '1') startRecall(due);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const rate = async (question, rating) => {
    const stage = Math.max(0, (question.box || 1) - 1);
    const schedule = scheduleAfterReview({ stage, rating, examDate: plan?.exam_date, today });
    let box = question.box || 1;
    if (rating === 'forgot') box = 1;
    else if (rating === 'good') box = Math.min(5, box + 1);
    else if (rating === 'easy') box = Math.min(5, box + 2);

    await saveQuestion({
      ...question,
      box,
      last_reviewed_date: today,
      next_review_date: schedule.next_review_date,
      times_reviewed: (question.times_reviewed || 0) + 1,
      times_recalled: (question.times_recalled || 0) + (rating === 'good' || rating === 'easy' ? 1 : 0),
      status: box >= 4 && (rating === 'good' || rating === 'easy') ? 'confident' : 'active'
    });
  };

  const finishSession = async (summary) => {
    const minutes = Math.max(1, Math.round((Date.now() - (startedAt.current || Date.now())) / 60000));
    const topicIds = Array.from(new Set((session || []).map((item) => item.topic_id).filter(Boolean)));
    await logStudy({
      minutes,
      tasks: 1,
      taskKey: `questions:${today}`,
      questionsReviewed: summary.total,
      topicIds
    });
    bigCelebrate();
  };

  const closeSession = () => {
    setSession(null);
    if (searchParams.get('recall')) setSearchParams({});
  };

  if (session) {
    return (
      <div className="space-y-5">
        <RecallSession
          questions={session}
          onRate={rate}
          onFinish={finishSession}
          onClose={closeSession}
        />
      </div>
    );
  }

  const filtered = questions
    .filter((question) => question.status !== 'archived')
    .filter((question) => topicFilter === 'all' || question.topic_id === topicFilter)
    .filter((question) =>
      query.trim() ? `${question.question} ${question.answer}`.toLowerCase().includes(query.trim().toLowerCase()) : true
    )
    .sort((a, b) => {
      const left = a.next_review_date || '0000-00-00';
      const right = b.next_review_date || '0000-00-00';
      if (left === right) return (a.box || 1) - (b.box || 1);
      return left < right ? -1 : 1;
    });

  return (
    <div className="space-y-5">
      <header className="panel p-6">
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Your question bank</p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">Questions you want to nail</h1>
        <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-muted-foreground">
          Add the questions you keep getting wrong. Each one gets its own schedule, and it comes back just before you
          would forget the answer.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="rounded-full" onClick={() => startRecall(due)} disabled={!due.length}>
            <Timer className="mr-2 h-4 w-4" />
            Revise {due.length ? `${due.length} due` : 'due questions'}
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add a question
          </Button>
          <span className="text-[0.75rem] text-muted-foreground">
            {questions.length} saved · {due.length} due today
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your questions"
            className="pl-9"
          />
        </div>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All topics" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All topics</SelectItem>
            {TOPICS.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((question) => {
            const topic = TOPIC_MAP[question.topic_id];
            const isDue = !question.next_review_date || question.next_review_date <= today;
            return (
              <div key={question.id || question.localKey} className="panel lift p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {topic ? <span className="chip">{topic.title}</span> : null}
                  <span className="chip">Box {question.box || 1}</span>
                  <span className={`chip ${isDue ? 'bg-clay/15 text-clay' : ''}`}>
                    {isDue ? 'Due now' : `Back ${friendlyDate(question.next_review_date, today)}`}
                  </span>
                  {question.source ? <span className="chip">{question.source}</span> : null}
                </div>
                <p className="mt-3 text-[0.98rem] leading-snug">{question.question}</p>
                <p className="mt-2 line-clamp-2 text-[0.84rem] leading-relaxed text-muted-foreground">
                  {question.answer}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="secondary" className="rounded-full" onClick={() => startRecall([question])}>
                    Revise this one
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => {
                      setEditing(question);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`rounded-full ${confirmId === question.id ? 'text-destructive' : ''}`}
                    onClick={() => {
                      if (confirmId === question.id) {
                        deleteQuestion(question);
                        setConfirmId(null);
                      } else {
                        setConfirmId(question.id);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    {confirmId === question.id ? 'Tap again to delete' : 'Delete'}
                  </Button>
                  <span className="text-[0.72rem] text-muted-foreground">
                    Reviewed {question.times_reviewed || 0} time{(question.times_reviewed || 0) === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel p-6">
          <h2 className="font-heading text-2xl">
            {questions.length ? 'Nothing matches that filter.' : 'Your question bank is empty.'}
          </h2>
          <p className="mt-2 max-w-lg text-[0.9rem] leading-relaxed text-muted-foreground">
            Paste in the questions you get wrong from practice tests — question, answer, and where it came from. They
            will spread through your week automatically.
          </p>
        </div>
      )}

      <QuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        question={editing}
        onSave={saveQuestion}
      />
    </div>
  );
}