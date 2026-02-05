import type { Category } from '../types/algorithm';

// Arrays & Hashing
import { twoSum } from './arrays-hashing/twoSum';
import { containsDuplicate } from './arrays-hashing/containsDuplicate';
import { validAnagram } from './arrays-hashing/validAnagram';
import { groupAnagrams } from './arrays-hashing/groupAnagrams';
import { topKFrequent } from './arrays-hashing/topKFrequent';
import { encodeDecode } from './arrays-hashing/encodeDecode';
import { productExceptSelf } from './arrays-hashing/productExceptSelf';
import { validSudoku } from './arrays-hashing/validSudoku';
import { longestConsecutive } from './arrays-hashing/longestConsecutive';

// Two Pointers
import { validPalindrome } from './two-pointers/validPalindrome';
import { twoSumII } from './two-pointers/twoSumII';
import { threeSum } from './two-pointers/threeSum';
import { containerWithMostWater } from './two-pointers/containerWithMostWater';
import { trappingRainWater } from './two-pointers/trappingRainWater';

// Stack
import { validParentheses } from './stack/validParentheses';
import { minStack } from './stack/minStack';
import { evalRPN } from './stack/evalRPN';
import { generateParentheses } from './stack/generateParentheses';
import { dailyTemperatures } from './stack/dailyTemperatures';
import { carFleet } from './stack/carFleet';
import { largestRectHistogram } from './stack/largestRectHistogram';

// Sliding Window
import { bestTimeToBuySellStock } from './sliding-window/bestTimeToBuySellStock';
import { longestSubstringWithoutRepeating } from './sliding-window/longestSubstringWithoutRepeating';
import { longestRepeatingCharReplacement } from './sliding-window/longestRepeatingCharReplacement';
import { permutationInString } from './sliding-window/permutationInString';
import { minimumWindowSubstring } from './sliding-window/minimumWindowSubstring';
import { slidingWindowMaximum } from './sliding-window/slidingWindowMaximum';

// Binary Search
import { binarySearch } from './binary-search/binarySearch';
import { search2DMatrix } from './binary-search/search2DMatrix';
import { kokoEatingBananas } from './binary-search/kokoEatingBananas';
import { findMinRotatedSorted } from './binary-search/findMinRotatedSorted';
import { searchRotatedSorted } from './binary-search/searchRotatedSorted';
import { timeBasedKeyValue } from './binary-search/timeBasedKeyValue';
import { medianTwoSortedArrays } from './binary-search/medianTwoSortedArrays';

// Linked List
import { reverseLinkedList } from './linked-list/reverseLinkedList';
import { mergeTwoSortedLists } from './linked-list/mergeTwoSortedLists';
import { reorderList } from './linked-list/reorderList';
import { removeNthFromEnd } from './linked-list/removeNthFromEnd';
import { copyListRandomPointer } from './linked-list/copyListRandomPointer';
import { addTwoNumbers } from './linked-list/addTwoNumbers';
import { linkedListCycle } from './linked-list/linkedListCycle';
import { findDuplicateNumber } from './linked-list/findDuplicateNumber';
import { lruCache } from './linked-list/lruCache';
import { mergeKSortedLists } from './linked-list/mergeKSortedLists';
import { reverseNodesKGroup } from './linked-list/reverseNodesKGroup';

// Backtracking
import { subsets } from './backtracking/subsets';
import { combinationSum } from './backtracking/combinationSum';
import { permutations } from './backtracking/permutations';
import { subsetsII } from './backtracking/subsetsII';
import { combinationSumII } from './backtracking/combinationSumII';
import { wordSearch } from './backtracking/wordSearch';
import { palindromePartitioning } from './backtracking/palindromePartitioning';
import { letterCombinations } from './backtracking/letterCombinations';
import { nQueens } from './backtracking/nQueens';

// Tries
import { implementTrie } from './tries/implementTrie';
import { addSearchWords } from './tries/addSearchWords';
import { wordSearchII } from './tries/wordSearchII';

// Heap / Priority Queue
import { kthLargestStream } from './heap/kthLargestStream';
import { lastStoneWeight } from './heap/lastStoneWeight';
import { kClosestPoints } from './heap/kClosestPoints';
import { kthLargestElement } from './heap/kthLargestElement';
import { taskScheduler } from './heap/taskScheduler';
import { designTwitter } from './heap/designTwitter';
import { findMedianDataStream } from './heap/findMedianDataStream';

// Trees
import { invertBinaryTree } from './trees/invertBinaryTree';
import { maxDepthBinaryTree } from './trees/maxDepthBinaryTree';
import { diameterBinaryTree } from './trees/diameterBinaryTree';
import { balancedBinaryTree } from './trees/balancedBinaryTree';
import { sameTree } from './trees/sameTree';
import { subtreeOfAnotherTree } from './trees/subtreeOfAnotherTree';
import { lowestCommonAncestorBST } from './trees/lowestCommonAncestorBST';
import { levelOrderTraversal } from './trees/levelOrderTraversal';
import { rightSideView } from './trees/rightSideView';
import { countGoodNodes } from './trees/countGoodNodes';
import { validateBST } from './trees/validateBST';
import { kthSmallestBST } from './trees/kthSmallestBST';
import { constructFromPreorderInorder } from './trees/constructFromPreorderInorder';
import { maxPathSum } from './trees/maxPathSum';
import { serializeDeserialize } from './trees/serializeDeserialize';

// 1-D Dynamic Programming
import { climbingStairs } from './dp-1d/climbingStairs';
import { minCostClimbingStairs } from './dp-1d/minCostClimbingStairs';
import { houseRobber } from './dp-1d/houseRobber';
import { houseRobberII } from './dp-1d/houseRobberII';
import { longestPalindromicSubstring } from './dp-1d/longestPalindromicSubstring';
import { palindromicSubstrings } from './dp-1d/palindromicSubstrings';
import { decodeWays } from './dp-1d/decodeWays';
import { coinChange } from './dp-1d/coinChange';
import { maxProductSubarray } from './dp-1d/maxProductSubarray';
import { wordBreak } from './dp-1d/wordBreak';
import { longestIncreasingSubsequence } from './dp-1d/longestIncreasingSubsequence';
import { partitionEqualSubsetSum } from './dp-1d/partitionEqualSubsetSum';

// 2-D Dynamic Programming
import { uniquePaths } from './dp-2d/uniquePaths';
import { longestCommonSubsequence } from './dp-2d/longestCommonSubsequence';
import { buySellStockCooldown } from './dp-2d/buySellStockCooldown';
import { coinChangeII } from './dp-2d/coinChangeII';
import { targetSum } from './dp-2d/targetSum';
import { interleavingString } from './dp-2d/interleavingString';
import { longestIncreasingPathMatrix } from './dp-2d/longestIncreasingPathMatrix';
import { distinctSubsequences } from './dp-2d/distinctSubsequences';
import { editDistance } from './dp-2d/editDistance';
import { burstBalloons } from './dp-2d/burstBalloons';
import { regexMatching } from './dp-2d/regexMatching';

// Greedy
import { maximumSubarray } from './greedy/maximumSubarray';
import { jumpGame } from './greedy/jumpGame';
import { jumpGameII } from './greedy/jumpGameII';
import { gasStation } from './greedy/gasStation';
import { handOfStraights } from './greedy/handOfStraights';
import { mergeTriplets } from './greedy/mergeTriplets';
import { partitionLabels } from './greedy/partitionLabels';
import { validParenthesisString } from './greedy/validParenthesisString';

// Intervals
import { insertInterval } from './intervals/insertInterval';
import { mergeIntervals } from './intervals/mergeIntervals';
import { nonOverlappingIntervals } from './intervals/nonOverlappingIntervals';
import { meetingRooms } from './intervals/meetingRooms';
import { meetingRoomsII } from './intervals/meetingRoomsII';
import { minIntervalQuery } from './intervals/minIntervalQuery';

// Math & Geometry
import { rotateImage } from './math-geometry/rotateImage';
import { spiralMatrix } from './math-geometry/spiralMatrix';
import { setMatrixZeroes } from './math-geometry/setMatrixZeroes';
import { happyNumber } from './math-geometry/happyNumber';
import { plusOne } from './math-geometry/plusOne';
import { powXN } from './math-geometry/powXN';
import { multiplyStrings } from './math-geometry/multiplyStrings';
import { detectSquares } from './math-geometry/detectSquares';

// Bit Manipulation
import { singleNumber } from './bit-manipulation/singleNumber';
import { numberOf1Bits } from './bit-manipulation/numberOf1Bits';
import { countingBits } from './bit-manipulation/countingBits';
import { reverseBits } from './bit-manipulation/reverseBits';
import { missingNumber } from './bit-manipulation/missingNumber';
import { sumOfTwoIntegers } from './bit-manipulation/sumOfTwoIntegers';
import { reverseInteger } from './bit-manipulation/reverseInteger';

// Graphs
import { numberOfIslands } from './graphs/numberOfIslands';
import { maxAreaOfIsland } from './graphs/maxAreaOfIsland';
import { cloneGraph } from './graphs/cloneGraph';
import { wallsAndGates } from './graphs/wallsAndGates';
import { rottingOranges } from './graphs/rottingOranges';
import { pacificAtlanticWaterFlow } from './graphs/pacificAtlanticWaterFlow';
import { surroundedRegions } from './graphs/surroundedRegions';
import { courseSchedule } from './graphs/courseSchedule';
import { courseScheduleII } from './graphs/courseScheduleII';
import { graphValidTree } from './graphs/graphValidTree';
import { connectedComponents } from './graphs/connectedComponents';
import { redundantConnection } from './graphs/redundantConnection';
import { wordLadder } from './graphs/wordLadder';

// Advanced Graphs
import { reconstructItinerary } from './advanced-graphs/reconstructItinerary';
import { minCostConnectPoints } from './advanced-graphs/minCostConnectPoints';
import { networkDelayTime } from './advanced-graphs/networkDelayTime';
import { swimInRisingWater } from './advanced-graphs/swimInRisingWater';
import { alienDictionary } from './advanced-graphs/alienDictionary';
import { cheapestFlightsKStops } from './advanced-graphs/cheapestFlightsKStops';

export const categories: Category[] = [
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    icon: '📊',
    algorithms: [twoSum, containsDuplicate, validAnagram, groupAnagrams, topKFrequent, encodeDecode, productExceptSelf, validSudoku, longestConsecutive],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    icon: '👆',
    algorithms: [validPalindrome, twoSumII, threeSum, containerWithMostWater, trappingRainWater],
  },
  {
    id: 'stack',
    name: 'Stack',
    icon: '📚',
    algorithms: [validParentheses, minStack, evalRPN, generateParentheses, dailyTemperatures, carFleet, largestRectHistogram],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    icon: '🪟',
    algorithms: [bestTimeToBuySellStock, longestSubstringWithoutRepeating, longestRepeatingCharReplacement, permutationInString, minimumWindowSubstring, slidingWindowMaximum],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    icon: '🔍',
    algorithms: [binarySearch, search2DMatrix, kokoEatingBananas, findMinRotatedSorted, searchRotatedSorted, timeBasedKeyValue, medianTwoSortedArrays],
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    icon: '🔗',
    algorithms: [reverseLinkedList, mergeTwoSortedLists, reorderList, removeNthFromEnd, copyListRandomPointer, addTwoNumbers, linkedListCycle, findDuplicateNumber, lruCache, mergeKSortedLists, reverseNodesKGroup],
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    icon: '🔙',
    algorithms: [subsets, combinationSum, permutations, subsetsII, combinationSumII, wordSearch, palindromePartitioning, letterCombinations, nQueens],
  },
  {
    id: 'tries',
    name: 'Tries',
    icon: '🔤',
    algorithms: [implementTrie, addSearchWords, wordSearchII],
  },
  {
    id: 'heap',
    name: 'Heap / Priority Queue',
    icon: '⛰️',
    algorithms: [kthLargestStream, lastStoneWeight, kClosestPoints, kthLargestElement, taskScheduler, designTwitter, findMedianDataStream],
  },
  {
    id: 'trees',
    name: 'Trees',
    icon: '🌳',
    algorithms: [invertBinaryTree, maxDepthBinaryTree, diameterBinaryTree, balancedBinaryTree, sameTree, subtreeOfAnotherTree, lowestCommonAncestorBST, levelOrderTraversal, rightSideView, countGoodNodes, validateBST, kthSmallestBST, constructFromPreorderInorder, maxPathSum, serializeDeserialize],
  },
  {
    id: 'dp-1d',
    name: '1-D Dynamic Programming',
    icon: '📈',
    algorithms: [climbingStairs, minCostClimbingStairs, houseRobber, houseRobberII, longestPalindromicSubstring, palindromicSubstrings, decodeWays, coinChange, maxProductSubarray, wordBreak, longestIncreasingSubsequence, partitionEqualSubsetSum],
  },
  {
    id: 'dp-2d',
    name: '2-D Dynamic Programming',
    icon: '📊',
    algorithms: [uniquePaths, longestCommonSubsequence, buySellStockCooldown, coinChangeII, targetSum, interleavingString, longestIncreasingPathMatrix, distinctSubsequences, editDistance, burstBalloons, regexMatching],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    icon: '💰',
    algorithms: [maximumSubarray, jumpGame, jumpGameII, gasStation, handOfStraights, mergeTriplets, partitionLabels, validParenthesisString],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    icon: '📏',
    algorithms: [insertInterval, mergeIntervals, nonOverlappingIntervals, meetingRooms, meetingRoomsII, minIntervalQuery],
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    icon: '📐',
    algorithms: [rotateImage, spiralMatrix, setMatrixZeroes, happyNumber, plusOne, powXN, multiplyStrings, detectSquares],
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    icon: '🔢',
    algorithms: [singleNumber, numberOf1Bits, countingBits, reverseBits, missingNumber, sumOfTwoIntegers, reverseInteger],
  },
  {
    id: 'graphs',
    name: 'Graphs',
    icon: '🕸️',
    algorithms: [numberOfIslands, maxAreaOfIsland, cloneGraph, wallsAndGates, rottingOranges, pacificAtlanticWaterFlow, surroundedRegions, courseSchedule, courseScheduleII, graphValidTree, connectedComponents, redundantConnection, wordLadder],
  },
  {
    id: 'advanced-graphs',
    name: 'Advanced Graphs',
    icon: '🗺️',
    algorithms: [reconstructItinerary, minCostConnectPoints, networkDelayTime, swimInRisingWater, alienDictionary, cheapestFlightsKStops],
  },
];

export const getAllAlgorithms = () => categories.flatMap((c) => c.algorithms);

export const getAlgorithmById = (id: string) =>
  getAllAlgorithms().find((a) => a.id === id);
