import type { HookProvider } from '../../../core/src/provider.js';
import { antigravityProvider } from './hook/antigravity/antigravity.js';
import { claudeProvider } from './hook/claude/claude.js';

const ANTIGRAVITY_TOOLS = new Set([
  'view_file',
  'replace_file_content',
  'multi_replace_file_content',
  'write_to_file',
  'grep_search',
  'run_command',
  'manage_task',
  'schedule',
  'search_web',
  'read_url_content',
  'generate_image',
  'browser_subagent',
  'ask_question',
  'ask_permission',
  'call_mcp_tool',
  'list_permissions',
  'list_resources',
  'read_resource',
]);

export const compositeProvider: HookProvider = {
  kind: 'hook',
  id: 'composite',
  displayName: 'Composite Provider',
  protocolVersion: 1,

  normalizeHookEvent(raw) {
    // Webhook events are currently only sent by Claude Code hooks
    return claudeProvider.normalizeHookEvent(raw);
  },

  installHooks(serverUrl, authToken) {
    return claudeProvider.installHooks(serverUrl, authToken);
  },

  uninstallHooks() {
    return claudeProvider.uninstallHooks();
  },

  areHooksInstalled() {
    return claudeProvider.areHooksInstalled();
  },

  formatToolStatus(toolName, input) {
    if (ANTIGRAVITY_TOOLS.has(toolName)) {
      return antigravityProvider.formatToolStatus(toolName, input);
    }
    return claudeProvider.formatToolStatus(toolName, input);
  },

  permissionExemptTools: new Set([
    ...claudeProvider.permissionExemptTools,
    ...antigravityProvider.permissionExemptTools,
  ]),

  subagentToolNames: new Set([
    ...claudeProvider.subagentToolNames,
    ...antigravityProvider.subagentToolNames,
  ]),

  readingTools: new Set([
    ...claudeProvider.readingTools,
    ...antigravityProvider.readingTools,
  ]),

  terminalNamePrefix: claudeProvider.terminalNamePrefix,

  getSessionDirs(workspacePath) {
    const claudeDirs = claudeProvider.getSessionDirs?.(workspacePath) ?? [];
    const antigravityDirs = antigravityProvider.getSessionDirs?.(workspacePath) ?? [];
    return [...claudeDirs, ...antigravityDirs];
  },

  getAllSessionRoots() {
    const claudeRoots = claudeProvider.getAllSessionRoots?.() ?? [];
    const antigravityRoots = antigravityProvider.getAllSessionRoots?.() ?? [];
    return [...claudeRoots, ...antigravityRoots];
  },

  sessionFilePattern: '*.jsonl', // Will match *.jsonl (Claude) and transcript.jsonl (Antigravity)

  buildLaunchCommand(sessionId, cwd, opts) {
    return claudeProvider.buildLaunchCommand?.(sessionId, cwd, opts) ?? { command: '', args: [] };
  },
};
export { copyHookScript } from './hook/claude/claudeHookInstaller.js';
