import JiraAPI from 'jira-client';
import { log, logError } from './logger';

const REQUIRED_SCOPES = [
  { scope: 'read:project-version:jira', method: 'getVersions', endpoint: 'GET /rest/api/3/project/{key}/versions' },
  { scope: 'read:issue:jira', method: 'findIssue', endpoint: 'GET /rest/api/3/issue/{id}' },
  { scope: 'write:issue:jira', method: 'updateIssue', endpoint: 'PUT /rest/api/3/issue/{id}' },
  { scope: 'write:project-version:jira', method: 'createVersion/updateVersion', endpoint: 'POST /rest/api/3/version' },
];

function isScopeError(err: unknown): boolean {
  const message = (err as { message?: string })?.message ?? '';
  return message.includes('401') && message.toLowerCase().includes('scope');
}

async function checkReadScopes(jiraAPI: JiraAPI, projectKey: string): Promise<string[]> {
  const missing: string[] = [];

  try {
    await jiraAPI.getVersions(projectKey);
    log(`[ScopeCheck] read:project-version:jira — OK`);
  } catch (err) {
    if (isScopeError(err)) {
      missing.push('read:project-version:jira');
      logError(`[ScopeCheck] read:project-version:jira — NOT OK`);
    } else {
      log(`[ScopeCheck] read:project-version:jira — OK`);
    }
  }

  try {
    await jiraAPI.findIssue('');
    log(`[ScopeCheck] read:issue:jira — OK`);
  } catch (err) {
    if (isScopeError(err)) {
      missing.push('read:issue:jira');
      logError(`[ScopeCheck] read:issue:jira — NOT OK`);
    } else {
      log(`[ScopeCheck] read:issue:jira — OK`);
    }
  }

  return missing;
}

export async function checkJiraScopes(jiraAPI: JiraAPI, projectKey: string): Promise<void> {
  const missingReadScopes = await checkReadScopes(jiraAPI, projectKey);

  log(`[ScopeCheck] write:issue:jira — unverified (requires side effects)`);
  log(`[ScopeCheck] write:project-version:jira — unverified (requires side effects)`);

  if (missingReadScopes.length > 0) {
    const table = REQUIRED_SCOPES
      .filter((s) => missingReadScopes.includes(s.scope))
      .map((s) => `  - ${s.scope}  (${s.method}  ${s.endpoint})`)
      .join('\n');
    logError(`[ScopeCheck] Missing scopes:\n${table}`);
  }
}
