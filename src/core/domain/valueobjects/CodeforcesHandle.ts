export class CodeforcesHandle {
  constructor(private readonly handle: string) {}

  public toString = () => this.handle
  public equals = (handle: CodeforcesHandle) => this.handle === handle.toString()
}
