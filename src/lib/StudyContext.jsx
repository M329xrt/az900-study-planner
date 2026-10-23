import React, { createContext, useContext, useMemo } from 'react';
import useStudyData from '@/hooks/useStudyData';
import { buildTodayPlan, computeStats, toISODate } from '@/lib/scheduler';

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  const study = useStudyData();
  const today = toISODate();

  const value = useMemo(() => {
    const todayPlan = buildTodayPlan({
      plan: study.plan,
      progress: study.progress,
      questions: study.questions,
      today
    });
    const stats = computeStats({
      plan: study.plan,
      progress: study.progress,
      questions: study.questions,
      sessions: study.sessions,
      today
    });
    const todaySession = study.sessions.find((session) => session.date === today) || null;
    const doneKeys = todaySession?.task_keys || [];
    return { ...study, today, todayPlan, stats, todaySession, doneKeys };
  }, [study, today]);

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used inside StudyProvider');
  return context;
}