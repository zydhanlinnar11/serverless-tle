import {
  CodeforcesProblem,
  CodeforcesSubmission,
  ICodeforcesService
} from '../../../domain/services/ICodeforcesService'
import { CodeforcesHandle } from '../../../domain/valueobjects/CodeforcesHandle'

export class CodeforcesService implements ICodeforcesService {
  getUserSubmissions: (
    handle: CodeforcesHandle
  ) => Promise<CodeforcesSubmission[]> = async (handle) => {
    const url = `https://codeforces.com/api/user.status?handle=${handle.toString()}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(await response.text())
    const data = await response.json()

    return data.result
  }

  getProblemUrl: (
    problem: Pick<CodeforcesProblem, 'contestId' | 'index'>
  ) => string = (problem) =>
    `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`

  getRandomCodeforcesProblem = async () => {
    const res = await fetch('https://codeforces.com/api/problemset.problems')
    const json = await res.json()
    const problems: CodeforcesProblem[] = (
      json.result.problems as any[]
    ).filter(
      ({ rating, type, contestId }) =>
        type === 'PROGRAMMING' && rating === 800 && contestId !== undefined
    )
    const problem = problems[Math.floor(Math.random() * (problems.length - 1))]

    return problem
  }
}
