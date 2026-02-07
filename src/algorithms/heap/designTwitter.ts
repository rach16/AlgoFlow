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
};
