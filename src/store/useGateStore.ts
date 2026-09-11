'use client';

import { create } from 'zustand';
import {
  Subject,
  Topic,
  TopicProgress,
  StudySession,
  PYQRecord,
  MockTest,
  RevisionItem,
  PlannerTask,
  NoteItem,
  GoalItem,
  Achievement,
  UserSettings,
  TopicStatus,
  ExamBranch,
  WeaknessItem,
} from '@/types';
import {
  DEFAULT_ALL_SUBJECTS,
  DEFAULT_GATE_CS_SUBJECTS,
  DEFAULT_GATE_DA_SUBJECTS,
} from '@/data/syllabus';
import {
  INITIAL_USER_SETTINGS,
  INITIAL_TOPIC_PROGRESS,
  INITIAL_STUDY_SESSIONS,
  INITIAL_PYQ_RECORDS,
  INITIAL_MOCK_TESTS,
  INITIAL_REVISION_ITEMS,
  INITIAL_PLANNER_TASKS,
  INITIAL_NOTES,
  INITIAL_GOALS,
  INITIAL_ACHIEVEMENTS,
} from '@/data/sampleData';

const STORAGE_KEY = 'gate_2027_command_center_v1';

interface GateState {
  settings: UserSettings;
  subjects: Subject[];
  topicProgress: Record<string, TopicProgress>;
  studySessions: StudySession[];
  pyqRecords: PYQRecord[];
  mockTests: MockTest[];
  revisionItems: RevisionItem[];
  plannerTasks: PlannerTask[];
  notes: NoteItem[];
  goals: GoalItem[];
  achievements: Achievement[];
  isHydrated: boolean;

  // Actions
  hydrate: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  
  // Dynamic Subject & Topic CRUD
  addSubject: (subject: Omit<Subject, 'id' | 'topics'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, topic: { name: string; subCategory?: string; defaultDifficulty?: 'easy' | 'medium' | 'hard' }) => void;
  updateTopic: (topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (topicId: string) => void;
  resetSyllabusToDefault: () => void;

  // Topic Progress Actions
  setTopicStatus: (topicId: string, status: TopicStatus) => void;
  updateTopicProgress: (topicId: string, update: Partial<TopicProgress>) => void;
  
  // Study Sessions Actions
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  deleteStudySession: (id: string) => void;
  
  // PYQ Actions
  addPYQRecord: (pyq: Omit<PYQRecord, 'id'>) => void;
  deletePYQRecord: (id: string) => void;
  
  // Mock Tests Actions
  addMockTest: (mock: Omit<MockTest, 'id'>) => void;
  deleteMockTest: (id: string) => void;
  
  // Revision Actions
  addRevisionItem: (item: Omit<RevisionItem, 'id'>) => void;
  completeRevision: (id: string) => void;
  deleteRevisionItem: (id: string) => void;
  
  // Planner Actions
  addPlannerTask: (task: Omit<PlannerTask, 'id'>) => void;
  togglePlannerTask: (id: string) => void;
  deletePlannerTask: (id: string) => void;
  
  // Notes Actions
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  
  // Goals Actions
  addGoal: (goal: Omit<GoalItem, 'id' | 'completed'>) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  
  // Data Management
  loadSampleData: () => void;
  clearSampleData: () => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;

  // Computed / Helper selectors
  getSubject: (subjectId: string) => Subject | undefined;
  getTopic: (topicId: string) => Topic | undefined;
  getAllTopics: () => Topic[];
  getOverallStats: () => {
    totalTopics: number;
    completedTopics: number;
    overallProgressPercent: number;
    csTotalTopics: number;
    csCompletedTopics: number;
    csProgressPercent: number;
    daTotalTopics: number;
    daCompletedTopics: number;
    daProgressPercent: number;
    totalStudyHours: number;
    totalPYQsSolved: number;
    totalPYQsCorrect: number;
    pyqAccuracyPercent: number;
    mockTestsCount: number;
    currentStreak: number;
  };
  getSubjectProgress: (subjectId: string) => {
    totalTopics: number;
    completedTopics: number;
    learningTopics: number;
    needsRevisionTopics: number;
    notStartedTopics: number;
    progressPercent: number;
    studyHours: number;
    pyqsAttempted: number;
    pyqsCorrect: number;
    averageConfidence: number;
  };
  getWeaknesses: () => WeaknessItem[];
  getWeeklySummary: () => {
    thisWeekStudyHours: number;
    lastWeekStudyHours: number;
    thisWeekPYQs: number;
    lastWeekPYQs: number;
    thisWeekAccuracy: number;
    thisWeekTopicsCompleted: number;
    thisWeekMocks: number;
  };
  getDynamicInsight: () => string;
}

const saveToLocalStorage = (state: Partial<GateState>) => {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      settings: state.settings,
      subjects: state.subjects,
      topicProgress: state.topicProgress,
      studySessions: state.studySessions,
      pyqRecords: state.pyqRecords,
      mockTests: state.mockTests,
      revisionItems: state.revisionItems,
      plannerTasks: state.plannerTasks,
      notes: state.notes,
      goals: state.goals,
      achievements: state.achievements,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save to LocalStorage:', e);
  }
};

export const useGateStore = create<GateState>((set, get) => ({
  settings: { ...INITIAL_USER_SETTINGS, hasSampleData: false },
  subjects: DEFAULT_ALL_SUBJECTS,
  topicProgress: {},
  studySessions: [],
  pyqRecords: [],
  mockTests: [],
  revisionItems: [],
  plannerTasks: [],
  notes: [],
  goals: [],
  achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, progress: 0, unlockedAt: undefined })),
  isHydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          settings: { ...INITIAL_USER_SETTINGS, ...parsed.settings },
          subjects: parsed.subjects && Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : DEFAULT_ALL_SUBJECTS,
          topicProgress: parsed.topicProgress || {},
          studySessions: parsed.studySessions || [],
          pyqRecords: parsed.pyqRecords || [],
          mockTests: parsed.mockTests || [],
          revisionItems: parsed.revisionItems || [],
          plannerTasks: parsed.plannerTasks || [],
          notes: parsed.notes || [],
          goals: parsed.goals || [],
          achievements: parsed.achievements || INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, progress: 0, unlockedAt: undefined })),
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
        saveToLocalStorage(get());
      }
    } catch (e) {
      console.error('Error hydrating from LocalStorage', e);
      set({ isHydrated: true });
    }
  },

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      saveToLocalStorage({ ...state, settings: updated });
      return { settings: updated };
    });
  },

  // Dynamic Subject & Topic CRUD
  addSubject: (subjectData) => {
    set((state) => {
      const id = `subj-${Date.now()}`;
      const newSubject: Subject = {
        ...subjectData,
        id,
        topics: [],
      };
      const updated = [...state.subjects, newSubject];
      saveToLocalStorage({ ...state, subjects: updated });
      return { subjects: updated };
    });
  },

  updateSubject: (id, updates) => {
    set((state) => {
      const updated = state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveToLocalStorage({ ...state, subjects: updated });
      return { subjects: updated };
    });
  },

  deleteSubject: (id) => {
    set((state) => {
      const targetSub = state.subjects.find((s) => s.id === id);
      const topicIdsToRemove = targetSub ? targetSub.topics.map((t) => t.id) : [];

      const updatedSubjects = state.subjects.filter((s) => s.id !== id);
      const updatedProgress = { ...state.topicProgress };
      topicIdsToRemove.forEach((tId) => delete updatedProgress[tId]);

      saveToLocalStorage({
        ...state,
        subjects: updatedSubjects,
        topicProgress: updatedProgress,
      });

      return {
        subjects: updatedSubjects,
        topicProgress: updatedProgress,
      };
    });
  },

  addTopic: (subjectId, topicData) => {
    set((state) => {
      const subject = state.subjects.find((s) => s.id === subjectId);
      if (!subject) return state;

      const id = `top-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newTopic: Topic = {
        id,
        name: topicData.name,
        subCategory: topicData.subCategory,
        subjectId,
        branch: subject.branch,
        defaultDifficulty: topicData.defaultDifficulty || 'medium',
      };

      const updatedSubjects = state.subjects.map((s) =>
        s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s
      );

      saveToLocalStorage({ ...state, subjects: updatedSubjects });
      return { subjects: updatedSubjects };
    });
  },

  updateTopic: (topicId, updates) => {
    set((state) => {
      const updatedSubjects = state.subjects.map((s) => ({
        ...s,
        topics: s.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
      }));

      saveToLocalStorage({ ...state, subjects: updatedSubjects });
      return { subjects: updatedSubjects };
    });
  },

  deleteTopic: (topicId) => {
    set((state) => {
      const updatedSubjects = state.subjects.map((s) => ({
        ...s,
        topics: s.topics.filter((t) => t.id !== topicId),
      }));

      const updatedProgress = { ...state.topicProgress };
      delete updatedProgress[topicId];

      saveToLocalStorage({
        ...state,
        subjects: updatedSubjects,
        topicProgress: updatedProgress,
      });

      return {
        subjects: updatedSubjects,
        topicProgress: updatedProgress,
      };
    });
  },

  resetSyllabusToDefault: () => {
    set((state) => {
      saveToLocalStorage({ ...state, subjects: DEFAULT_ALL_SUBJECTS });
      return { subjects: DEFAULT_ALL_SUBJECTS };
    });
  },

  setTopicStatus: (topicId, status) => {
    set((state) => {
      const current = state.topicProgress[topicId] || {
        topicId,
        status: 'not_started',
        studyHours: 0,
        confidence: 3,
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
      };

      const nowStr = new Date().toISOString().split('T')[0];
      const nextRev = new Date();
      nextRev.setDate(nextRev.getDate() + 1);
      const nextRevStr = nextRev.toISOString().split('T')[0];

      const updatedProgress = {
        ...state.topicProgress,
        [topicId]: {
          ...current,
          status,
          lastStudiedDate: status !== 'not_started' ? nowStr : current.lastStudiedDate,
          nextRevisionDate: status === 'completed' ? nextRevStr : current.nextRevisionDate,
        },
      };

      let updatedRevisions = state.revisionItems;
      const topicObj = state.getAllTopics().find((t) => t.id === topicId);
      if (status === 'completed' && topicObj) {
        const hasActiveRevision = state.revisionItems.some((r) => r.topicId === topicId && !r.isCompleted);
        if (!hasActiveRevision) {
          const newRev: RevisionItem = {
            id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            topicId,
            subjectId: topicObj.subjectId,
            branch: topicObj.branch,
            stage: 1,
            scheduledDate: nextRevStr,
            isCompleted: false,
            notes: 'Stage 1 Spaced Review',
          };
          updatedRevisions = [newRev, ...state.revisionItems];
        }
      }

      saveToLocalStorage({ ...state, topicProgress: updatedProgress, revisionItems: updatedRevisions });
      return { topicProgress: updatedProgress, revisionItems: updatedRevisions };
    });
  },

  updateTopicProgress: (topicId, update) => {
    set((state) => {
      const current = state.topicProgress[topicId] || {
        topicId,
        status: 'not_started',
        studyHours: 0,
        confidence: 3,
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
      };

      const updatedProgress = {
        ...state.topicProgress,
        [topicId]: { ...current, ...update },
      };

      saveToLocalStorage({ ...state, topicProgress: updatedProgress });
      return { topicProgress: updatedProgress };
    });
  },

  addStudySession: (sessionData) => {
    set((state) => {
      const id = `sess-${Date.now()}`;
      const newSession: StudySession = { ...sessionData, id };
      const updatedSessions = [newSession, ...state.studySessions];

      const current = state.topicProgress[sessionData.topicId] || {
        topicId: sessionData.topicId,
        status: 'learning',
        studyHours: 0,
        confidence: sessionData.confidenceAfter || 3,
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
      };

      const durationHours = sessionData.durationMinutes / 60;
      const updatedProgress = {
        ...state.topicProgress,
        [sessionData.topicId]: {
          ...current,
          status: current.status === 'not_started' ? 'learning' : current.status,
          studyHours: Number((current.studyHours + durationHours).toFixed(2)),
          confidence: sessionData.confidenceAfter || current.confidence,
          pyqsAttempted: current.pyqsAttempted + (sessionData.pyqsSolved || 0),
          pyqsCorrect: current.pyqsCorrect + (sessionData.pyqsSolved || 0),
          lastStudiedDate: sessionData.date.split('T')[0],
        },
      };

      const updatedGoals = state.goals.map((g) => {
        if (g.targetMetric === 'study_hours') {
          return { ...g, currentValue: Number((g.currentValue + durationHours).toFixed(1)) };
        }
        if (g.targetMetric === 'pyqs' && sessionData.pyqsSolved > 0) {
          return { ...g, currentValue: g.currentValue + sessionData.pyqsSolved };
        }
        return g;
      });

      saveToLocalStorage({
        ...state,
        studySessions: updatedSessions,
        topicProgress: updatedProgress,
        goals: updatedGoals,
      });

      return {
        studySessions: updatedSessions,
        topicProgress: updatedProgress,
        goals: updatedGoals,
      };
    });
  },

  deleteStudySession: (id) => {
    set((state) => {
      const updated = state.studySessions.filter((s) => s.id !== id);
      saveToLocalStorage({ ...state, studySessions: updated });
      return { studySessions: updated };
    });
  },

  addPYQRecord: (pyqData) => {
    set((state) => {
      const id = `pyq-${Date.now()}`;
      const newPYQ: PYQRecord = { ...pyqData, id };
      const updatedRecords = [newPYQ, ...state.pyqRecords];

      const current = state.topicProgress[pyqData.topicId] || {
        topicId: pyqData.topicId,
        status: 'learning',
        studyHours: 0,
        confidence: 3,
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
      };

      const updatedProgress = {
        ...state.topicProgress,
        [pyqData.topicId]: {
          ...current,
          pyqsAttempted: current.pyqsAttempted + 1,
          pyqsCorrect: current.pyqsCorrect + (pyqData.isCorrect ? 1 : 0),
          lastStudiedDate: pyqData.date,
        },
      };

      saveToLocalStorage({
        ...state,
        pyqRecords: updatedRecords,
        topicProgress: updatedProgress,
      });

      return {
        pyqRecords: updatedRecords,
        topicProgress: updatedProgress,
      };
    });
  },

  deletePYQRecord: (id) => {
    set((state) => {
      const updated = state.pyqRecords.filter((p) => p.id !== id);
      saveToLocalStorage({ ...state, pyqRecords: updated });
      return { pyqRecords: updated };
    });
  },

  addMockTest: (mockData) => {
    set((state) => {
      const id = `mock-${Date.now()}`;
      const newMock: MockTest = { ...mockData, id };
      const updatedMocks = [newMock, ...state.mockTests];
      saveToLocalStorage({ ...state, mockTests: updatedMocks });
      return { mockTests: updatedMocks };
    });
  },

  deleteMockTest: (id) => {
    set((state) => {
      const updated = state.mockTests.filter((m) => m.id !== id);
      saveToLocalStorage({ ...state, mockTests: updated });
      return { mockTests: updated };
    });
  },

  addRevisionItem: (itemData) => {
    set((state) => {
      const id = `rev-${Date.now()}`;
      const newItem: RevisionItem = { ...itemData, id };
      const updatedRevisions = [newItem, ...state.revisionItems];
      saveToLocalStorage({ ...state, revisionItems: updatedRevisions });
      return { revisionItems: updatedRevisions };
    });
  },

  completeRevision: (id) => {
    set((state) => {
      const target = state.revisionItems.find((r) => r.id === id);
      if (!target) return state;

      const nowStr = new Date().toISOString().split('T')[0];
      const nextStage = (target.stage < 5 ? (target.stage + 1) as 1 | 2 | 3 | 4 | 5 : 5);
      
      const stageDaysMap = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
      const daysToAdd = stageDaysMap[nextStage];
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      const updatedRevisions = state.revisionItems.map((r) =>
        r.id === id ? { ...r, isCompleted: true, completedDate: nowStr } : r
      );

      let finalRevisions = updatedRevisions;
      if (target.stage < 5) {
        const nextRevItem: RevisionItem = {
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          topicId: target.topicId,
          subjectId: target.subjectId,
          branch: target.branch,
          stage: nextStage,
          scheduledDate: nextDateStr,
          isCompleted: false,
          notes: `Stage ${nextStage} Spaced Review (+${daysToAdd} days)`,
        };
        finalRevisions = [nextRevItem, ...updatedRevisions];
      }

      const current = state.topicProgress[target.topicId] || {
        topicId: target.topicId,
        status: 'completed',
        studyHours: 0,
        confidence: 4,
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        revisionCount: 0,
      };

      const updatedProgress = {
        ...state.topicProgress,
        [target.topicId]: {
          ...current,
          revisionCount: current.revisionCount + 1,
          lastStudiedDate: nowStr,
          nextRevisionDate: target.stage < 5 ? nextDateStr : undefined,
          status: current.status === 'needs_revision' ? 'completed' : current.status,
        },
      };

      saveToLocalStorage({
        ...state,
        revisionItems: finalRevisions,
        topicProgress: updatedProgress,
      });

      return {
        revisionItems: finalRevisions,
        topicProgress: updatedProgress,
      };
    });
  },

  deleteRevisionItem: (id) => {
    set((state) => {
      const updated = state.revisionItems.filter((r) => r.id !== id);
      saveToLocalStorage({ ...state, revisionItems: updated });
      return { revisionItems: updated };
    });
  },

  addPlannerTask: (taskData) => {
    set((state) => {
      const id = `task-${Date.now()}`;
      const newTask: PlannerTask = { ...taskData, id };
      const updated = [newTask, ...state.plannerTasks];
      saveToLocalStorage({ ...state, plannerTasks: updated });
      return { plannerTasks: updated };
    });
  },

  togglePlannerTask: (id) => {
    set((state) => {
      const updated = state.plannerTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      saveToLocalStorage({ ...state, plannerTasks: updated });
      return { plannerTasks: updated };
    });
  },

  deletePlannerTask: (id) => {
    set((state) => {
      const updated = state.plannerTasks.filter((t) => t.id !== id);
      saveToLocalStorage({ ...state, plannerTasks: updated });
      return { plannerTasks: updated };
    });
  },

  addNote: (noteData) => {
    set((state) => {
      const id = `note-${Date.now()}`;
      const now = new Date().toISOString();
      const newNote: NoteItem = { ...noteData, id, createdAt: now, updatedAt: now };
      const updated = [newNote, ...state.notes];
      saveToLocalStorage({ ...state, notes: updated });
      return { notes: updated };
    });
  },

  updateNote: (id, noteUpdate) => {
    set((state) => {
      const now = new Date().toISOString();
      const updated = state.notes.map((n) => (n.id === id ? { ...n, ...noteUpdate, updatedAt: now } : n));
      saveToLocalStorage({ ...state, notes: updated });
      return { notes: updated };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const updated = state.notes.filter((n) => n.id !== id);
      saveToLocalStorage({ ...state, notes: updated });
      return { notes: updated };
    });
  },

  addGoal: (goalData) => {
    set((state) => {
      const id = `goal-${Date.now()}`;
      const newGoal: GoalItem = { ...goalData, id, completed: false };
      const updated = [newGoal, ...state.goals];
      saveToLocalStorage({ ...state, goals: updated });
      return { goals: updated };
    });
  },

  toggleGoal: (id) => {
    set((state) => {
      const updated = state.goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
      saveToLocalStorage({ ...state, goals: updated });
      return { goals: updated };
    });
  },

  deleteGoal: (id) => {
    set((state) => {
      const updated = state.goals.filter((g) => g.id !== id);
      saveToLocalStorage({ ...state, goals: updated });
      return { goals: updated };
    });
  },

  loadSampleData: () => {
    set((state) => {
      const demoState = {
        settings: { ...state.settings, hasSampleData: true },
        topicProgress: INITIAL_TOPIC_PROGRESS,
        studySessions: INITIAL_STUDY_SESSIONS,
        pyqRecords: INITIAL_PYQ_RECORDS,
        mockTests: INITIAL_MOCK_TESTS,
        revisionItems: INITIAL_REVISION_ITEMS,
        plannerTasks: INITIAL_PLANNER_TASKS,
        notes: INITIAL_NOTES,
        goals: INITIAL_GOALS,
        achievements: INITIAL_ACHIEVEMENTS,
      };
      saveToLocalStorage({ ...state, ...demoState });
      return demoState;
    });
  },

  clearSampleData: () => {
    set((state) => {
      const freshSettings = { ...state.settings, hasSampleData: false };
      const freshState = {
        settings: freshSettings,
        topicProgress: {},
        studySessions: [],
        pyqRecords: [],
        mockTests: [],
        revisionItems: [],
        plannerTasks: [],
        notes: [],
        goals: [],
        achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, progress: 0, unlockedAt: undefined })),
      };
      saveToLocalStorage({ ...state, ...freshState });
      return freshState;
    });
  },

  resetAllData: () => {
    set(() => {
      const freshState = {
        settings: { ...INITIAL_USER_SETTINGS, hasSampleData: false, hasCompletedOnboarding: false },
        subjects: DEFAULT_ALL_SUBJECTS,
        topicProgress: {},
        studySessions: [],
        pyqRecords: [],
        mockTests: [],
        revisionItems: [],
        plannerTasks: [],
        notes: [],
        goals: [],
        achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, progress: 0, unlockedAt: undefined })),
      };
      saveToLocalStorage(freshState);
      return freshState;
    });
  },

  exportDataJSON: () => {
    const state = get();
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'GATE 2027 Command Center',
      settings: state.settings,
      subjects: state.subjects,
      topicProgress: state.topicProgress,
      studySessions: state.studySessions,
      pyqRecords: state.pyqRecords,
      mockTests: state.mockTests,
      revisionItems: state.revisionItems,
      plannerTasks: state.plannerTasks,
      notes: state.notes,
      goals: state.goals,
      achievements: state.achievements,
    };
    return JSON.stringify(exportObject, null, 2);
  },

  importDataJSON: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      set((state) => {
        const imported = {
          settings: { ...state.settings, ...(parsed.settings || {}) },
          subjects: parsed.subjects && Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : state.subjects,
          topicProgress: parsed.topicProgress || {},
          studySessions: parsed.studySessions || [],
          pyqRecords: parsed.pyqRecords || [],
          mockTests: parsed.mockTests || [],
          revisionItems: parsed.revisionItems || [],
          plannerTasks: parsed.plannerTasks || [],
          notes: parsed.notes || [],
          goals: parsed.goals || [],
          achievements: parsed.achievements || state.achievements,
        };
        saveToLocalStorage({ ...state, ...imported });
        return imported;
      });
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },

  getSubject: (subjectId: string) => {
    return get().subjects.find((s) => s.id === subjectId);
  },

  getTopic: (topicId: string) => {
    for (const s of get().subjects) {
      const found = s.topics.find((t) => t.id === topicId);
      if (found) return found;
    }
    return undefined;
  },

  getAllTopics: () => {
    return get().subjects.flatMap((s) => s.topics);
  },

  getOverallStats: () => {
    const state = get();
    const allTopics = state.getAllTopics();
    const csTopics = state.subjects.filter((s) => s.branch === 'CS').flatMap((s) => s.topics);
    const daTopics = state.subjects.filter((s) => s.branch === 'DA').flatMap((s) => s.topics);

    let completedTopics = 0;
    let csCompletedTopics = 0;
    let daCompletedTopics = 0;
    let totalStudyHours = 0;

    for (const [topicId, progress] of Object.entries(state.topicProgress)) {
      if (progress.status === 'completed') {
        completedTopics++;
        const topic = state.getTopic(topicId);
        if (topic?.branch === 'CS') csCompletedTopics++;
        if (topic?.branch === 'DA') daCompletedTopics++;
      }
      totalStudyHours += progress.studyHours || 0;
    }

    const totalPYQsSolved = state.pyqRecords.length;
    const totalPYQsCorrect = state.pyqRecords.filter((p) => p.isCorrect).length;
    const pyqAccuracyPercent = totalPYQsSolved > 0 ? Number(((totalPYQsCorrect / totalPYQsSolved) * 100).toFixed(1)) : 0;

    const sessionDates = Array.from(
      new Set(state.studySessions.map((s) => s.date.split('T')[0]))
    ).sort().reverse();

    let streak = 0;
    if (sessionDates.length > 0) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let checkDate = sessionDates.includes(todayStr) ? today : (sessionDates.includes(yesterdayStr) ? yesterday : null);

      if (checkDate) {
        let cursor = new Date(checkDate);
        while (true) {
          const cStr = cursor.toISOString().split('T')[0];
          if (sessionDates.includes(cStr)) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    const overallPct = allTopics.length > 0 ? Number(((completedTopics / allTopics.length) * 100).toFixed(1)) : 0;
    const csPct = csTopics.length > 0 ? Number(((csCompletedTopics / csTopics.length) * 100).toFixed(1)) : 0;
    const daPct = daTopics.length > 0 ? Number(((daCompletedTopics / daTopics.length) * 100).toFixed(1)) : 0;

    return {
      totalTopics: allTopics.length,
      completedTopics,
      overallProgressPercent: overallPct,
      csTotalTopics: csTopics.length,
      csCompletedTopics,
      csProgressPercent: csPct,
      daTotalTopics: daTopics.length,
      daCompletedTopics,
      daProgressPercent: daPct,
      totalStudyHours: Number(totalStudyHours.toFixed(1)),
      totalPYQsSolved,
      totalPYQsCorrect,
      pyqAccuracyPercent,
      mockTestsCount: state.mockTests.length,
      currentStreak: streak,
    };
  },

  getSubjectProgress: (subjectId: string) => {
    const state = get();
    const subject = state.getSubject(subjectId);
    if (!subject) {
      return {
        totalTopics: 0,
        completedTopics: 0,
        learningTopics: 0,
        needsRevisionTopics: 0,
        notStartedTopics: 0,
        progressPercent: 0,
        studyHours: 0,
        pyqsAttempted: 0,
        pyqsCorrect: 0,
        averageConfidence: 0,
      };
    }

    let completed = 0;
    let learning = 0;
    let needsRevision = 0;
    let studyHours = 0;
    let pyqsAttempted = 0;
    let pyqsCorrect = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;

    for (const topic of subject.topics) {
      const p = state.topicProgress[topic.id];
      if (!p || p.status === 'not_started') continue;

      if (p.status === 'completed') completed++;
      if (p.status === 'learning') learning++;
      if (p.status === 'needs_revision') needsRevision++;

      studyHours += p.studyHours || 0;
      pyqsAttempted += p.pyqsAttempted || 0;
      pyqsCorrect += p.pyqsCorrect || 0;
      if (p.confidence) {
        confidenceSum += p.confidence;
        confidenceCount++;
      }
    }

    const totalTopics = subject.topics.length;
    const notStartedTopics = totalTopics - completed - learning - needsRevision;
    const progressPercent = totalTopics > 0 ? Number(((completed / totalTopics) * 100).toFixed(1)) : 0;
    const averageConfidence = confidenceCount > 0 ? Number((confidenceSum / confidenceCount).toFixed(1)) : 3.0;

    return {
      totalTopics,
      completedTopics: completed,
      learningTopics: learning,
      needsRevisionTopics: needsRevision,
      notStartedTopics,
      progressPercent,
      studyHours: Number(studyHours.toFixed(1)),
      pyqsAttempted,
      pyqsCorrect,
      averageConfidence,
    };
  },

  getWeaknesses: () => {
    const state = get();
    const now = new Date().getTime();
    const weaknesses: WeaknessItem[] = [];

    for (const [topicId, progress] of Object.entries(state.topicProgress)) {
      const topic = state.getTopic(topicId);
      if (!topic) continue;
      const subject = state.getSubject(topic.subjectId);
      if (!subject) continue;

      let score = 0;
      const reasons: string[] = [];

      const conf = progress.confidence || 3;
      if (conf <= 2) {
        score += (5 - conf) * 10;
        reasons.push(`Low confidence score (${conf}/5)`);
      }

      const pyqAccuracy =
        progress.pyqsAttempted > 0 ? (progress.pyqsCorrect / progress.pyqsAttempted) * 100 : 70;
      if (progress.pyqsAttempted >= 4 && pyqAccuracy < 65) {
        score += ((65 - pyqAccuracy) / 65) * 30;
        reasons.push(`Low PYQ accuracy (${Math.round(pyqAccuracy)}%)`);
      }

      if (progress.status === 'needs_revision') {
        score += 25;
        reasons.push('Explicitly flagged for revision');
      }

      let daysSince = 0;
      if (progress.lastStudiedDate) {
        const lastDate = new Date(progress.lastStudiedDate).getTime();
        daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        if (daysSince > 10) {
          score += Math.min(15, (daysSince - 10) * 1.5);
          reasons.push(`Not studied in ${daysSince} days`);
        }
      }

      if (score >= 20 || progress.status === 'needs_revision') {
        weaknesses.push({
          topicId,
          topicName: topic.name,
          subjectId: subject.id,
          subjectName: subject.name,
          branch: topic.branch,
          score: Math.min(100, Math.round(score)),
          reasons,
          confidence: conf,
          pyqAccuracy: Math.round(pyqAccuracy),
          needsRevision: progress.status === 'needs_revision',
          daysSinceLastStudy: daysSince,
        });
      }
    }

    return weaknesses.sort((a, b) => b.score - a.score);
  },

  getWeeklySummary: () => {
    const state = get();
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let thisWeekMinutes = 0;
    let lastWeekMinutes = 0;
    let thisWeekPYQs = 0;
    let lastWeekPYQs = 0;
    let thisWeekPYQCorrect = 0;

    for (const session of state.studySessions) {
      const sessDate = new Date(session.date);
      if (sessDate >= sevenDaysAgo) {
        thisWeekMinutes += session.durationMinutes;
      } else if (sessDate >= fourteenDaysAgo) {
        lastWeekMinutes += session.durationMinutes;
      }
    }

    for (const pyq of state.pyqRecords) {
      const pyqDate = new Date(pyq.date);
      if (pyqDate >= sevenDaysAgo) {
        thisWeekPYQs++;
        if (pyq.isCorrect) thisWeekPYQCorrect++;
      } else if (pyqDate >= fourteenDaysAgo) {
        lastWeekPYQs++;
      }
    }

    const thisWeekAccuracy = thisWeekPYQs > 0 ? Math.round((thisWeekPYQCorrect / thisWeekPYQs) * 100) : 0;
    const thisWeekMocks = state.mockTests.filter((m) => new Date(m.date) >= sevenDaysAgo).length;

    let thisWeekCompleted = 0;
    for (const p of Object.values(state.topicProgress)) {
      if (p.status === 'completed' && p.lastStudiedDate) {
        if (new Date(p.lastStudiedDate) >= sevenDaysAgo) {
          thisWeekCompleted++;
        }
      }
    }

    return {
      thisWeekStudyHours: Number((thisWeekMinutes / 60).toFixed(1)),
      lastWeekStudyHours: Number((lastWeekMinutes / 60).toFixed(1)),
      thisWeekPYQs,
      lastWeekPYQs,
      thisWeekAccuracy,
      thisWeekTopicsCompleted: thisWeekCompleted,
      thisWeekMocks,
    };
  },

  getDynamicInsight: () => {
    const state = get();
    const stats = state.getOverallStats();
    const weaknesses = state.getWeaknesses();

    const todayStr = new Date().toISOString().split('T')[0];
    const overdueCount = state.revisionItems.filter((r) => !r.isCompleted && r.scheduledDate < todayStr).length;

    if (overdueCount > 0) {
      return `⚠️ ${overdueCount} revision ${overdueCount === 1 ? 'topic is' : 'topics are'} overdue. Prioritize clearing the revision queue today.`;
    }

    if (stats.currentStreak >= 5) {
      return `🔥 Outstanding momentum! You are on an active ${stats.currentStreak}-day study streak. Keep the focus sharp.`;
    }

    if (weaknesses.length > 0) {
      const topWeak = weaknesses[0];
      return `🎯 Recommended focus: "${topWeak.subjectName} — ${topWeak.topicName}" (Accuracy: ${topWeak.pyqAccuracy}%, Confidence: ${topWeak.confidence}/5).`;
    }

    if (stats.overallProgressPercent > 0) {
      return `🚀 Syllabus progress at ${stats.overallProgressPercent}%. Target 4+ hours of structured problem solving today.`;
    }

    return `✨ Welcome to GATE 2027 Command Center. Plan your study blocks and log your first session to initiate intelligence tracking.`;
  },
}));
