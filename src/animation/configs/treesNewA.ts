import { createConfig, treesTemplate } from '../templates';

const t = treesTemplate;

export const treesNewAConfigs = [
  createConfig(t, {
    algorithmId: 'inorder-traversal',
    title: 'Binary Tree Inorder Traversal',
    subtitle: 'Dive left with a stack, pop to visit, then go right',
    codeSnippet: `def inorderTraversal(root):
    result = []
    stack = []
    curr = root
    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'preorder-traversal',
    title: 'Binary Tree Preorder Traversal',
    subtitle: 'Record on arrival; push right before left',
    codeSnippet: `def preorderTraversal(root):
    if not root:
        return []
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right:
            stack.append(node.right)
        if node.left:
            stack.append(node.left)
    return result`,
  }),
  createConfig(t, {
    algorithmId: 'postorder-traversal',
    title: 'Binary Tree Postorder Traversal',
    subtitle: 'Mirrored preorder collected backwards, then reversed',
    codeSnippet: `def postorderTraversal(root):
    if not root:
        return []
    result = []
    stack = [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return result[::-1]`,
  }),
  createConfig(t, {
    algorithmId: 'insert-into-bst',
    title: 'Insert into a Binary Search Tree',
    subtitle: 'One root-to-leaf descent to the only legal empty slot',
    codeSnippet: `def insertIntoBST(root, val):
    node = TreeNode(val)
    if not root:
        return node
    curr = root
    while True:
        if val < curr.val:
            if not curr.left:
                curr.left = node
                break
            curr = curr.left
        else:
            if not curr.right:
                curr.right = node
                break
            curr = curr.right
    return root`,
  }),
];
