import { ReleaseType } from '../workers/next-release-guesser';

export type DeploymentContext = {
  readonly channel: string;
  readonly baseBranch: string;
  readonly targetBranch: string;
  readonly repository: string;
  readonly branchPrefix: string;
  readonly projectKeys: string[];

  readonly pullRequestTitlePrefix: string;
  readonly releaseType: ReleaseType;
  readonly qaPlanFieldId: string;
};

export class DeploymentContextStore {
  private context: DeploymentContext | undefined;

  save(context: DeploymentContext): void {
    this.context = context;
  }

  get(): DeploymentContext | undefined {
    return this.context;
  }
}
