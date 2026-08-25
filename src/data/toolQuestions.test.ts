import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { QUESTION_GROUPS, TOOL_QUESTIONS } from './toolQuestions';

describe('tool question bank', () => {
  it('puts every question in a declared group and leaves no group empty', () => {
    const groupIds = new Set(QUESTION_GROUPS.map((g) => g.id));
    expect(groupIds.size).toBe(QUESTION_GROUPS.length);
    for (const q of TOOL_QUESTIONS) {
      expect(groupIds.has(q.group), q.id).toBe(true);
    }
    for (const g of QUESTION_GROUPS) {
      expect(
        TOOL_QUESTIONS.filter((q) => q.group === g.id).length,
        `group "${g.id}" has no questions`
      ).toBeGreaterThan(0);
    }
  });

  it('covers both tools substantially, not one with the other as a footnote', () => {
    expect(TOOL_QUESTIONS.length).toBeGreaterThanOrEqual(25);
    expect(new Set(TOOL_QUESTIONS.map((q) => q.id)).size).toBe(TOOL_QUESTIONS.length);
    for (const tool of ['selenium', 'playwright', 'both'] as const) {
      expect(
        TOOL_QUESTIONS.filter((q) => q.tool === tool).length,
        `too few "${tool}" questions`
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('answers each question properly and says where it goes next', () => {
    for (const q of TOOL_QUESTIONS) {
      expect(q.question.trim().endsWith('?'), q.id).toBe(true);
      expect(q.answer.length, q.id).toBeGreaterThan(250);
      expect(q.followUp.length, q.id).toBeGreaterThan(60);
      if (q.wrong !== undefined) expect(q.wrong.length, q.id).toBeGreaterThan(60);
    }
  });

  /**
   * A single-tool question that carries code has to carry its own tool's code. It may also carry
   * the other's — several answers here are made by the contrast, and the stale-element question is
   * mostly about why Playwright cannot throw it — but showing only the other tool's code under a
   * heading promising one would be a straight mismatch.
   */
  it('always includes the code for the tool a question is about', () => {
    for (const q of TOOL_QUESTIONS) {
      if (!q.code) continue;
      expect(Object.keys(q.code).length, `${q.id} has an empty code block`).toBeGreaterThan(0);
      if (q.tool === 'selenium') expect(q.code.selenium, q.id).toBeDefined();
      if (q.tool === 'playwright') expect(q.code.playwright, q.id).toBeDefined();
      if (q.tool === 'both') {
        expect(q.code.selenium ?? q.code.playwright, q.id).toBeDefined();
      }
    }
  });

  /**
   * Every TypeScript snippet is parsed with the real compiler's syntactic pass.
   *
   * Neither Playwright nor Selenium is a dependency here, so this cannot check that the API calls
   * exist — but it does catch the failure that would actually embarrass somebody, which is a
   * snippet with an unbalanced brace or a stray backtick being copied into an interview. The Java
   * snippets get the same treatment through javac's parser, which is not run here because it would
   * make the suite need a JDK; see the note in toolQuestions.ts.
   */
  it('ships TypeScript snippets that actually parse', () => {
    const checked: string[] = [];
    for (const q of TOOL_QUESTIONS) {
      const code = q.code?.playwright;
      if (!code) continue;
      checked.push(q.id);
      const source = ts.createSourceFile(
        `${q.id}.ts`,
        `async function run() {\n${code}\n}`,
        ts.ScriptTarget.ES2022,
        true,
        ts.ScriptKind.TS
      );
      const diagnostics = (source as unknown as { parseDiagnostics?: ts.Diagnostic[] })
        .parseDiagnostics;
      const messages = (diagnostics ?? []).map((d) =>
        ts.flattenDiagnosticMessageText(d.messageText, ' ')
      );
      expect(messages, `${q.id} does not parse`).toEqual([]);
    }
    expect(checked.length).toBeGreaterThanOrEqual(12);
  });

  it('keeps snippets short enough to read in an answer', () => {
    for (const q of TOOL_QUESTIONS) {
      for (const [tool, code] of Object.entries(q.code ?? {})) {
        const lines = code.split('\n');
        expect(lines.length, `${q.id}.${tool} is too long to be an answer`).toBeLessThanOrEqual(20);
        for (const line of lines) {
          expect(line.length, `${q.id}.${tool}: "${line}"`).toBeLessThanOrEqual(84);
        }
      }
    }
  });
});
