export interface JiraTicketParser {
  parse(values: string[]): JiraTicketParserOutput;
}

export type ParsedTicket = {
  readonly value: string;
  readonly ticket: string;
}

export type JiraTicketParserOutput = {
  readonly parsedTickets: ParsedTicket[]
}
export class ConcreteJiraTickerParser implements JiraTicketParser {
  parse(values: string[]): JiraTicketParserOutput {
    const regex = /((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g;

    const parsedTickets = values.map((value) => {
      const match = value.match(regex) ?? []
      return match.map((match): ParsedTicket => ({ value, ticket: match}))
    })

    const flattened = parsedTickets.reduce((acc, array) => acc.concat(array), [])
    const deduped: ParsedTicket[] = flattened.reduce((acc, item) => {

      const hasItem = acc.filter((accItem) => accItem.ticket === item.ticket && accItem.value === item.value).length > 0
      return hasItem ? acc : [...acc, item]
    }, [] as ParsedTicket[])

    return { parsedTickets: deduped }
  }
}
