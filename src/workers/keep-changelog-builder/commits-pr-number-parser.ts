export interface CommitPRNumberParser {
  parse(commits: string[]): number[];
}

export class ConcreteCommitPRNumberParser implements CommitPRNumberParser {
  parse(commits: string[]): number[] {
    return commits
      .map((commit) => {
        const match = commit.match(/(?:#)(\d+)/);
        if (match !== null) {
          const asNumber: number = +match[1];
          return asNumber;
        }
        return null;
      })
      .filter((x): x is number => x !== null);
  }
}
