import { createConfig, treesTemplate } from '../templates';

const t = treesTemplate;

export const treesConfigs = [
  createConfig(t, {
    algorithmId: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    subtitle: 'Mirror a binary tree',
    codeSnippet: `def invertTree(root):
    if not root:
        return None
    root.left, root.right = root.right, root.left
    invertTree(root.left)
    invertTree(root.right)
    return root`,
  }),
  createConfig(t, {
    algorithmId: 'max-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    subtitle: 'Find tree height via DFS',
    codeSnippet: `def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
  }),
  createConfig(t, {
    algorithmId: 'diameter-binary-tree',
    title: 'Diameter of Binary Tree',
    subtitle: 'Longest path between any two nodes',
    codeSnippet: `def diameterOfBinaryTree(root):
    result = [0]
    def dfs(node):
        if not node:
            return -1
        left = dfs(node.left)
        right = dfs(node.right)
        result[0] = max(result[0], 2 + left + right)
        return 1 + max(left, right)
    dfs(root)
    return result[0]`,
  }),
  createConfig(t, {
    algorithmId: 'balanced-binary-tree',
    title: 'Balanced Binary Tree',
    subtitle: 'Check if tree is height-balanced',
    codeSnippet: `def isBalanced(root):
    def dfs(node):
        if not node:
            return [True, 0]
        left, right = dfs(node.left), dfs(node.right)
        balanced = (left[0] and right[0] and
                   abs(left[1] - right[1]) <= 1)
        return [balanced, 1 + max(left[1], right[1])]
    return dfs(root)[0]`,
  }),
  createConfig(t, {
    algorithmId: 'same-tree',
    title: 'Same Tree',
    subtitle: 'Check if two trees are identical',
    codeSnippet: `def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return (isSameTree(p.left, q.left) and
            isSameTree(p.right, q.right))`,
  }),
  createConfig(t, {
    algorithmId: 'subtree-of-another-tree',
    title: 'Subtree of Another Tree',
    subtitle: 'Check if tree contains subtree',
    codeSnippet: `def isSubtree(root, subRoot):
    if not subRoot:
        return True
    if not root:
        return False
    if isSameTree(root, subRoot):
        return True
    return (isSubtree(root.left, subRoot) or
            isSubtree(root.right, subRoot))`,
  }),
  createConfig(t, {
    algorithmId: 'lowest-common-ancestor-bst',
    title: 'Lowest Common Ancestor of BST',
    subtitle: 'Find LCA in binary search tree',
    codeSnippet: `def lowestCommonAncestor(root, p, q):
    cur = root
    while cur:
        if p.val > cur.val and q.val > cur.val:
            cur = cur.right
        elif p.val < cur.val and q.val < cur.val:
            cur = cur.left
        else:
            return cur`,
  }),
  createConfig(t, {
    algorithmId: 'level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    subtitle: 'BFS level-by-level traversal',
    codeSnippet: `def levelOrder(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'right-side-view',
    title: 'Binary Tree Right Side View',
    subtitle: 'View tree from right side',
    codeSnippet: `def rightSideView(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        rightSide = None
        for _ in range(len(queue)):
            node = queue.popleft()
            rightSide = node
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(rightSide.val)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'count-good-nodes',
    title: 'Count Good Nodes in Binary Tree',
    subtitle: 'Count nodes >= all ancestors',
    codeSnippet: `def goodNodes(root):
    def dfs(node, maxVal):
        if not node:
            return 0
        res = 1 if node.val >= maxVal else 0
        maxVal = max(maxVal, node.val)
        res += dfs(node.left, maxVal)
        res += dfs(node.right, maxVal)
        return res
    return dfs(root, root.val)`,
  }),
  createConfig(t, {
    algorithmId: 'validate-bst',
    title: 'Validate Binary Search Tree',
    subtitle: 'Check BST property for all nodes',
    codeSnippet: `def isValidBST(root):
    def valid(node, left, right):
        if not node:
            return True
        if not (left < node.val < right):
            return False
        return (valid(node.left, left, node.val) and
                valid(node.right, node.val, right))
    return valid(root, float('-inf'), float('inf'))`,
  }),
  createConfig(t, {
    algorithmId: 'kth-smallest-bst',
    title: 'Kth Smallest Element in a BST',
    subtitle: 'Inorder traversal to find kth',
    codeSnippet: `def kthSmallest(root, k):
    stack = []
    cur = root
    while stack or cur:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val
        cur = cur.right`,
  }),
  createConfig(t, {
    algorithmId: 'construct-from-preorder-inorder',
    title: 'Construct Binary Tree from Preorder and Inorder',
    subtitle: 'Build tree from traversals',
    codeSnippet: `def buildTree(preorder, inorder):
    if not preorder or not inorder:
        return None
    root = TreeNode(preorder[0])
    mid = inorder.index(preorder[0])
    root.left = buildTree(preorder[1:mid+1], inorder[:mid])
    root.right = buildTree(preorder[mid+1:], inorder[mid+1:])
    return root`,
  }),
  createConfig(t, {
    algorithmId: 'max-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    subtitle: 'Find max sum path in tree',
    codeSnippet: `def maxPathSum(root):
    result = [root.val]
    def dfs(node):
        if not node:
            return 0
        leftMax = max(dfs(node.left), 0)
        rightMax = max(dfs(node.right), 0)
        result[0] = max(result[0], node.val + leftMax + rightMax)
        return node.val + max(leftMax, rightMax)
    dfs(root)
    return result[0]`,
  }),
  createConfig(t, {
    algorithmId: 'serialize-deserialize',
    title: 'Serialize and Deserialize Binary Tree',
    subtitle: 'Convert tree to/from string',
    codeSnippet: `def serialize(root):
    result = []
    def dfs(node):
        if not node:
            result.append('N')
            return
        result.append(str(node.val))
        dfs(node.left)
        dfs(node.right)
    dfs(root)
    return ','.join(result)

def deserialize(data):
    vals = data.split(',')
    self.i = 0
    def dfs():
        if vals[self.i] == 'N':
            self.i += 1
            return None
        node = TreeNode(int(vals[self.i]))
        self.i += 1
        node.left = dfs()
        node.right = dfs()
        return node
    return dfs()`,
  }),
];
