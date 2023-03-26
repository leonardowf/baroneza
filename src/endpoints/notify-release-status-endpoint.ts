import { Observable } from 'rxjs';
import { ShaWindow } from '../shared/sha-window';
import { NotifyReleaseStatusUseCase } from '../use-cases/notify-release-status-use-case';

export type NotifyReleaseStatusEndpointInput = {
  readonly reference: number | ShaWindow;
  readonly channel: string;
  readonly statuses: string[];
  readonly repository: string;
  readonly projectKeys: string[];
};

export type NotifyReleaseStatusEndpointOutput = {};

export type NotifyReleaseStatusEndpointDependencies = {
  readonly notifyReleaseStatusUseCase: NotifyReleaseStatusUseCase;
};

export class NotifyReleaseStatusEndpoint {
  private notifyReleaseStatusUseCase: NotifyReleaseStatusUseCase;

  constructor(dependencies: NotifyReleaseStatusEndpointDependencies) {
    this.notifyReleaseStatusUseCase = dependencies.notifyReleaseStatusUseCase;
  }

  execute(
    input: NotifyReleaseStatusEndpointInput
  ): Observable<NotifyReleaseStatusEndpointOutput> {
    return this.notifyReleaseStatusUseCase.execute({
      reference: input.reference,
      statuses: input.statuses,
      channel: input.channel,
      repository: input.repository,
      projectKeys: input.projectKeys
    });
  }
}
