import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeConfig, DEFAULT_CONFIG } from '../dist/config.js';
import { setLanguage, t } from '../dist/i18n/index.js';
import { formatCacheHitPercent, renderCacheHitLine } from '../dist/render/lines/session-tokens.js';
import { render } from '../dist/render/index.js';
import { renderSessionLine } from '../dist/render/session-line.js';

function stripAnsi(str) {
  return str
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '');
}

function captureRenderLines(ctx) {
  const logs = [];
  const originalLog = console.log;
  console.log = (line) => logs.push(stripAnsi(String(line)));
  try {
    render(ctx);
  } finally {
    console.log = originalLog;
  }
  return logs;
}

function baseContext() {
  return {
    stdin: { model: { display_name: 'Opus' } },
    transcript: {
      tools: [],
      skills: [],
      mcpServers: [],
      agents: [],
      todos: [],
      sessionTokens: {
        inputTokens: 10,
        outputTokens: 999,
        cacheCreationTokens: 10,
        cacheReadTokens: 80,
      },
    },
    claudeMdCount: 0,
    rulesCount: 0,
    mcpCount: 0,
    hooksCount: 0,
    sessionDuration: '',
    gitStatus: null,
    usageData: null,
    memoryUsage: null,
    config: mergeConfig({ display: { showCacheHitRate: true } }),
    extraLabel: null,
  };
}

test('formatCacheHitPercent is cache_read / (input + cache_creation + cache_read)', () => {
  assert.equal(formatCacheHitPercent({
    inputTokens: 10,
    outputTokens: 999,
    cacheCreationTokens: 10,
    cacheReadTokens: 80,
  }), '80.0');
});

test('formatCacheHitPercent ignores output tokens in the denominator', () => {
  assert.equal(formatCacheHitPercent({
    inputTokens: 0,
    outputTokens: 100000,
    cacheCreationTokens: 0,
    cacheReadTokens: 50,
  }), '100.0');
});

test('formatCacheHitPercent returns 0.0 when there is input but no cache read', () => {
  assert.equal(formatCacheHitPercent({
    inputTokens: 100,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
  }), '0.0');
});

test('formatCacheHitPercent returns null when cacheable input is zero', () => {
  assert.equal(formatCacheHitPercent({
    inputTokens: 0,
    outputTokens: 10,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
  }), null);
});

test('formatCacheHitPercent keeps one decimal place', () => {
  assert.equal(formatCacheHitPercent({
    inputTokens: 2,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 1,
  }), '33.3');
});

test('mergeConfig defaults showCacheHitRate to true', () => {
  assert.equal(DEFAULT_CONFIG.display.showCacheHitRate, true);
  assert.equal(mergeConfig({}).display.showCacheHitRate, true);
});

test('mergeConfig preserves explicit showCacheHitRate=false', () => {
  assert.equal(mergeConfig({ display: { showCacheHitRate: false } }).display.showCacheHitRate, false);
});

test('renderCacheHitLine returns null when showCacheHitRate is false', () => {
  const ctx = baseContext();
  ctx.config.display.showCacheHitRate = false;
  assert.equal(renderCacheHitLine(ctx), null);
});

test('renderCacheHitLine returns null when sessionTokens is missing', () => {
  const ctx = baseContext();
  ctx.transcript.sessionTokens = undefined;
  assert.equal(renderCacheHitLine(ctx), null);
});

test('renderCacheHitLine returns null when cacheable input is zero', () => {
  const ctx = baseContext();
  ctx.transcript.sessionTokens = {
    inputTokens: 0,
    outputTokens: 20,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
  };
  assert.equal(renderCacheHitLine(ctx), null);
});

test('renderCacheHitLine renders the session cache hit percent', () => {
  setLanguage('en');
  const line = stripAnsi(renderCacheHitLine(baseContext()) ?? '');
  assert.ok(line.includes('Cache hit'));
  assert.ok(line.includes('80.0%'));
});

test('renderCacheHitLine uses Chinese label when language is zh', () => {
  setLanguage('zh');
  try {
    assert.equal(t('label.cacheHit'), '缓存命中');
    const line = stripAnsi(renderCacheHitLine(baseContext()) ?? '');
    assert.ok(line.includes('缓存命中'));
    assert.ok(line.includes('80.0%'));
  } finally {
    setLanguage('en');
  }
});

test('expanded render includes cache hit with default mergeConfig', () => {
  setLanguage('en');
  const ctx = baseContext();
  ctx.config = mergeConfig({
    lineLayout: 'expanded',
    display: { showUsage: false },
  });
  const output = captureRenderLines(ctx).join('\n');
  assert.ok(output.includes('Cache hit 80.0%'), `missing cache hit in expanded output: ${output}`);
});

test('compact session line includes cache hit when enabled', () => {
  setLanguage('en');
  const ctx = baseContext();
  ctx.config = mergeConfig({
    lineLayout: 'compact',
    display: { showCacheHitRate: true, showUsage: false },
  });
  const line = stripAnsi(renderSessionLine(ctx));
  assert.ok(line.includes('Cache hit 80.0%'), `missing cache hit in compact line: ${line}`);
});

test('expanded and compact hide cache hit when showCacheHitRate is false', () => {
  setLanguage('en');
  const ctx = baseContext();
  ctx.config = mergeConfig({
    lineLayout: 'expanded',
    display: { showCacheHitRate: false, showUsage: false },
  });
  const expanded = captureRenderLines(ctx).join('\n');
  assert.ok(!expanded.includes('Cache hit'), `unexpected cache hit in expanded output: ${expanded}`);

  ctx.config = mergeConfig({
    lineLayout: 'compact',
    display: { showCacheHitRate: false, showUsage: false },
  });
  const compact = stripAnsi(renderSessionLine(ctx));
  assert.ok(!compact.includes('Cache hit'), `unexpected cache hit in compact line: ${compact}`);
});
