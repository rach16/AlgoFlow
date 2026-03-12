import { createConfig, triesTemplate } from '../templates';

const t = triesTemplate;

export const triesConfigs = [
  createConfig(t, {
    algorithmId: 'implement-trie',
    title: 'Implement Trie (Prefix Tree)',
    subtitle: 'Build a trie data structure',
    codeSnippet: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.endOfWord = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word):
        cur = self.root
        for c in word:
            if c not in cur.children:
                cur.children[c] = TrieNode()
            cur = cur.children[c]
        cur.endOfWord = True
    def search(self, word):
        cur = self.root
        for c in word:
            if c not in cur.children:
                return False
            cur = cur.children[c]
        return cur.endOfWord`,
  }),
  createConfig(t, {
    algorithmId: 'add-search-words',
    title: 'Add and Search Words',
    subtitle: 'Trie with wildcard search',
    codeSnippet: `class WordDictionary:
    def __init__(self):
        self.root = TrieNode()
    def addWord(self, word):
        cur = self.root
        for c in word:
            if c not in cur.children:
                cur.children[c] = TrieNode()
            cur = cur.children[c]
        cur.endOfWord = True
    def search(self, word):
        def dfs(j, root):
            cur = root
            for i in range(j, len(word)):
                c = word[i]
                if c == '.':
                    for child in cur.children.values():
                        if dfs(i+1, child):
                            return True
                    return False
                if c not in cur.children:
                    return False
                cur = cur.children[c]
            return cur.endOfWord
        return dfs(0, self.root)`,
  }),
  createConfig(t, {
    algorithmId: 'word-search-ii',
    title: 'Word Search II',
    subtitle: 'Find all words in grid using trie',
    codeSnippet: `def findWords(board, words):
    root = buildTrie(words)
    result = set()
    for r in range(len(board)):
        for c in range(len(board[0])):
            dfs(board, r, c, root, '', result)
    return list(result)

def dfs(board, r, c, node, word, result):
    if node.endOfWord:
        result.add(word)
    if (r < 0 or c < 0 or r >= len(board) or
        c >= len(board[0]) or board[r][c] not in node.children):
        return
    char = board[r][c]
    board[r][c] = '#'
    for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
        dfs(board, r+dr, c+dc, node.children[char], word+char, result)
    board[r][c] = char`,
  }),
];
