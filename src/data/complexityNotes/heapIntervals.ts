import type { ComplexityNote } from '../complexityTypes';

/**
 * Complexity derivations for the Heap / Priority Queue and Intervals categories.
 *
 * Two arguments carry almost every note in this file:
 *
 *  - Heaps: every push and pop is O(log HEAP SIZE), so the bound is "number of operations x
 *    log(heap size)". The optimisation is usually shrinking the heap, not doing fewer
 *    operations — capping it at k turns O(n log n) into O(n log k), and capping it at the
 *    alphabet (3 letters, 26 letters) makes the log a constant outright. heapify is O(n),
 *    which is strictly better than n individual pushes.
 *  - Intervals: sort, then sweep. The sweep is linear and the sort is O(n log n), so the sort
 *    is the answer. What differs between these problems is the sort KEY, the tiebreak, and
 *    what the sweep has to remember — which is where the space bounds and the traps live.
 */
export const heapIntervalsNotes: Record<string, ComplexityNote> = {
  // ================================================================================
  // HEAP / PRIORITY QUEUE
  // ================================================================================

  'kth-largest-stream:sorted-window': {
    time: [
      'n is the size of the seed array, m the number of later add calls, and k the rank being tracked.',
      'The constructor sorts nums, O(n log n), and then keeps only the last k values.',
      'Each add calls bisect.insort on a list of length k: the binary search is O(log k), but the insert then shifts every element after the slot, which is O(k).',
      'The pop(0) that trims the window shifts everything again, also O(k), so one add is O(k) and m of them cost O(m x k).',
      'O(n log n + m x k).',
    ],
    space: [
      'The window is trimmed to exactly k values and never grows past that.',
      'O(k) persistent, though sorted(nums) does allocate a full O(n) copy for a moment during construction.',
    ],
    gotcha:
      'bisect makes the SEARCH logarithmic, not the insert. A Python list has to move every later element to make room, so insort into a size-k list is O(k). That single fact is why the heap version wins even though both keep only k values.',
  },
  'kth-largest-stream:optimal': {
    time: [
      'n is the size of the seed array, m the number of add calls, and k the rank requested.',
      'add pushes val and pops if the size now exceeds k, so the heap never holds more than k+1 items.',
      'Both heap operations cost O(log heap size), and the heap size is k — not n. That is the entire optimisation: at n = 1,000,000 with k = 10, log n is about 20 while log k is under 4.',
      'm adds therefore cost O(m log k), and seeding the heap under the same push-and-trim rule is O(n log k).',
      'O(n log k) to build, O(log k) per add.',
    ],
    space: [
      'The pop-when-too-big rule caps the heap at k+1 entries; every other value in the stream is discarded as it arrives.',
      'O(k), independent of how many numbers ever pass through.',
    ],
    gotcha:
      'A max-heap of everything also answers the query, but at O(log n) per operation and O(n) space forever. Flipping to a MIN-heap of size k bounds both, and its root is the k-th largest because the k-1 larger values are still sitting above it. One caveat: the Python version here heapifies all of nums and then pops down to k, which is O(n + (n-k) log n) = O(n log n) to construct — the Java push-and-trim loop is the one that actually achieves O(n log k).',
  },

  'last-stone-weight:sorted-list-insertion': {
    time: [
      'n is the number of stones.',
      'The initial sort is O(n log n).',
      'Each round removes two stones from the end, O(1) each, and inserts at most one back, so the list shrinks by at least one per round: at most n rounds.',
      'The insert is what hurts — bisect.insort locates the slot in O(log n) but then shifts the whole tail of the list, O(n).',
      'n rounds x O(n) per insert = O(n squared), which dominates the sort.',
    ],
    space: ['The sorted copy of the stones, one entry per stone.', 'O(n).'],
    gotcha:
      'The binary search inside insort makes each round LOOK logarithmic. Finding the position is cheap; making room for it is not. A heap sifts one root-to-leaf path of length log n instead of moving the tail, and that is the whole gap between O(n squared) and O(n log n) here.',
  },
  'last-stone-weight:optimal': {
    time: [
      'n is the number of stones.',
      'Negating every stone is one O(n) pass, and heapify turns that list into a valid heap in O(n) — not O(n log n).',
      'Each round pops two stones and pushes at most one, so the heap loses at least one stone per round: at most n-1 rounds.',
      'A round is a constant number of heap operations at O(log n) each.',
      'O(n) to build plus O(n log n) of smashing = O(n log n).',
    ],
    space: [
      'The negated copy of the input, heapified in place.',
      'O(n) — or O(1) auxiliary if you are allowed to negate and heapify the array the caller gave you.',
    ],
    gotcha:
      'heapify is O(n), not O(n log n): sifting bottom-up, most nodes are already near the leaves and barely move. It does not change the total here because the smash loop is O(n log n) regardless, but it does matter on problems where BUILDING the heap is the work.',
  },

  'k-closest-points:sort-by-distance': {
    time: [
      'n is the number of points.',
      'One comprehension computes each squared distance: O(n).',
      'Sorting the (distance, point) pairs is O(n log n) and dominates everything else.',
      'Slicing off the first k is O(k), and k is at most n.',
      'O(n log n).',
    ],
    space: ['The dists array holds one (distance, point) pair per input point.', 'O(n).'],
    gotcha:
      'There is no square root anywhere, on purpose. Comparing x squared + y squared orders points identically to comparing true distances, so sqrt would add cost and floating-point error for nothing.',
  },
  'k-closest-points:optimal': {
    time: [
      'n is the number of points and k how many we return.',
      'Computing all n squared distances is O(n), and heapify over that full list is another O(n).',
      'Then k pops, each re-sifting a heap that still holds close to n entries: O(k log n).',
      'O(n + k log n) — near-linear for small k, since the far-away points are never ordered relative to each other.',
    ],
    space: [
      'The heap is built over EVERY point, because nothing is discarded before the popping starts.',
      'O(n).',
    ],
    gotcha:
      'The stated O(n log k) / O(k) describes the other heap shape: push each point and pop whenever the size exceeds k, so the heap stays at k and each operation is O(log k). This code heapifies all n and pops k times, which is O(n + k log n) time and O(n) space. Both are respectable answers — know which one you actually wrote.',
  },

  'kth-largest-element:min-heap-size-k': {
    time: [
      'n is the length of nums, k the rank requested.',
      'One pass over nums: each element is pushed, and if the heap now exceeds k the smallest is popped.',
      'So the heap never holds more than k+1 entries, and each operation is O(log k) rather than O(log n).',
      'n iterations x O(log k) = O(n log k).',
    ],
    space: [
      'Only the k largest values seen so far are retained; everything smaller is popped and forgotten immediately.',
      'O(k).',
    ],
    gotcha:
      'Slower than quickselect on paper but GUARANTEED, with no O(n squared) worst case — and it never needs the array in memory at once, so the same code handles a stream. When k is small log k is nearly a constant; at k = 1 this degenerates into a running maximum.',
  },

  'task-scheduler:greedy-math-formula': {
    time: [
      'Let m be the number of tasks and n the cooldown gap — two different inputs, so name both.',
      'Counting frequencies is one pass over the tasks: O(m).',
      'max over the counts and the tie count each scan the frequency map, which holds at most 26 entries for A-Z, so O(1).',
      'The rest is arithmetic on three numbers.',
      'O(m).',
    ],
    space: [
      'The frequency map has one entry per distinct task letter, capped at 26 by the alphabet.',
      'O(1) — bounded by a constant, not growing with m.',
    ],
    gotcha:
      'The max(len(tasks), slots) is not decoration. When many different letters tie for the top frequency, those tasks fill the idle slots themselves and the schedule is exactly len(tasks) long, so the formula alone would UNDER-count.',
  },
  'task-scheduler:optimal': {
    time: [
      'Let m be the number of tasks and n the cooldown.',
      'The while loop advances time by exactly one per iteration, so the number of iterations is the ANSWER, not m — every idle slot is simulated too.',
      'Idle slots are bounded by (maxFreq - 1) x n, so the loop runs at most m + maxFreq x n times, which is at most m x (n + 1).',
      'Each iteration does a constant number of heap and deque operations on a heap of at most 26 entries: O(log 26) = O(1).',
      'With the cooldown bounded by a constant (n is at most 100 in the constraints), that is O(m) — with a constant factor of up to n + 1.',
    ],
    space: [
      'The max-heap holds one entry per distinct letter and the cooldown queue holds at most the same, so both are capped at 26.',
      'O(1) by the bounded-alphabet argument.',
    ],
    gotcha:
      'Answering "O(m) because we loop over the tasks" misreads the loop — it loops over TIME. Feed it one letter repeated 100 times with a large cooldown and it runs thousands of iterations over an input of 100. The math formula computes the same answer in genuine O(m) with no simulation at all.',
  },

  'design-twitter:collect-and-sort': {
    time: [
      'Let F be the number of accounts a user follows and T the total number of tweets those accounts have ever posted.',
      'postTweet, follow and unfollow are single hash-map or set operations: O(1) each.',
      'getNewsFeed concatenates every tweet from every followed account: O(T) just to gather them.',
      'It then sorts that entire list to find the newest 10: O(T log T), which dominates.',
      'O(T log T) per getNewsFeed.',
    ],
    space: [
      'The feed list is a fresh copy of all T tweets from the followed accounts, rebuilt on every call.',
      'O(T).',
    ],
    gotcha:
      'The work scales with the ENTIRE history of everyone you follow, even though only 10 tweets come back. Following 10 accounts with 10,000 tweets each means sorting 100,000 entries to print 10 of them.',
  },
  'design-twitter:optimal': {
    time: [
      'Let F be the number of accounts the user follows — this is the k in the stated bound. The feed length is fixed at 10.',
      'getNewsFeed seeds the heap with only the single most recent tweet from each followed account: F pushes at O(log F) each.',
      'It then pops at most 10 times, and each pop pushes back the next-older tweet from that same account: a constant number of further O(log F) operations.',
      'O(F log F) per feed — measured in accounts FOLLOWED, not in how many tweets they posted.',
    ],
    space: [
      'The tweet map stores every tweet ever posted, O(n) overall, while each getNewsFeed heap holds at most F entries.',
      'O(n) for the stored tweets, O(F) for the heap.',
    ],
    gotcha:
      'This is a k-way merge of already-sorted lists: each per-user tweet list is in time order by construction, so only the F heads ever need comparing. That is why the total tweet count disappears from the bound while collect-and-sort pays O(T log T) for it.',
  },

  'find-median-data-stream:sorted-list-insertion': {
    time: [
      'n is how many values have been added so far. This is a design problem, so bound each operation separately instead of quoting one overall figure.',
      'addNum calls bisect.insort: O(log n) to find the position, then O(n) to shift every later element along.',
      'findMedian indexes the middle directly, O(1).',
      'O(n) per add, O(1) per findMedian.',
    ],
    space: ['The list retains every value ever added.', 'O(n).'],
    gotcha:
      'The O(log n) binary search is the visible half and the O(n) shift is the hidden one — insertion into a contiguous list is linear no matter how quickly you locate the slot. Two heaps avoid this by never needing a fully ordered array in the first place.',
  },
  'find-median-data-stream:optimal': {
    time: [
      'n is how many values have been added so far, and the two operations have different costs, so bound them separately.',
      'addNum does a fixed number of pushes and pops — one to insert, then at most two more to restore the ordering and size invariants.',
      'Each of those runs on a heap holding about n/2 elements, so O(log n) each, and a constant number of them is still O(log n).',
      'findMedian only reads the two roots and never sifts: O(1).',
      'O(log n) per add, O(1) per findMedian.',
    ],
    space: [
      'The two heaps between them hold every value added, split roughly in half.',
      'O(n).',
    ],
    gotcha:
      'A single sorted list gives O(1) median but O(n) insert; a single heap gives O(log n) insert but cannot reach a middle element. Splitting into a max-heap of the low half and a min-heap of the high half puts the median at the two roots — you only ever need the boundary, never the full ordering.',
  },

  'single-threaded-cpu:sorted-list-scan': {
    time: [
      'n is the number of tasks.',
      'Sorting the (enqueue, processing, index) triples is O(n log n).',
      'The outer while loop appends one task per productive iteration, plus at most n time-jump iterations, so O(n) iterations overall.',
      'Each productive iteration calls min over the available list, which can hold up to n tasks: O(n) per pick.',
      'n picks x O(n) per pick = O(n squared), which dominates the sort.',
    ],
    space: ['The sorted triples plus the available list, each up to n entries.', 'O(n).'],
    gotcha:
      'The inner j-loop that moves newly-enqueued tasks into available is NOT the quadratic part — j only moves forward, so those moves total n across the entire run. It is the min() rescan that costs O(n) every single pick, and replacing exactly that with a heap is the fix.',
  },
  'single-threaded-cpu:optimal': {
    time: [
      'n is the number of tasks.',
      'Sorting by enqueue time is O(n log n).',
      'Each task is pushed into the heap exactly once (j never moves backward) and popped exactly once: 2n heap operations in total.',
      'The heap can hold every enqueued-but-unfinished task, so each of those operations is O(log n).',
      'O(n log n) for the sort plus O(n log n) of heap traffic, and sequential work adds: O(n log n).',
    ],
    space: [
      'The sorted triples are O(n), and the heap reaches n entries if every task becomes available before the first one finishes.',
      'O(n).',
    ],
    gotcha:
      'The while nested inside the while looks quadratic. It is amortised: j advances at most n times in total across every outer iteration, so the pushes are a fixed budget of n rather than n per step.',
  },

  'reorganize-string:even-odd-slot-fill': {
    time: [
      'n is the length of s and k the number of distinct characters, at most 26.',
      'Counter is one pass over the string: O(n).',
      'most_common sorts the k counts, so O(k log k) — over the ALPHABET, not over n.',
      'Filling the result writes each of the n positions exactly once, and the join is another O(n).',
      'O(n + k log k), which with k at most 26 behaves like O(n).',
    ],
    space: [
      'A result list of n characters plus a count map of at most k entries.',
      'O(n), dominated by the result buffer.',
    ],
    gotcha:
      'k log k is kept separate from n rather than folded in because they are genuinely different sizes: string length versus alphabet size. Collapsing the two into "O(n log n)" overstates the cost badly when the alphabet is 26 letters and the string is a million long.',
  },
  'reorganize-string:optimal': {
    time: [
      'n is the length of s and k the number of distinct characters, at most 26.',
      'Counting characters is O(n), and heapify over the k counts is O(k).',
      'Each loop iteration emits two characters, so there are about n/2 iterations.',
      'An iteration does up to two pops and two pushes on a heap of at most k entries: O(log k) each.',
      'O(n log k), and since k is capped at 26 the log is a constant, making this effectively O(n).',
    ],
    space: [
      'The heap holds one entry per distinct character, so at most k of them.',
      'O(k) auxiliary, not counting the result string of length n that we have to return.',
    ],
    gotcha:
      'Popping TWO different characters before pushing either back is what guarantees no adjacency: the most frequent character is out of the heap while its partner is placed, so it cannot be chosen twice in a row. And note the log is over k, the heap size — not over n.',
  },

  'longest-happy-string:three-counter-greedy': {
    time: [
      'n is a + b + c, the total number of letters available.',
      'The loop runs at most n times, once per character emitted, breaking early when no letter is legal.',
      'Inside, it checks exactly three candidate letters against the last two emitted characters: a fixed amount of work, O(1).',
      'O(n).',
    ],
    space: [
      'The counts dict is three entries; res grows to the length of the answer, at most n.',
      'O(n) counting the returned string, O(1) auxiliary.',
    ],
    gotcha:
      'No heap is needed because there are only three letters to compare, and scanning three items is O(1). This matches the heap version asymptotically and beats it on constant factors — a reminder that "use a heap" is about finding the max among MANY, not among three.',
  },
  'longest-happy-string:optimal': {
    time: [
      'n is a + b + c, the total supply of letters, and the answer can be shorter than that.',
      'The heap starts with at most three entries, one per letter, and never grows beyond three.',
      'Every iteration appends at least one character to res, so there are at most n iterations.',
      'Each iteration does a constant number of heap operations on a size-3 heap: O(log 3), which is a constant.',
      'O(n log 3) = O(n).',
    ],
    space: [
      'A three-entry heap plus the result buffer of up to n characters.',
      'O(n) counting the output, O(1) auxiliary.',
    ],
    gotcha:
      'Writing O(n log 3) and leaving it there is the error — log 3 is a number, so the bound is plainly O(n). Keeping the 3 visible is still worth doing out loud, because it shows you know the log is over the HEAP SIZE and that the heap size here is fixed by the alphabet.',
  },

  'car-pooling:min-heap-dropoffs': {
    time: [
      'n is the number of trips.',
      'Sorting the trips by start location is O(n log n).',
      'Each trip is pushed onto the drop-off heap exactly once and popped at most once, so the inner while performs at most n pops over the whole run.',
      '2n heap operations at O(log n) each is O(n log n), the same class as the sort.',
      'O(n log n).',
    ],
    space: ['The heap can hold every trip at once if all of them overlap.', 'O(n).'],
    gotcha:
      'The while inside the for is amortised, not nested: a trip that has been dropped off never re-enters the heap, so the pops total n across the entire loop rather than n per iteration.',
  },
  'car-pooling:optimal': {
    time: [
      'n is the number of trips and M the largest drop-off location.',
      'One pass over the trips records +passengers at each start and -passengers at each end: O(n), with no sorting and no heap at all.',
      'One sweep along the diff array accumulates the running occupancy: O(M).',
      'Sequential passes add rather than multiply: O(n + M).',
    ],
    space: ['The difference array has one slot per location from 0 to M.', 'O(M).'],
    gotcha:
      'M is a VALUE from the input, not a count of elements — so this beats the heap version when locations are dense and small, and would allocate a billion slots for one trip ending at location 1,000,000,000. LeetCode caps stops at 1000, which is why the array is safe here and why some people quote this as O(n) time and O(1) space.',
  },

  'ipo:linear-scan-best-project': {
    time: [
      'n is the number of projects and k the number of picks allowed.',
      'The outer loop runs k times, once per pick.',
      'Each pick scans all n projects to find the most profitable affordable one: O(n).',
      'Nested loops multiply: O(n x k).',
    ],
    space: ['The used flag array, one boolean per project.', 'O(n).'],
    gotcha:
      'The waste is pure repetition: capital only ever grows, so a project affordable last round is still affordable this round, and rediscovering that set from scratch k times is what costs O(n x k). A heap remembers the set instead.',
  },
  'ipo:optimal': {
    time: [
      'n is the number of projects and k the maximum number of picks.',
      'Sorting the (capital, profit) pairs by capital requirement is O(n log n).',
      'Across all k rounds the inner while pushes each project at most once — i never resets — so total pushes are n, at O(log n) each.',
      'The pops cost O(log n) each and the loop breaks once the heap empties, so there are at most min(k, n) of them.',
      'O(n log n) for the sort plus O(n log n) of heap traffic: O(n log n).',
    ],
    space: [
      'The sorted pairs are O(n) and the heap can grow to hold every project.',
      'O(n).',
    ],
    gotcha:
      'The while nested in the for is the amortised shape again: i advances at most n times in TOTAL, so it never multiplies by k. And the greedy is only correct because capital never decreases — anything affordable now stays affordable, so it is safe to bank projects in the heap and pick later.',
  },

  // ================================================================================
  // INTERVALS
  // ================================================================================

  'insert-interval:append-and-merge': {
    time: [
      'n is the number of existing intervals.',
      'Appending newInterval is O(1), but it destroys the sortedness the input arrived with.',
      'Restoring that order costs a full sort: O(n log n).',
      'The merge sweep afterwards is a single pass, O(n), and is dominated.',
      'O(n log n).',
    ],
    space: ['The merged output list, up to n+1 intervals.', 'O(n).'],
    gotcha:
      'This throws away the one gift the problem hands you. The input is ALREADY sorted and non-overlapping, so re-sorting pays O(n log n) for information you were given for free — which is exactly why the three-phase scan manages O(n).',
  },
  'insert-interval:optimal': {
    time: [
      'n is the number of existing intervals, guaranteed sorted and disjoint.',
      'Three while loops run one after another, and all three advance the same index i, which never resets.',
      'So the three loops together perform at most n iterations, not n each.',
      'Every iteration is one comparison plus either an append or a min/max update: O(1).',
      'O(n) — no sort, because the ordering was already there.',
    ],
    space: [
      'The result list holds at most n+1 intervals.',
      'O(n) for the output, O(1) auxiliary beyond it.',
    ],
    gotcha:
      'Three sequential loops read like three passes — and even three genuine passes would be O(3n) = O(n). But they share one index, so this is really a single pass split into phases: everything before the overlap, the overlapping run, everything after.',
  },

  'merge-intervals:sweep-line-events': {
    time: [
      'n is the number of intervals, which become 2n events — one opening and one closing each.',
      'Sorting those 2n events is O(2n log 2n) = O(n log n), and it is the whole cost of the algorithm.',
      'The sweep then walks the events once, keeping a running count of how many intervals are currently open: O(n).',
      'O(n log n).',
    ],
    space: [
      'The events list is twice the size of the input, plus the merged output.',
      'O(n) — the factor of 2 drops out with the constants.',
    ],
    gotcha:
      'The tiebreak matters more here than the bound does. Sorting by (position, -delta) puts openings before closings at the same coordinate, so [1,4] and [4,5] merge into [1,5]. Reverse that ordering and touching intervals wrongly stay separate.',
  },

  'non-overlapping-intervals:sort-by-start-max-end': {
    time: [
      'n is the number of intervals.',
      'Sorting by start time is O(n log n).',
      'One pass then compares each interval against prevEnd, and on a clash keeps min(prevEnd, end): O(n) for the pass.',
      'The sort dominates the sweep, and sequential work adds rather than multiplying.',
      'O(n log n).',
    ],
    space: [
      'Two scalars: the running removal count and prevEnd.',
      'O(1) auxiliary if the sort is in-place — Python .sort() is, sorted() copies, and Timsort itself wants O(n) working space.',
    ],
    gotcha:
      'Sorting by start works, but ONLY because of the min(prevEnd, end) line: on a clash you must discard the interval that ends later, or one long greedy interval blocks everything after it. Delete that min and the answer is wrong on [[1,100],[11,22],[1,11],[2,12]].',
  },
  'non-overlapping-intervals:optimal': {
    time: [
      'n is the number of intervals.',
      'Sorting by END time is O(n log n) — the same sort cost as sorting by start, but a different key, and the key is the whole idea.',
      'The sweep keeps prevEnd and counts every interval that starts before it, with no min() needed: sorting by end already guarantees prevEnd is the earliest available.',
      'O(n log n), one sort dominating one linear pass.',
    ],
    space: [
      'A counter and prevEnd, neither growing with n.',
      'O(1) auxiliary, excluding whatever the sort needs internally.',
    ],
    gotcha:
      'Both orderings are O(n log n), so complexity is NOT why this one is preferred — the correctness argument is simply shorter. It is the classic activity-selection greedy: always keep the interval that frees the timeline soonest.',
  },

  'meeting-rooms:sweep-line-events': {
    time: [
      'n is the number of meetings, which become 2n events.',
      'Sorting the events is O(n log n), the dominant term as in every sweep-line solution.',
      'The scan adds +1 at each start and -1 at each end, bailing the moment the count exceeds 1: O(n) worst case and often far less.',
      'O(n log n).',
    ],
    space: ['The events array holds 2n tuples.', 'O(n).'],
    gotcha:
      'events.sort() with no key sorts by (time, delta), so -1 sorts before +1 and a meeting ending at 10 does not collide with one starting at 10. That happens to be the behaviour you want here — and it is the OPPOSITE of what the merge-intervals sweep needs, so never copy the tiebreak between the two.',
  },
  'meeting-rooms:optimal': {
    time: [
      'n is the number of meetings.',
      'Sorting by start time is O(n log n).',
      'Once sorted, only ADJACENT pairs can conflict, so n-1 comparisons settle it: O(n).',
      'O(n log n), the sort being the only real cost.',
    ],
    space: [
      'Nothing is allocated beyond the loop index.',
      'O(1) auxiliary, assuming an in-place sort.',
    ],
    gotcha:
      'Say out loud why adjacent pairs suffice: if meeting i does not overlap i-1, it cannot overlap anything earlier either, because everything earlier starts earlier and has already been checked. Without the sort you would be comparing all n squared pairs.',
  },

  'meeting-rooms-ii:min-heap-end-times': {
    time: [
      'n is the number of meetings.',
      'Sorting by start time is O(n log n).',
      'Each meeting then does exactly ONE heap operation: heapreplace when the earliest-ending room has freed up, heappush when it has not.',
      'The heap holds one end time per occupied room, at most n, so each operation is O(log n): n x O(log n) = O(n log n).',
      'O(n log n).',
    ],
    space: [
      'The heap holds one end time per room currently in use.',
      'O(n) worst case when every meeting overlaps, but really O(rooms) — the size of the answer.',
    ],
    gotcha:
      'heapreplace is a single sift, not a pop followed by a push, so it does half the work of the two-call version. And the answer is len(heap) at the end because the heap never shrinks below the peak concurrency it reached.',
  },
  'meeting-rooms-ii:optimal': {
    time: [
      'n is the number of meetings.',
      'Two arrays are built and sorted independently, one of start times and one of end times: two O(n log n) sorts, which together are still O(n log n).',
      'Two pointers then walk those arrays, and each iteration advances exactly one of them, so at most 2n iterations of O(1) work.',
      'O(n log n) — identical to the heap version, because both are dominated by sorting.',
    ],
    space: [
      'Two full copies of the boundaries: n starts and n ends.',
      'O(n), and unlike the heap version it is O(n) even when only one room is ever needed.',
    ],
    gotcha:
      'Same time class as the min-heap version, different space profile — the heap holds only rooms in use, while this always allocates 2n. The insight that makes decoupling legal: to count peak concurrency you never need to know WHICH meeting ended, only that one did.',
  },

  'min-interval-query:brute-force-scan': {
    time: [
      'n is the number of intervals and q the number of queries — two independent sizes, so never collapse them into a single n.',
      'The outer loop runs once per query: q iterations.',
      'Each query rescans every interval looking for the smallest one that covers it: O(n).',
      'Nested, so O(n x q).',
    ],
    space: [
      'The result array, one answer per query.',
      'O(q), which is the output — O(1) auxiliary beyond it.',
    ],
    gotcha:
      'Each query rediscovers from scratch which intervals are even relevant. Sorting both intervals and queries lets ONE shared sweep serve all q of them, and that is precisely what removes the multiplication.',
  },
  'min-interval-query:optimal': {
    time: [
      'n is the number of intervals and q the number of queries.',
      'Sorting the intervals is O(n log n); sorting the (index, query) pairs, so answers can be written back in the original order, is O(q log q).',
      'Because queries are processed in increasing order, each interval is pushed at most once across the ENTIRE sweep: n pushes at O(log n) each.',
      'Intervals that no longer reach the current query are popped lazily, and since nothing is ever pushed twice, the total pops are also bounded by n.',
      'O(n log n + q log q) — the two sorts, with the amortised sweep folding into them.',
    ],
    space: [
      'The heap can hold every interval, O(n); the sorted query list and the result array are O(q) each.',
      'O(n + q).',
    ],
    gotcha:
      'q enters through its own sort, not through a multiplication — that is the entire gain over the brute force. And note the lazy deletion: a stale interval sits in the heap until it surfaces at the root, so the heap can be bigger than the set of live intervals. Bound it by total INSERTIONS, not by how many are currently relevant.',
  },

  'meeting-rooms-iii:linear-room-scan': {
    time: [
      'Name both sizes: m is the number of meetings and n the number of rooms.',
      'Sorting the meetings by start time is O(m log m).',
      'Each meeting then scans all n rooms for a free one, or failing that the one freeing up soonest: O(n) per meeting.',
      'That scan contributes m x n, so the total is O(m log m + m x n).',
    ],
    space: [
      'Two arrays of length n: the end time per room and the booking count per room.',
      'O(n).',
    ],
    gotcha:
      'With n capped at 100 this passes, and for tiny n the flat scan even wins on constant factors. It is the m x n term that collapses when rooms are plentiful — swapping the scan for two heaps turns that term into m log n.',
  },
  'meeting-rooms-iii:optimal': {
    time: [
      'm is the number of meetings and n the number of rooms — two different sizes, and both survive into the bound.',
      'Sorting the meetings is O(m log m).',
      'Each meeting moves rooms whose end time has passed from the busy heap back to the free heap. A room can only be freed once per meeting that occupied it, so those moves total O(m) heap operations across the whole run.',
      'Both heaps hold at most n rooms, so every heap operation is O(log n), making the sweep O(m log n).',
      'O(m log m + m log n).',
    ],
    space: [
      'The two heaps together hold exactly n rooms, plus one booking count per room.',
      'O(n).',
    ],
    gotcha:
      'The two sizes never multiply: it is m log m for the sort PLUS m log n for the heap traffic, added. Collapsing to "O(m log m)" hides that a huge room count costs you, and writing "O(m x n)" is the linear-scan bound, not this one.',
  },
};
