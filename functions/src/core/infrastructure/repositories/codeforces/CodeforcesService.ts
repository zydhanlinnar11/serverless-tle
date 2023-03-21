import {
  CodeforcesProblem,
  ICodeforcesService
} from '../../../domain/services/ICodeforcesService'

export class CodeforcesService implements ICodeforcesService {
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
