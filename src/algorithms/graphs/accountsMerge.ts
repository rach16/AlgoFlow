import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

const localPart = (email: string) => email.split('@')[0];

function collectEmails(accounts: string[][]): string[] {
  const seen: string[] = [];
  for (const acc of accounts) {
    for (const e of acc.slice(1)) {
      if (!seen.includes(e)) seen.push(e);
    }
  }
  return seen;
}

// Link every email of an account to that account's first email — those are the
// edges the merge is really built on, under either approach.
function accountEdges(accounts: string[][]): { from: string; to: string }[] {
  const edges: { from: string; to: string }[] = [];
  for (const acc of accounts) {
    const emails = acc.slice(1);
    for (let i = 1; i < emails.length; i++) {
      edges.push({ from: emails[0], to: emails[i] });
    }
  }
  return edges;
}

function buildAccountsGraph(
  accounts: string[][],
  highlights: string[] = [],
  secondary: string[] = [],
  visitedEdges: [string, string][] = []
) {
  const nodes = collectEmails(accounts).map(e => ({ id: e, label: localPart(e) }));
  return {
    graph: { nodes, edges: accountEdges(accounts) },
    graphHighlights: highlights,
    graphSecondary: secondary,
    graphVisitedEdges: visitedEdges,
    graphDirected: false,
  };
}

function formatGroups(groups: [string, string[]][], owner: Record<string, string>): string {
  return groups
    .map(([root, emails]) => `[${owner[root]}: ${[...emails].sort().join(', ')}]`)
    .join(' | ');
}

function runAccountsMerge(input: unknown): AlgorithmStep[] {
  const accounts = (input as string[][]).map(a => [...a]);
  const steps: AlgorithmStep[] = [];

  const parent: Record<string, string> = {};
  const owner: Record<string, string> = {};
  const order: string[] = [];

  function find(x: string): string {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  const parentMap = () =>
    Object.fromEntries(order.map(e => [localPart(e), `parent=${localPart(parent[e])}`]));

  steps.push({
    state: {
      ...buildAccountsGraph(accounts),
      result: 'Merging accounts...',
    },
    highlights: [],
    message: `${accounts.length} raw accounts. Two accounts belong to the same person exactly when they share an email — so union every email of an account together and let the components fall out.`,
    codeLine: 1,
  } as AlgorithmStep);

  const unionedEdges: [string, string][] = [];

  accounts.forEach((acc, idx) => {
    const name = acc[0];
    const emails = acc.slice(1);

    const fresh: string[] = [];
    for (const e of emails) {
      if (!(e in parent)) {
        parent[e] = e;
        order.push(e);
        fresh.push(e);
      }
      owner[e] = name;
    }

    steps.push({
      state: {
        ...buildAccountsGraph(accounts, emails, [], unionedEdges.map(e => [...e] as [string, string])),
        hashMap: parentMap(),
        result: `Account ${idx} registered (${name})`,
      },
      highlights: [],
      message: `Account ${idx} — ${name}: ${emails.map(localPart).join(', ')}. ${fresh.length === emails.length ? 'All new; each email starts as its own root.' : `${emails.length - fresh.length} email(s) already seen, so this account is about to be stitched onto an existing group.`}`,
      codeLine: 18,
      action: 'insert',
    } as AlgorithmStep);

    for (let i = 1; i < emails.length; i++) {
      const a = emails[0];
      const b = emails[i];
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
      unionedEdges.push([a, b]);

      steps.push({
        state: {
          ...buildAccountsGraph(accounts, [a, b], [], unionedEdges.map(e => [...e] as [string, string])),
          hashMap: parentMap(),
          result: `union(${localPart(a)}, ${localPart(b)})`,
        },
        highlights: [],
        message:
          ra !== rb
            ? `union(${localPart(a)}, ${localPart(b)}): different roots (${localPart(ra)} vs ${localPart(rb)}) — hang ${localPart(rb)} under ${localPart(ra)}. Both mailboxes now belong to one person.`
            : `union(${localPart(a)}, ${localPart(b)}): already share root ${localPart(ra)} — nothing to do.`,
        codeLine: 21,
        action: 'insert',
      } as AlgorithmStep);
    }
  });

  const groupMap = new Map<string, string[]>();
  for (const e of order) {
    const r = find(e);
    if (!groupMap.has(r)) groupMap.set(r, []);
    groupMap.get(r)!.push(e);

    steps.push({
      state: {
        ...buildAccountsGraph(accounts, [e], [r], unionedEdges.map(x => [...x] as [string, string])),
        hashMap: parentMap(),
        result: `${groupMap.size} group(s) so far`,
      },
      highlights: [],
      message: `find(${localPart(e)}) = ${localPart(r)} → file it under that root. ${groupMap.size} distinct person(s) found so far.`,
      codeLine: 25,
      action: 'visit',
    } as AlgorithmStep);
  }

  const groups = [...groupMap.entries()];
  const answer = formatGroups(groups, owner);

  for (const [root, emails] of groups) {
    steps.push({
      state: {
        ...buildAccountsGraph(accounts, emails, [root], unionedEdges.map(x => [...x] as [string, string])),
        hashMap: parentMap(),
        result: `[${owner[root]}: ${[...emails].sort().join(', ')}]`,
      },
      highlights: [],
      message: `Root ${localPart(root)} owns ${emails.length} email(s). Emit ${owner[root]} followed by them in sorted order.`,
      codeLine: 27,
      action: 'found',
    } as AlgorithmStep);
  }

  steps.push({
    state: {
      ...buildAccountsGraph(accounts, [], [], unionedEdges.map(x => [...x] as [string, string])),
      hashMap: parentMap(),
      result: answer,
    },
    highlights: [],
    message: `Done! ${accounts.length} raw accounts collapsed into ${groups.length} real people.`,
    codeLine: 27,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

function runAccountsMergeDFS(input: unknown): AlgorithmStep[] {
  const accounts = (input as string[][]).map(a => [...a]);
  const steps: AlgorithmStep[] = [];

  const adj = new Map<string, Set<string>>();
  const owner: Record<string, string> = {};

  for (const acc of accounts) {
    const name = acc[0];
    const emails = acc.slice(1);
    for (const e of emails) {
      owner[e] = name;
      if (!adj.has(emails[0])) adj.set(emails[0], new Set());
      if (!adj.has(e)) adj.set(e, new Set());
      adj.get(emails[0])!.add(e);
      adj.get(e)!.add(emails[0]);
    }
  }

  const adjMap = () =>
    Object.fromEntries(
      [...adj.entries()].map(([e, nei]) => [
        localPart(e),
        `→ {${[...nei].filter(n => n !== e).map(localPart).join(',') || '∅'}}`,
      ])
    );

  steps.push({
    state: {
      ...buildAccountsGraph(accounts),
      hashMap: adjMap(),
      result: 'Merging accounts...',
    },
    highlights: [],
    message: `Same idea without Union-Find: treat every email as a node, wire each account's emails to its first email, then each connected component is exactly one person.`,
    codeLine: 1,
  } as AlgorithmStep);

  const visited = new Set<string>();
  const groups: [string, string[]][] = [];
  const walkedEdges: [string, string][] = [];

  function dfs(e: string, component: string[]) {
    visited.add(e);
    component.push(e);

    steps.push({
      state: {
        ...buildAccountsGraph(accounts, [...component], [], walkedEdges.map(x => [...x] as [string, string])),
        hashMap: adjMap(),
        result: `Component so far: ${component.map(localPart).join(', ')}`,
      },
      highlights: [],
      message: `Visit ${localPart(e)} and add it to the current component. Neighbours: {${[...adj.get(e)!].filter(n => n !== e).map(localPart).join(',') || '∅'}}.`,
      codeLine: 15,
      action: 'visit',
    } as AlgorithmStep);

    for (const nei of adj.get(e)!) {
      if (!visited.has(nei)) {
        walkedEdges.push([e, nei]);
        dfs(nei, component);
      }
    }
  }

  for (const e of adj.keys()) {
    if (visited.has(e)) continue;

    steps.push({
      state: {
        ...buildAccountsGraph(accounts, [], [e], walkedEdges.map(x => [...x] as [string, string])),
        hashMap: adjMap(),
        result: `${groups.length} group(s) so far`,
      },
      highlights: [],
      message: `${localPart(e)} is unvisited — it opens a brand-new component. Start a DFS here; owner is ${owner[e]}.`,
      codeLine: 22,
      action: 'found',
    } as AlgorithmStep);

    const component: string[] = [];
    dfs(e, component);
    groups.push([e, component]);

    steps.push({
      state: {
        ...buildAccountsGraph(accounts, [...component], [], walkedEdges.map(x => [...x] as [string, string])),
        hashMap: adjMap(),
        result: `[${owner[e]}: ${[...component].sort().join(', ')}]`,
      },
      highlights: [],
      message: `Component closed with ${component.length} email(s). Emit ${owner[e]} plus the sorted emails.`,
      codeLine: 24,
      action: 'found',
    } as AlgorithmStep);
  }

  const answer = formatGroups(groups, owner);

  steps.push({
    state: {
      ...buildAccountsGraph(accounts, [], [], walkedEdges.map(x => [...x] as [string, string])),
      hashMap: adjMap(),
      result: answer,
    },
    highlights: [],
    message: `Done! ${groups.length} connected components = ${groups.length} people — the same merge Union-Find produced, just spelled out as graph traversal.`,
    codeLine: 25,
    action: 'found',
  } as AlgorithmStep);

  return steps;
}

export const accountsMerge: Algorithm = {
  id: 'accounts-merge',
  name: 'Accounts Merge',
  category: 'Graphs',
  difficulty: 'Medium',
  timeComplexity: 'O(N·α(N) + N log N)',
  spaceComplexity: 'O(N)',
  pattern: 'Union-Find — merge emails that share an account',
  description:
    'Each account is a name followed by a list of emails. Two accounts belong to the same person if they share at least one email (names alone are not enough). Merge them and return each person as their name followed by their emails in sorted order.',
  problemUrl: 'https://leetcode.com/problems/accounts-merge/',
  code: {
    python: `def accountsMerge(accounts):
    parent = {}
    owner = {}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for name, *emails in accounts:
        for e in emails:
            parent.setdefault(e, e)
            owner[e] = name
        for e in emails[1:]:
            union(emails[0], e)

    groups = defaultdict(list)
    for e in parent:
        groups[find(e)].append(e)

    return [[owner[root]] + sorted(emails)
            for root, emails in groups.items()]`,
    javascript: `function accountsMerge(accounts) {
    const parent = new Map(), owner = new Map();

    const find = (x) => {
        while (parent.get(x) !== x) {
            parent.set(x, parent.get(parent.get(x)));
            x = parent.get(x);
        }
        return x;
    };

    const union = (a, b) => {
        const ra = find(a), rb = find(b);
        if (ra !== rb) parent.set(rb, ra);
    };

    for (const [name, ...emails] of accounts) {
        for (const e of emails) {
            if (!parent.has(e)) parent.set(e, e);
            owner.set(e, name);
        }
        for (let i = 1; i < emails.length; i++) union(emails[0], emails[i]);
    }

    const groups = new Map();
    for (const e of parent.keys()) {
        const r = find(e);
        if (!groups.has(r)) groups.set(r, []);
        groups.get(r).push(e);
    }
    return [...groups].map(([r, es]) => [owner.get(r), ...es.sort()]);
}`,
    java: `public static List<List<String>> accountsMerge(List<List<String>> accounts) {
    Map<String, String> parent = new HashMap<>();
    Map<String, String> owner = new HashMap<>();

    for (List<String> acc : accounts) {
        String name = acc.get(0);
        for (int i = 1; i < acc.size(); i++) {
            parent.putIfAbsent(acc.get(i), acc.get(i));
            owner.put(acc.get(i), name);
        }
        for (int i = 2; i < acc.size(); i++) {
            union(acc.get(1), acc.get(i), parent);
        }
    }

    Map<String, List<String>> groups = new HashMap<>();
    for (String e : parent.keySet()) {
        groups.computeIfAbsent(find(e, parent), k -> new ArrayList<>()).add(e);
    }

    List<List<String>> res = new ArrayList<>();
    for (Map.Entry<String, List<String>> en : groups.entrySet()) {
        List<String> merged = new ArrayList<>();
        merged.add(owner.get(en.getKey()));
        Collections.sort(en.getValue());
        merged.addAll(en.getValue());
        res.add(merged);
    }
    return res;
}

private static String find(String x, Map<String, String> parent) {
    while (!parent.get(x).equals(x)) {
        parent.put(x, parent.get(parent.get(x)));
        x = parent.get(x);
    }
    return x;
}

private static void union(String a, String b, Map<String, String> parent) {
    String ra = find(a, parent), rb = find(b, parent);
    if (!ra.equals(rb)) parent.put(rb, ra);
}`,
  },
  defaultInput: [
    ['John', 'johnsmith@mail.com', 'john00@mail.com'],
    ['John', 'johnnybravo@mail.com'],
    ['John', 'johnsmith@mail.com', 'john_nyc@mail.com'],
    ['Mary', 'mary@mail.com'],
  ],
  run: runAccountsMerge,
  optimalApproachName: 'Union-Find on Emails',
  approaches: [
    {
      id: 'email-graph-dfs',
      name: 'Email Graph DFS',
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)',
      description:
        'Skips Union-Find entirely: build an undirected graph where each account wires its emails to its first email, then every connected component found by DFS is one person.',
      code: {
        python: `def accountsMerge(accounts):
    adj = defaultdict(set)
    owner = {}
    for name, *emails in accounts:
        for e in emails:
            owner[e] = name
            adj[emails[0]].add(e)
            adj[e].add(emails[0])

    visited = set()
    res = []

    def dfs(e, component):
        visited.add(e)
        component.append(e)
        for nei in adj[e]:
            if nei not in visited:
                dfs(nei, component)

    for e in adj:
        if e not in visited:
            component = []
            dfs(e, component)
            res.append([owner[e]] + sorted(component))
    return res`,
        javascript: `function accountsMerge(accounts) {
    const adj = new Map(), owner = new Map();
    for (const [name, ...emails] of accounts) {
        for (const e of emails) {
            owner.set(e, name);
            if (!adj.has(e)) adj.set(e, new Set());
            if (!adj.has(emails[0])) adj.set(emails[0], new Set());
            adj.get(emails[0]).add(e);
            adj.get(e).add(emails[0]);
        }
    }

    const visited = new Set(), res = [];
    const dfs = (e, comp) => {
        visited.add(e);
        comp.push(e);
        for (const nei of adj.get(e)) {
            if (!visited.has(nei)) dfs(nei, comp);
        }
    };

    for (const e of adj.keys()) {
        if (visited.has(e)) continue;
        const comp = [];
        dfs(e, comp);
        res.push([owner.get(e), ...comp.sort()]);
    }
    return res;
}`,
        java: `public static List<List<String>> accountsMerge(List<List<String>> accounts) {
    Map<String, Set<String>> adj = new HashMap<>();
    Map<String, String> owner = new HashMap<>();
    for (List<String> acc : accounts) {
        String first = acc.get(1);
        for (int i = 1; i < acc.size(); i++) {
            String e = acc.get(i);
            owner.put(e, acc.get(0));
            adj.computeIfAbsent(e, k -> new HashSet<>()).add(first);
            adj.computeIfAbsent(first, k -> new HashSet<>()).add(e);
        }
    }

    Set<String> visited = new HashSet<>();
    List<List<String>> res = new ArrayList<>();
    for (String e : adj.keySet()) {
        if (visited.contains(e)) continue;
        List<String> comp = new ArrayList<>();
        dfs(e, adj, visited, comp);
        Collections.sort(comp);
        List<String> merged = new ArrayList<>();
        merged.add(owner.get(e));
        merged.addAll(comp);
        res.add(merged);
    }
    return res;
}

private static void dfs(String e, Map<String, Set<String>> adj,
                        Set<String> visited, List<String> comp) {
    visited.add(e);
    comp.add(e);
    for (String nei : adj.get(e)) {
        if (!visited.contains(nei)) dfs(nei, adj, visited, comp);
    }
}`,
      },
      run: runAccountsMergeDFS,
      lineExplanations: {
        python: {
          1: 'Take the raw list of accounts',
          2: 'Adjacency: email -> emails sharing an account with it',
          3: 'Remember which name owns each email',
          4: 'Unpack the name and its email list',
          5: 'Wire every email of this account...',
          6: 'Record the owning name',
          7: '...to the account first email',
          8: 'Undirected, so add the reverse link too',
          10: 'Emails already placed in some component',
          11: 'Merged accounts accumulate here',
          13: 'DFS collecting one connected component',
          14: 'Never revisit an email',
          15: 'This email belongs to the component',
          16: 'Follow every co-account email',
          17: 'Only descend into unseen emails',
          18: 'Recurse to pull in the rest of the component',
          20: 'Try every email as a component seed',
          21: 'Skip ones already merged',
          22: 'Fresh component starts empty',
          23: 'Flood-fill it',
          24: 'Name first, then emails sorted',
          25: 'Return the merged accounts',
        },
        javascript: {
          1: 'Take the raw list of accounts',
          2: 'Adjacency map plus email -> name map',
          3: 'Unpack the name and its email list',
          4: 'Wire every email of this account',
          5: 'Record the owning name',
          6: 'Ensure this email has a neighbour set',
          7: 'Ensure the anchor email has one too',
          8: 'Link anchor -> email',
          9: 'Undirected, so link email -> anchor',
          13: 'Track visited emails and the output list',
          14: 'DFS collecting one connected component',
          15: 'Never revisit an email',
          16: 'This email belongs to the component',
          17: 'Follow every co-account email',
          18: 'Only descend into unseen emails',
          22: 'Try every email as a component seed',
          23: 'Skip ones already merged',
          24: 'Fresh component starts empty',
          25: 'Flood-fill it',
          26: 'Name first, then emails sorted',
          28: 'Return the merged accounts',
        },
        java: {
          1: 'Take the raw list of accounts',
          2: 'Adjacency: email -> emails sharing an account',
          3: 'Remember which name owns each email',
          4: 'Walk every raw account',
          5: 'Its first email is the anchor node',
          6: 'Wire every email of this account',
          8: 'Record the owning name',
          9: 'Link email -> anchor',
          10: 'Undirected, so link anchor -> email',
          14: 'Emails already placed in some component',
          16: 'Try every email as a component seed',
          17: 'Skip ones already merged',
          18: 'Fresh component starts empty',
          19: 'Flood-fill it with DFS',
          20: 'Emails must come out sorted',
          22: 'Name goes first in the output row',
          26: 'Return the merged accounts',
          29: 'DFS collecting one connected component',
          31: 'Never revisit an email',
          32: 'This email belongs to the component',
          33: 'Follow every co-account email',
          34: 'Recurse into unseen neighbours',
        },
      },
    },
  ],
  lineExplanations: {
    python: {
      1: 'Take the raw list of accounts',
      2: 'Union-Find parent pointer per email',
      3: 'Remember which name owns each email',
      5: 'Find the representative email of a group',
      6: 'Climb until we reach a self-parent',
      7: 'Path compression: skip to the grandparent',
      8: 'Move up one level',
      9: 'Return the root email',
      11: 'Merge the groups of two emails',
      12: 'Locate both roots',
      13: 'Already merged? nothing to do',
      14: 'Otherwise hang one root under the other',
      16: 'Process each raw account',
      17: 'Register every email it contains',
      18: 'A new email starts as its own root',
      19: 'Record the account name for this email',
      20: 'Every other email of this account...',
      21: '...gets unioned with the first one',
      23: 'Bucket emails by their final root',
      24: 'Walk every known email',
      25: 'find() gives the person it belongs to',
      27: 'Name first, then the emails sorted',
      28: 'One output row per merged person',
    },
    javascript: {
      1: 'Take the raw list of accounts',
      2: 'Parent pointers and email -> name map',
      4: 'Find the representative email of a group',
      5: 'Climb until we reach a self-parent',
      6: 'Path compression: skip to the grandparent',
      7: 'Move up one level',
      9: 'Return the root email',
      12: 'Merge the groups of two emails',
      13: 'Locate both roots',
      14: 'Hang one root under the other if distinct',
      17: 'Process each raw account',
      18: 'Register every email it contains',
      19: 'A new email starts as its own root',
      20: 'Record the account name for this email',
      22: 'Union each later email with the first',
      25: 'Bucket emails by their final root',
      26: 'Walk every known email',
      27: 'find() gives the person it belongs to',
      28: 'Create the bucket on first sight',
      29: 'Drop the email into its bucket',
      31: 'Name first, then the emails sorted',
    },
    java: {
      1: 'Take the raw list of accounts',
      2: 'Union-Find parent pointer per email',
      3: 'Remember which name owns each email',
      5: 'Process each raw account',
      6: 'The account name',
      7: 'Register every email it contains',
      8: 'A new email starts as its own root',
      9: 'Record the account name for this email',
      11: 'Every email after the first...',
      12: '...gets unioned with the first one',
      16: 'Bucket emails by their final root',
      17: 'Walk every known email',
      18: 'find() gives the person it belongs to',
      21: 'Build the output rows',
      22: 'One row per merged person',
      24: 'Name goes first',
      25: 'Emails must come out sorted',
      26: 'Append the sorted emails',
      29: 'Return the merged accounts',
      32: 'Find the representative email of a group',
      33: 'Climb until we reach a self-parent',
      34: 'Path compression: skip to the grandparent',
      35: 'Move up one level',
      37: 'Return the root email',
      40: 'Merge the groups of two emails',
      41: 'Locate both roots',
      42: 'Hang one root under the other if distinct',
    },
  },
};
