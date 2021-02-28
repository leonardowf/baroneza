export interface JiraTicketParser {
  parse(values: string[]): string[];
}

export class ConcreteJiraTickerParser implements JiraTicketParser {
  parse(values: string[]): string[] {
    const regex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;

    const extractedTicketIds = values
      .map((x) => x.match(regex))
      .map((x) => (x == null ? [] : x))
      .filter((x) => x.length > 0)
      .map((x) => x.map((y) => y.replace('[', '').replace(']', '')))
      .reduce((acc, x) => acc.concat(x), []);

    return Array.from(new Set(extractedTicketIds));
  }
}
