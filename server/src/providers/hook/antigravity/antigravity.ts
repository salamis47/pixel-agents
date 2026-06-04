import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import type { HookProvider } from '../../../../../core/src/provider.js';

export function formatAntigravityToolStatus(toolName: string, input?: unknown): string {
  const inp = (input ?? {}) as Record<string, unknown>;
  const base = (p: unknown) => (typeof p === 'string' ? path.basename(p) : '');

  switch (toolName) {
    case 'view_file':
      return `Reading ${base(inp.AbsolutePath)}`;
    case 'replace_file_content':
    case 'multi_replace_file_content':
      return `Editing ${base(inp.TargetFile)}`;
    case 'write_to_file':
      return `Writing ${base(inp.TargetFile)}`;
    case 'run_command': {
      const cmd = (inp.CommandLine as string) || '';
      return `Running: ${cmd}`;
    }
    case 'grep_search':
      return `Searching code: ${inp.Query || ''}`;
    case 'search_web':
      return `Searching the web: ${inp.query || ''}`;
    case 'read_url_content':
      return 'Fetching web content';
    case 'browser_subagent':
      return `Browsing: ${inp.TaskName || ''}`;
    case 'ask_question':
      return 'Waiting for your answer';
    case 'ask_permission':
      return 'Waiting for permission';
    case 'call_mcp_tool':
      return `Using MCP tool: ${inp.ToolName || ''}`;
    default:
      return `Using ${toolName}`;
  }
}

export const antigravityProvider: HookProvider = {
  kind: 'hook',
  id: 'antigravity',
  displayName: 'Antigravity',
  protocolVersion: 1,

  normalizeHookEvent() {
    return null;
  },

  installHooks: () => Promise.resolve(),
  uninstallHooks: () => Promise.resolve(),
  areHooksInstalled: () => Promise.resolve(false),

  formatToolStatus: formatAntigravityToolStatus,
  permissionExemptTools: new Set(['schedule', 'manage_task', 'ask_question', 'ask_permission']),
  subagentToolNames: new Set(['browser_subagent']),
  readingTools: new Set([
    'view_file',
    'grep_search',
    'search_web',
    'read_url_content',
    'list_permissions',
    'list_resources',
    'read_resource',
  ]),
  terminalNamePrefix: 'Antigravity',

  getSessionDirs() {
    const brainDir = path.join(os.homedir(), '.gemini', 'antigravity-ide', 'brain');
    if (!fs.existsSync(brainDir)) return [];
    try {
      const convs = fs.readdirSync(brainDir);
      const dirs: string[] = [];
      for (const conv of convs) {
        if (conv === 'tempmediaStorage') continue;
        const logDir = path.join(brainDir, conv, '.system_generated', 'logs');
        if (fs.existsSync(logDir)) {
          dirs.push(logDir);
        }
      }
      return dirs;
    } catch {
      return [];
    }
  },

  getAllSessionRoots() {
    return [path.join(os.homedir(), '.gemini', 'antigravity-ide', 'brain')];
  },

  sessionFilePattern: 'transcript.jsonl',
};
