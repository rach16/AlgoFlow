import type { Algorithm, AlgorithmStep } from '../../types/algorithm';

type TwitterOp = [string, ...number[]];

function runDesignTwitter(input: unknown): AlgorithmStep[] {
  const operations = input as TwitterOp[];
  const steps: AlgorithmStep[] = [];

  // Twitter state
  const tweets: { userId: number; tweetId: number; time: number }[] = [];
  const following: Record<number, Set<number>> = {};
  let timestamp = 0;

  const getFollowMap = (): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const [userId, followees] of Object.entries(following)) {
      map[`user${userId}`] = Array.from(followees).join(', ') || 'none';
    }
    return map;
  };

  steps.push({
    state: {
      hashMap: {},
      chars: operations.map((op) => op.join(',')),
    },
    highlights: [],
    message: 'Initialize Twitter. Each user can post tweets, follow/unfollow, and view news feed.',
    codeLine: 1,
  });

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const opName = op[0];

    steps.push({
      state: {
        hashMap: getFollowMap(),
        chars: operations.map((o) => o.join(',')),
      },
      highlights: [i],
      pointers: { op: i },
      message: `Operation: ${opName}(${op.slice(1).join(', ')})`,
      codeLine: 3,
      action: 'visit',
    });

    if (opName === 'postTweet') {
      const userId = op[1];
      const tweetId = op[2];
      timestamp++;

      if (!following[userId]) {
        following[userId] = new Set([userId]);
      }

      tweets.push({ userId, tweetId, time: timestamp });

      const recentTweets = tweets
        .slice(-10)
        .reverse()
        .map((t) => `user${t.userId}:tweet${t.tweetId}`);

      steps.push({
        state: {
          hashMap: {
            ...getFollowMap(),
            recentTweets: recentTweets.join(' | '),
          },
          chars: operations.map((o) => o.join(',')),
        },
        highlights: [i],
        message: `postTweet: User ${userId} posts tweet ${tweetId} (time=${timestamp})`,
        codeLine: 5,
        action: 'insert',
      });
    } else if (opName === 'getNewsFeed') {
      const userId = op[1];
      if (!following[userId]) {
        following[userId] = new Set([userId]);
      }

      const followees = following[userId];
      // Get all tweets from followees, sorted by time desc, take top 10
      const feed = tweets
        .filter((t) => followees.has(t.userId))
        .sort((a, b) => b.time - a.time)
        .slice(0, 10)
        .map((t) => t.tweetId);

      steps.push({
        state: {
          hashMap: {
            ...getFollowMap(),
            [`feed_user${userId}`]: feed.join(', ') || 'empty',
          },
          chars: operations.map((o) => o.join(',')),
          result: feed,
        },
        highlights: [i],
        message: `getNewsFeed: User ${userId} follows [${Array.from(followees).join(', ')}]. Feed (most recent 10): [${feed.join(', ')}]`,
        codeLine: 8,
        action: 'found',
      });
    } else if (opName === 'follow') {
      const followerId = op[1];
      const followeeId = op[2];

      if (!following[followerId]) {
        following[followerId] = new Set([followerId]);
      }
      following[followerId].add(followeeId);

      steps.push({
        state: {
          hashMap: getFollowMap(),
          chars: operations.map((o) => o.join(',')),
        },
        highlights: [i],
        message: `follow: User ${followerId} now follows user ${followeeId}. Following: [${Array.from(following[followerId]).join(', ')}]`,
        codeLine: 11,
        action: 'insert',
      });
    } else if (opName === 'unfollow') {
      const followerId = op[1];
      const followeeId = op[2];

      if (following[followerId]) {
        following[followerId].delete(followeeId);
      }

      steps.push({
        state: {
          hashMap: getFollowMap(),
          chars: operations.map((o) => o.join(',')),
        },
        highlights: [i],
        message: `unfollow: User ${followerId} unfollows user ${followeeId}. Following: [${following[followerId] ? Array.from(following[followerId]).join(', ') : 'none'}]`,
        codeLine: 14,
        action: 'delete',
      });
    }
  }

  steps.push({
    state: {
      hashMap: getFollowMap(),
      chars: operations.map((o) => o.join(',')),
    },
    highlights: [],
    message: `All operations complete. Total tweets: ${tweets.length}`,
    codeLine: 16,
  });

  return steps;
}

export const designTwitter: Algorithm = {
  id: 'design-twitter',
  name: 'Design Twitter',
  category: 'Heap / Priority Queue',
  difficulty: 'Medium',
  timeComplexity: 'O(k log k)',
  spaceComplexity: 'O(n)',
  pattern: 'Hash Map + Min Heap — merge k sorted tweet lists',
  description:
    'Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and view the 10 most recent tweets in their news feed. The news feed must be ordered from most recent to least recent.',
  problemUrl: 'https://leetcode.com/problems/design-twitter/',
  code: {
    python: `import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.count = 0
        self.tweetMap = defaultdict(list)
        self.followMap = defaultdict(set)

    def postTweet(self, userId, tweetId):
        self.tweetMap[userId].append([self.count, tweetId])
        self.count -= 1

    def getNewsFeed(self, userId):
        res, minHeap = [], []
        self.followMap[userId].add(userId)
        for followeeId in self.followMap[userId]:
            if followeeId in self.tweetMap:
                idx = len(self.tweetMap[followeeId]) - 1
                count, tweetId = self.tweetMap[followeeId][idx]
                heapq.heappush(minHeap,
                    [count, tweetId, followeeId, idx - 1])
        while minHeap and len(res) < 10:
            count, tweetId, followeeId, idx = heapq.heappop(minHeap)
            res.append(tweetId)
            if idx >= 0:
                count, tweetId = self.tweetMap[followeeId][idx]
                heapq.heappush(minHeap,
                    [count, tweetId, followeeId, idx - 1])
        return res

    def follow(self, followerId, followeeId):
        self.followMap[followerId].add(followeeId)

    def unfollow(self, followerId, followeeId):
        if followeeId in self.followMap[followerId]:
            self.followMap[followerId].discard(followeeId)`,
    javascript: `class Twitter {
    constructor() {
        this.count = 0;
        this.tweetMap = new Map();
        this.followMap = new Map();
    }

    postTweet(userId, tweetId) {
        if (!this.tweetMap.has(userId))
            this.tweetMap.set(userId, []);
        this.tweetMap.get(userId).push([this.count--, tweetId]);
    }

    getNewsFeed(userId) {
        const res = [];
        if (!this.followMap.has(userId))
            this.followMap.set(userId, new Set());
        this.followMap.get(userId).add(userId);

        const heap = new MinPriorityQueue({
            priority: (e) => e[0]
        });
        for (const fId of this.followMap.get(userId)) {
            const tweets = this.tweetMap.get(fId);
            if (tweets && tweets.length) {
                const idx = tweets.length - 1;
                heap.enqueue([tweets[idx][0], tweets[idx][1], fId, idx - 1]);
            }
        }
        while (heap.size() && res.length < 10) {
            const [cnt, tId, fId, idx] = heap.dequeue().element;
            res.push(tId);
            if (idx >= 0) {
                const tweets = this.tweetMap.get(fId);
                heap.enqueue([tweets[idx][0], tweets[idx][1], fId, idx - 1]);
            }
        }
        return res;
    }

    follow(followerId, followeeId) {
        if (!this.followMap.has(followerId))
            this.followMap.set(followerId, new Set());
        this.followMap.get(followerId).add(followeeId);
    }

    unfollow(followerId, followeeId) {
        if (this.followMap.has(followerId))
            this.followMap.get(followerId).delete(followeeId);
    }
}`,
    java: `class Twitter {
    private int count;
    private Map<Integer, List<int[]>> tweetMap; // userId -> [[count, tweetId], ...]
    private Map<Integer, Set<Integer>> followMap; // userId -> set of followeeIds

    public Twitter() {
        count = 0;
        tweetMap = new HashMap<>();
        followMap = new HashMap<>();
    }

    public void postTweet(int userId, int tweetId) {
        tweetMap.putIfAbsent(userId, new ArrayList<>());
        tweetMap.get(userId).add(new int[]{count--, tweetId});
    }

    public List<Integer> getNewsFeed(int userId) {
        List<Integer> res = new ArrayList<>();
        followMap.putIfAbsent(userId, new HashSet<>());
        followMap.get(userId).add(userId);

        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        for (int followeeId : followMap.get(userId)) {
            if (tweetMap.containsKey(followeeId)) {
                List<int[]> tweets = tweetMap.get(followeeId);
                int idx = tweets.size() - 1;
                int[] tweet = tweets.get(idx);
                minHeap.offer(new int[]{tweet[0], tweet[1], followeeId, idx - 1});
            }
        }

        while (!minHeap.isEmpty() && res.size() < 10) {
            int[] curr = minHeap.poll();
            res.add(curr[1]);
            if (curr[3] >= 0) {
                int[] tweet = tweetMap.get(curr[2]).get(curr[3]);
                minHeap.offer(new int[]{tweet[0], tweet[1], curr[2], curr[3] - 1});
            }
        }
        return res;
    }

    public void follow(int followerId, int followeeId) {
        followMap.putIfAbsent(followerId, new HashSet<>());
        followMap.get(followerId).add(followeeId);
    }

    public void unfollow(int followerId, int followeeId) {
        if (followMap.containsKey(followerId)) {
            followMap.get(followerId).remove(followeeId);
        }
    }
}`,
  },
  defaultInput: [
    ['postTweet', 1, 5],
    ['getNewsFeed', 1],
    ['follow', 1, 2],
    ['postTweet', 2, 6],
    ['getNewsFeed', 1],
  ],
  run: runDesignTwitter,
  lineExplanations: {
    python: {
      1: 'Import heapq for priority queue operations',
      2: 'Import defaultdict for auto-init collections',
      4: 'Define the Twitter class',
      5: 'Initialize Twitter instance',
      6: 'Decrementing counter for tweet ordering',
      7: 'Map userId to list of [count, tweetId]',
      8: 'Map userId to set of followed userIds',
      10: 'Post a new tweet for user',
      11: 'Append tweet with timestamp to user list',
      12: 'Decrement count so smaller = more recent',
      14: 'Get 10 most recent tweets in feed',
      15: 'Init result list and min-heap',
      16: 'User always sees own tweets',
      17: 'Check each followed user for tweets',
      18: 'Skip followees with no tweets',
      19: 'Get index of most recent tweet',
      20: 'Get count and tweetId of latest tweet',
      21: 'Push latest tweet per followee to heap',
      22: 'Include followee ID and next index',
      23: 'Pop most recent tweets up to 10',
      24: 'Extract tweet details from heap',
      25: 'Add tweet ID to result',
      26: 'If followee has more tweets',
      27: 'Get the next older tweet',
      28: 'Push next tweet from same followee',
      29: 'Include updated index',
      30: 'Return list of tweet IDs',
      32: 'Follow another user',
      33: 'Add followee to follower set',
      35: 'Unfollow a user',
      36: 'Only remove if following exists',
      37: 'Remove followee from set',
    },
    javascript: {
      1: 'Define the Twitter class',
      2: 'Initialize Twitter instance',
      3: 'Decrementing counter for ordering',
      4: 'Map userId to tweet list',
      5: 'Map userId to followed set',
      8: 'Post a new tweet for user',
      9: 'Create tweet list if not exists',
      10: 'Init empty list for new user',
      11: 'Push tweet with decrementing count',
      14: 'Get 10 most recent tweets in feed',
      15: 'Init result list',
      16: 'Create follow set if not exists',
      17: 'Init empty set for new user',
      18: 'User always sees own tweets',
      20: 'Create min priority queue by count',
      21: 'Sort by count (lower = more recent)',
      23: 'Push latest tweet per followee to heap',
      24: 'Get tweet list for followee',
      25: 'Check if followee has tweets',
      26: 'Get most recent tweet index',
      27: 'Push latest tweet info to heap',
      30: 'Pop most recent tweets up to 10',
      31: 'Extract tweet details from heap',
      32: 'Add tweet ID to result',
      33: 'If followee has more tweets',
      34: 'Get the next older tweet',
      35: 'Push next tweet from same followee',
      38: 'Return list of tweet IDs',
      41: 'Follow another user',
      42: 'Create follow set if not exists',
      43: 'Init empty set for new user',
      44: 'Add followee to set',
      47: 'Unfollow a user',
      48: 'Check if follow set exists',
      49: 'Remove followee from set',
    },
    java: {
      1: 'Define the Twitter class',
      2: 'Tweet ordering counter',
      3: 'Map userId to list of [count, tweetId]',
      4: 'Map userId to set of followed userIds',
      6: 'Initialize Twitter instance',
      7: 'Start count at 0',
      8: 'Init tweet storage',
      9: 'Init follow relationships',
      12: 'Post a new tweet for user',
      13: 'Create tweet list if absent',
      14: 'Add tweet with decrementing count',
      17: 'Get 10 most recent tweets in feed',
      18: 'Init result list',
      19: 'Create follow set if absent',
      20: 'User always sees own tweets',
      22: 'Min-heap sorted by tweet count',
      23: 'Push latest tweet per followee',
      24: 'Check if followee has tweets',
      25: 'Get followee tweet list',
      26: 'Get most recent tweet index',
      27: 'Get the latest tweet',
      28: 'Push tweet info with next index',
      32: 'Pop most recent tweets up to 10',
      33: 'Extract current top tweet',
      34: 'Add tweet ID to result',
      35: 'If followee has older tweets',
      36: 'Get next older tweet',
      37: 'Push next tweet from same followee',
      40: 'Return list of tweet IDs',
      43: 'Follow another user',
      44: 'Create follow set if absent',
      45: 'Add followee to set',
      48: 'Unfollow a user',
      49: 'Check if follow relationship exists',
      50: 'Remove followee from set',
    },
  },
};
