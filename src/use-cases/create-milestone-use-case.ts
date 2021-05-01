import { Observable, forkJoin } from 'rxjs';
import { PullRequestNumberExtractor } from '../workers/pr-number-extractor';
import { flatMap, mapTo } from 'rxjs/operators';
import { MilestoneCreator } from '../workers/milestone-creator';
import { GithubService } from '../services/github-service';

export class CreateMilestoneUseCaseInput {
  readonly pullNumber: number;
  readonly repository: string;
  readonly title: string;

  constructor(pullNumber: number, repository: string, title: string) {
    this.pullNumber = pullNumber;
    this.repository = repository;
    this.title = title;
  }
}

export class CreateMilestoneUseCaseOutput {}

export interface CreateMilestoneUseCase {
  execute(
    input: CreateMilestoneUseCaseInput
  ): Observable<CreateMilestoneUseCaseOutput>;
}

export class GithubCreateMilestoneUseCase implements CreateMilestoneUseCase {
  private readonly pullRequestNumberExtractor: PullRequestNumberExtractor;
  private readonly milestoneCreator: MilestoneCreator;
  private readonly githubService: GithubService;
  private readonly owner: string;

  constructor(
    owner: string,
    pullRequestNumberExtractor: PullRequestNumberExtractor,
    milestoneCreator: MilestoneCreator,
    githubService: GithubService
  ) {
    this.pullRequestNumberExtractor = pullRequestNumberExtractor;
    this.milestoneCreator = milestoneCreator;
    this.githubService = githubService;
    this.owner = owner;
  }

  execute(
    input: CreateMilestoneUseCaseInput
  ): Observable<CreateMilestoneUseCaseOutput> {
    return this.pullRequestNumberExtractor
      .extract(input.pullNumber, input.repository)
      .pipe(
        flatMap((numbers) => {
          return this.milestoneCreator
            .create(input.title, input.repository)
            .pipe(
              flatMap((milestoneId) => {
                const setMilestoneToPrs = numbers.map((prNumber) => {
                  return this.githubService.setMilestoneToPR(
                    this.owner,
                    input.repository,
                    milestoneId,
                    prNumber
                  );
                });

                return forkJoin(setMilestoneToPrs);
              })
            );
        })
      )
      .pipe(mapTo(new CreateMilestoneUseCaseOutput()));
  }
}
