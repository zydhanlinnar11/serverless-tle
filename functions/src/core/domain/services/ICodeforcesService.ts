export type CodeforcesProblem = {
  contestId: number
  index: string
  name: string
  type: 'PROGRAMMING' | 'QUESTION'
  rating?: number
}

export interface ICodeforcesService {
  getRandomCodeforcesProblem: () => Promise<CodeforcesProblem>
}
