import JiraAPI from 'jira-client';
import { log, logError } from './logger';

const REQUIRED_SCOPES = [
  { scope: 'read:project:jira', method: 'getProject', endpoint: 'GET /rest/api/3/project/{key}' },
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
    await jiraAPI.getProject(projectKey);
    log(`[ScopeCheck] read:project:jira — OK`);
  } catch (err) {
    if (isScopeError(err)) {
      missing.push('read:project:jira');
      logError(`[ScopeCheck] read:project:jira — MISSING SCOPE`, err);
    } else {
      log(`[ScopeCheck] read:project:jira — could not verify (non-scope error): ${(err as { message?: string })?.message}`);
    }
  }

  try {
    await jiraAPI.getVersions(projectKey);
    log(`[ScopeCheck] read:project-version:jira — OK`);
  } catch (err) {
    if (isScopeError(err)) {
      missing.push('read:project-version:jira');
      logError(`[ScopeCheck] read:project-version:jira — MISSING SCOPE`, err);
    } else {
      log(`[ScopeCheck] read:project-version:jira — could not verify (non-scope error): ${(err as { message?: string })?.message}`);
    }
  }

  return missing;
}

export async function checkJiraScopes(jiraAPI: JiraAPI, projectKey: string): Promise<void> {
  log(`[ScopeCheck] Verifying Jira scopes against project "${projectKey}"...`);

  const missingReadScopes = await checkReadScopes(jiraAPI, projectKey);

  const writeScopes = [
    'read:issue:jira',
    'write:issue:jira',
    'write:project-version:jira',
  ];

  if (missingReadScopes.length === 0) {
    log(`[ScopeCheck] All verifiable read scopes are present.`);
  }

  log(`[ScopeCheck] Write scopes (${writeScopes.join(', ')}) require side effects to verify — ensure they are configured in your Atlassian token.`);

  if (missingReadScopes.length > 0) {
    const table = REQUIRED_SCOPES
      .filter((s) => missingReadScopes.includes(s.scope))
      .map((s) => `  - ${s.scope}  (${s.method}  ${s.endpoint})`)
      .join('\n');
    logError(`[ScopeCheck] Missing Jira scopes detected at startup:\n${table}`);
    logError(`[ScopeCheck] Baroneza will start but affected endpoints will fail. Add the missing scopes to your Atlassian token.`);
  }
}
