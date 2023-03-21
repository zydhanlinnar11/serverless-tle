import { CodeforcesHandle } from '../valueobjects/CodeforcesHandle'

export type CodeforcesProblem = {
  contestId: number
  index: string
  name: string
  type: 'PROGRAMMING' | 'QUESTION'
  rating?: number
}

export type CodeforcesSubmissionVerdict =
  | 'FAILED'
  | 'OK'
  | 'PARTIAL'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'WRONG_ANSWER'
  | 'PRESENTATION_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'IDLENESS_LIMIT_EXCEEDED'
  | 'SECURITY_VIOLATED'
  | 'CRASHED'
  | 'INPUT_PREPARATION_CRASHED'
  | 'CHALLENGED'
  | 'SKIPPED'
  | 'TESTING'
  | 'REJECTED'

export type CodeforcesSubmission = {
  id: number
  contestId?: number
  creationTimeSeconds: number
  problem: CodeforcesProblem
  verdict?: CodeforcesSubmissionVerdict
}

export interface ICodeforcesService {
  getRandomCodeforcesProblem: () => Promise<CodeforcesProblem>
  getUserSubmissions: (
    handle: CodeforcesHandle
  ) => Promise<CodeforcesSubmission[]>
  getProblemUrl: (
    problem: Pick<CodeforcesProblem, 'contestId' | 'index'>
  ) => string
}
