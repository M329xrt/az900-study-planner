import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TOPICS } from '@/lib/syllabus';

export default function QuestionDialog({ open, onOpenChange, question, onSave }) {
  const [topicId, setTopicId] = useState(question?.topic_id || TOPICS[0].id);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTopicId(question?.topic_id || TOPICS[0].id);
    setPrompt(question?.question || '');
    setAnswer(question?.answer || '');
    setSource(question?.source || '');
    setError('');
  }, [open, question]);

  const submit = async () => {
    if (!prompt.trim() || !answer.trim()) {
      setError('A question needs both a prompt and an answer you can check yourself against.');
      return;
    }
    setSaving(true);
    await onSave({
      ...(question || {}),
      topic_id: topicId,
      question: prompt.trim(),
      answer: answer.trim(),
      source: source.trim()
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {question ? 'Edit question' : 'Add a question'}
          </DialogTitle>
          <DialogDescription>
            Your own questions get the same spaced schedule as the topics, so each one returns right before you
            would forget it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Topic</Label>
            <Select value={topicId} onValueChange={setTopicId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a topic" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {TOPICS.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-prompt">Question</Label>
            <Textarea
              id="question-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              placeholder="What does the shared responsibility model say you are always responsible for?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-answer">Answer</Label>
            <Textarea
              id="question-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={3}
              placeholder="Your own words — the version you would write under exam pressure."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-source">Where it came from (optional)</Label>
            <Input
              id="question-source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Practice test 1, question 12"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : question ? 'Save changes' : 'Add question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}