export type ExamBranch = 'CS' | 'DA';
export type ExamTargetBranch = 'CS' | 'DA' | 'BOTH';

export type TopicStatus = 'not_started' | 'learning' | 'completed' | 'needs_revision';
export type TopicDifficulty = 'easy' | 'medium' | 'hard';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Topic {
  id: string;
  name: string;
  subCategory?: string;
  subjectId: string;
  branch: ExamBranch;
  defaultDifficulty?: TopicDifficulty;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  branch: ExamBranch;
  iconName: string;
  color: string;
  description: string;
  category: string;
  weightageEstimate: number; // approximate GATE weightage %
  topics: Topic[];
}

export interface TopicProgress {
  topicId: string;
  status: TopicStatus;
  studyHours: number;
  confidence: number; // 1 to 5
  pyqsAttempted: number;
  pyqsCorrect: number;
  notes?: string;
  revisionCount: number;
  lastStudiedDate?: string; // ISO date string
  nextRevisionDate?: string; // ISO date string
  difficulty?: TopicDifficulty;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId: string;
  branch: ExamBranch;
  date: string; // ISO date string YYYY-MM-DDTHH:mm:ss
  durationMinutes: number;
  questionsSolved: number;
  pyqsSolved: number;
  confidenceBefore: number;
  confidenceAfter: number;
  notes: string;
}

export interface PYQRecord {
  id: string;
  year: number;
  branch: ExamBranch;
  subjectId: string;
  topicId: string;
  difficulty: TopicDifficulty;
  isCorrect: boolean;
  timeTakenSeconds: number;
  date: string;
  notes?: string;
  mistakeReason?: string;
  tags?: string[];
}

export interface MockTest {
  id: string;
  name: string;
  date: string;
  branch: 'CS' | 'DA' | 'COMBINED';
  totalMarks: number;
  marksObtained: number;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeTakenMinutes: number;
  notes?: string;
  subjectScores?: Record<string, { marks: number; total: number }>;
}

export interface RevisionItem {
  id: string;
  topicId: string;
  subjectId: string;
  branch: ExamBranch;
  stage: 1 | 2 | 3 | 4 | 5;
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string;
  isCompleted: boolean;
  notes?: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  subjectId?: string;
  topicId?: string;
  branch?: ExamBranch;
  durationMinutes: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
  priority: PriorityLevel;
}

export interface NoteItem {
  id: string;
  title: string;
  subjectId: string;
  topicId?: string;
  branch: ExamBranch;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalItem {
  id: string;
  title: string;
  targetMetric: 'study_hours' | 'pyqs' | 'mock_tests' | 'topics_completed' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  branch: 'CS' | 'DA' | 'GENERAL';
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: 'streak' | 'hours' | 'pyq' | 'mocks' | 'syllabus' | 'mastery';
}

export interface UserSettings {
  targetExamDate: string; // e.g. '2027-02-06'
  examMonthDisplay: string; // 'FEBRUARY 2027'
  dailyStudyTargetHours: number;
  weeklyStudyTargetHours: number;
  branchPriority: 'CS_FIRST' | 'DA_FIRST' | 'BALANCED';
  theme: 'dark' | 'light' | 'system';
  accentColor: 'cyan' | 'emerald' | 'amber' | 'violet' | 'blue';
  hasCompletedOnboarding: boolean;
  hasSampleData: boolean;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
}

export interface WeaknessItem {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  branch: ExamBranch;
  score: number; // 0-100 (higher = weaker / higher priority)
  reasons: string[];
  confidence: number;
  pyqAccuracy: number;
  needsRevision: boolean;
  daysSinceLastStudy: number;
}
