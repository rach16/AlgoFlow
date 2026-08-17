import { createConfig, treesTemplate } from '../templates';

const t = treesTemplate;

export const treesNewBConfigs = [
  createConfig(t, {
    algorithmId: 'delete-node-bst',
    title: 'Delete Node in a BST',
    subtitle: 'Swap in the inorder successor, then delete that',
    codeSnippet: `def deleteNode(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = deleteNode(root.left, key)
    elif key > root.val:
        root.right = deleteNode(root.right, key)
    else:
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        succ = root.right
        while succ.left:
            succ = succ.left
        root.val = succ.val
        root.right = deleteNode(root.right, succ.val)
    return root`,
  }),
  createConfig(t, {
    algorithmId: 'house-robber-iii',
    title: 'House Robber III',
    subtitle: 'Every subtree returns a (rob, skip) pair',
    codeSnippet: `def rob(root):
    def dfs(node):
        if not node:
            return (0, 0)
        left = dfs(node.left)
        right = dfs(node.right)
        with_node = node.val + left[1] + right[1]
        without_node = max(left) + max(right)
        return (with_node, without_node)
    return max(dfs(root))`,
  }),
  createConfig(t, {
    algorithmId: 'delete-leaves-given-value',
    title: 'Delete Leaves With a Given Value',
    subtitle: 'Post-order pruning cascades in a single pass',
    codeSnippet: `def removeLeafNodes(root, target):
    if not root:
        return None
    root.left = removeLeafNodes(root.left, target)
    root.right = removeLeafNodes(root.right, target)
    if not root.left and not root.right and root.val == target:
        return None
    return root`,
  }),
  createConfig(t, {
    algorithmId: 'construct-quad-tree',
    title: 'Construct Quad Tree',
    subtitle: 'Split into four quadrants until each square is uniform',
    codeSnippet: `def construct(grid):
    def build(r, c, n):
        first = grid[r][c]
        uniform = True
        for i in range(r, r + n):
            for j in range(c, c + n):
                if grid[i][j] != first:
                    uniform = False
        if uniform:
            return Node(first == 1, True)
        half = n // 2
        return Node(True, False,
                    build(r, c, half),
                    build(r, c + half, half),
                    build(r + half, c, half),
                    build(r + half, c + half, half))
    return build(0, 0, len(grid))`,
  }),
];
