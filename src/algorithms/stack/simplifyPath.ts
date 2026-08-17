import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const label = (part: string) => (part === '' ? '∅' : part);

function runSimplifyPath(input: unknown): AlgorithmStep[] {
  const path = input as string;
  const steps: AlgorithmStep[] = [];
  const parts = path.split('/');
  const chars = parts.map(label);
  const stack: string[] = [];

  steps.push({
    state: { chars: [...chars], stack: [] },
    highlights: [],
    message: `Split "${path}" on '/' into ${parts.length} pieces: [${chars.join(', ')}] (∅ = empty piece from a leading or doubled slash). The stack will hold the directories that survive.`,
    codeLine: 3,
  });

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    steps.push({
      state: { chars: [...chars], stack: [...stack] },
      highlights: [i],
      pointers: { i },
      message: `Piece ${i}: "${label(part)}"`,
      codeLine: 3,
      action: 'visit',
    });

    if (part === '' || part === '.') {
      steps.push({
        state: { chars: [...chars], stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message:
          part === ''
            ? 'Empty piece — it came from a leading, trailing, or doubled slash and means nothing. Skip it.'
            : '"." means "this directory" — it never moves you anywhere. Skip it.',
        codeLine: 5,
      });
    } else if (part === '..') {
      if (stack.length > 0) {
        const popped = stack.pop();
        steps.push({
          state: { chars: [...chars], stack: [...stack] },
          highlights: [i],
          pointers: { i },
          message: `".." means go up one level — pop "${popped}" off the stack. Path so far: /${stack.join('/')}`,
          codeLine: 8,
          action: 'pop',
        });
      } else {
        steps.push({
          state: { chars: [...chars], stack: [...stack] },
          highlights: [i],
          pointers: { i },
          message: '".." at the root — there is nothing above /, so the stack stays empty and the piece is dropped.',
          codeLine: 7,
        });
      }
    } else {
      stack.push(part);
      steps.push({
        state: { chars: [...chars], stack: [...stack] },
        highlights: [i],
        pointers: { i },
        message: `"${part}" is a real directory name — push it. Path so far: /${stack.join('/')}`,
        codeLine: 10,
        action: 'push',
      });
    }
  }

  const result = '/' + stack.join('/');
  steps.push({
    state: { chars: [...chars], stack: [...stack], result },
    highlights: [],
    message: `Join the surviving directories with '/' under a single leading slash: "${result}"`,
    codeLine: 11,
    action: 'found',
  });

  return steps;
}

function runSimplifyPathInPlace(input: unknown): AlgorithmStep[] {
  const path = input as string;
  const steps: AlgorithmStep[] = [];
  const parts = path.split('/');
  let k = 0;
  const view = () => parts.map(label);
  const kept = () => parts.slice(0, k);

  steps.push({
    state: { chars: view(), stack: [] },
    highlights: [],
    message: `Same split into [${view().join(', ')}], but no separate stack: overwrite the array in place with a write index k. Everything left of k is the answer so far.`,
    codeLine: 3,
  });

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    steps.push({
      state: { chars: view(), stack: kept() },
      highlights: [i],
      pointers: { i, k },
      message: `Read piece ${i}: "${label(part)}" (write index k = ${k})`,
      codeLine: 4,
      action: 'visit',
    });

    if (part === '' || part === '.') {
      steps.push({
        state: { chars: view(), stack: kept() },
        highlights: [i],
        pointers: { i, k },
        message: `"${label(part)}" carries no information — leave k at ${k} and read on.`,
        codeLine: 5,
      });
    } else if (part === '..') {
      const before = k;
      k = Math.max(0, k - 1);
      steps.push({
        state: { chars: view(), stack: kept() },
        highlights: [i],
        pointers: { i, k },
        message:
          before === k
            ? `".." at the root: k is already 0, clamp keeps it at 0 — nothing above / to pop.`
            : `".." — just move k back from ${before} to ${k}. No pop needed: "${parts[k]}" is now past the write index, so it is logically deleted.`,
        codeLine: 8,
        action: 'pop',
      });
    } else {
      parts[k] = part;
      k += 1;
      steps.push({
        state: { chars: view(), stack: kept() },
        highlights: [i],
        pointers: { i, k },
        message: `Write "${part}" into slot ${k - 1} and advance k to ${k}. Since k <= i always, we only ever overwrite pieces we have already read. Path so far: /${kept().join('/')}`,
        codeLine: 10,
        action: 'push',
      });
    }
  }

  const result = '/' + kept().join('/');
  steps.push({
    state: { chars: view(), stack: kept(), result },
    highlights: [],
    message: `The first ${k} slots hold the canonical path: "${result}" — same answer, with the stack living inside the input array.`,
    codeLine: 12,
    action: 'found',
  });

  return steps;
}

export const simplifyPath: Algorithm = {
  id: 'simplify-path',
  name: 'Simplify Path',
  category: 'Stack',
  difficulty: 'Medium',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(n)',
  pattern: 'Stack — push directories, pop on "..", skip "." and empty',
  description:
    'Given an absolute Unix-style file path, convert it to its simplified canonical path. The canonical path starts with a single slash, has no trailing slash, no "." components, and every ".." moves up one directory (or is ignored at the root).',
  problemUrl: 'https://leetcode.com/problems/simplify-path/',
  code: {
    python: `def simplifyPath(path):
    stack = []
    for part in path.split('/'):
        if part == '' or part == '.':
            continue
        if part == '..':
            if stack:
                stack.pop()
        else:
            stack.append(part)
    return '/' + '/'.join(stack)`,
    javascript: `function simplifyPath(path) {
    const stack = [];
    for (const part of path.split('/')) {
        if (part === '' || part === '.') continue;
        if (part === '..') {
            if (stack.length) stack.pop();
        } else {
            stack.push(part);
        }
    }
    return '/' + stack.join('/');
}`,
    java: `public static String simplifyPath(String path) {
    List<String> stack = new ArrayList<>();
    for (String part : path.split("/")) {
        if (part.isEmpty() || part.equals(".")) continue;
        if (part.equals("..")) {
            if (!stack.isEmpty()) stack.remove(stack.size() - 1);
        } else {
            stack.add(part);
        }
    }
    return "/" + String.join("/", stack);
}`,
  },
  defaultInput: '/home/user/../docs/./notes/',
  run: runSimplifyPath,
  optimalApproachName: 'Component Stack',
  approaches: [
    {
      id: 'in-place-rewrite',
      name: 'In-Place Rewrite',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n) for the split, O(1) extra',
      description:
        'Reuse the split array itself as the stack — a single write index k acts as the stack top, so ".." is just k -= 1 and no auxiliary structure is allocated.',
      code: {
        python: `def simplifyPath(path):
    parts = path.split('/')
    k = 0
    for part in parts:
        if part == '' or part == '.':
            continue
        if part == '..':
            k = max(0, k - 1)
        else:
            parts[k] = part
            k += 1
    return '/' + '/'.join(parts[:k])`,
        javascript: `function simplifyPath(path) {
    const parts = path.split('/');
    let k = 0;
    for (const part of parts) {
        if (part === '' || part === '.') continue;
        if (part === '..') {
            k = Math.max(0, k - 1);
        } else {
            parts[k++] = part;
        }
    }
    return '/' + parts.slice(0, k).join('/');
}`,
        java: `public static String simplifyPath(String path) {
    String[] parts = path.split("/");
    int k = 0;
    for (String part : parts) {
        if (part.isEmpty() || part.equals(".")) continue;
        if (part.equals("..")) {
            k = Math.max(0, k - 1);
        } else {
            parts[k++] = part;
        }
    }
    return "/" + String.join("/", Arrays.copyOfRange(parts, 0, k));
}`,
      },
      run: runSimplifyPathInPlace,
      lineExplanations: {
        python: {
          1: 'Take the raw absolute path',
          2: 'Split once — this array doubles as the stack',
          3: 'k is the stack top: slots 0..k-1 are the kept directories',
          4: 'Read each piece left to right',
          5: 'Empty pieces and "." carry no information',
          6: 'Skip without touching k',
          7: 'A ".." must undo the last kept directory',
          8: 'Just step k back one slot, clamped at the root',
          9: 'Otherwise it is a real directory name',
          10: 'Overwrite slot k — safe because k is never ahead of the read index',
          11: 'Advance the stack top',
          12: 'Join only the first k slots under one leading slash',
        },
        javascript: {
          1: 'Take the raw absolute path',
          2: 'Split once — this array doubles as the stack',
          3: 'k is the stack top: slots 0..k-1 are the kept directories',
          4: 'Read each piece left to right',
          5: 'Empty pieces and "." carry no information — skip without touching k',
          6: 'A ".." must undo the last kept directory',
          7: 'Just step k back one slot, clamped at the root',
          8: 'Otherwise it is a real directory name',
          9: 'Overwrite slot k and advance — k is never ahead of the read index',
          12: 'Join only the first k slots under one leading slash',
        },
        java: {
          1: 'Take the raw absolute path',
          2: 'Split once — this array doubles as the stack',
          3: 'k is the stack top: slots 0..k-1 are the kept directories',
          4: 'Read each piece left to right',
          5: 'Empty pieces and "." carry no information — skip without touching k',
          6: 'A ".." must undo the last kept directory',
          7: 'Just step k back one slot, clamped at the root',
          8: 'Otherwise it is a real directory name',
          9: 'Overwrite slot k and advance — k is never ahead of the read index',
          12: 'Join only the first k slots under one leading slash',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Take the raw absolute path',
      2: 'Stack of directory names that survive simplification',
      3: "Split on '/' and walk the pieces left to right",
      4: 'An empty piece (from // or a trailing /) or "." means "stay here"',
      5: 'So it contributes nothing — skip it',
      6: 'A ".." means move up one directory',
      7: 'Only possible if we are not already at the root',
      8: 'Undo the most recent directory by popping it',
      9: 'Anything else is a real directory name',
      10: 'Descend into it by pushing it on the stack',
      11: 'Rebuild the canonical path with one leading slash and no trailing slash',
    },
    javascript: {
      1: 'Take the raw absolute path',
      2: 'Stack of directory names that survive simplification',
      3: "Split on '/' and walk the pieces left to right",
      4: 'Empty pieces and "." mean "stay here" — skip them',
      5: 'A ".." means move up one directory',
      6: 'Undo the most recent directory, unless we are already at the root',
      7: 'Anything else is a real directory name',
      8: 'Descend into it by pushing it on the stack',
      11: 'Rebuild the canonical path with one leading slash and no trailing slash',
    },
    java: {
      1: 'Take the raw absolute path',
      2: 'List used as a stack of surviving directory names',
      3: 'Split on "/" and walk the pieces left to right',
      4: 'Empty pieces and "." mean "stay here" — skip them',
      5: 'A ".." means move up one directory',
      6: 'Undo the most recent directory, unless we are already at the root',
      7: 'Anything else is a real directory name',
      8: 'Descend into it by pushing it on the stack',
      11: 'Rebuild the canonical path with one leading slash and no trailing slash',
    },
  },
};
