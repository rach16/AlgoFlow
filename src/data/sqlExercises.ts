/**
 * SQL for testers, run against a real database.
 *
 * WHY THIS EXISTS. SDET loops ask SQL, and the questions are not the ones a data-engineering
 * screen asks. Half are the classics — NULL semantics, WHERE against HAVING, window functions —
 * and half are the query you actually write after a test run, which is a hunt for a row that
 * should not exist: an order with no payment, a customer charged twice, a refund that predates
 * the payment it belongs to.
 *
 * HOW IT IS BUILT. One schema, twelve questions against it, and every exercise is a pair: the
 * query that looks right beside the query that is right. Both result sets below were produced by
 * executing the SQL against SQLite over the seed data in SQL_TABLES — none of them are written by
 * hand, and the fixture is seeded specifically so the naive query is wrong in a way you can see
 * rather than wrong in principle.
 *
 * That pairing is the entire point. A correct query on its own teaches nothing, because the
 * reason people write the broken one is that it looks completely reasonable.
 */

export type SqlValue = string | number | null;

export interface SqlResult {
  columns: string[];
  rows: SqlValue[][];
}

export interface SqlQuery {
  sql: string;
  result: SqlResult;
}

export interface SqlTable {
  name: string;
  note: string;
  columns: string[];
  rows: SqlValue[][];
}

/** 'classic' is the question an interviewer asks; 'verify' is the query you write after a run. */
export type SqlKind = 'classic' | 'verify';

export interface SqlExercise {
  id: string;
  kind: SqlKind;
  title: string;
  prompt: string;
  /** The query that looks right. */
  naive: SqlQuery;
  correct: SqlQuery;
  /** Why the first one is wrong — the half that matters. */
  whyWrong: string;
  /** What the database is actually doing. */
  mechanism: string;
  /** The sentence you say when asked. */
  say: string;
}

export const SQL_KINDS: { id: SqlKind; label: string; blurb: string }[] = [
  {
    id: 'verify',
    label: 'Verifying a run',
    blurb:
      'The queries a tester writes after the suite is green: hunting for the row that should not exist. This is the half that separates an SDET from somebody who has done a SQL course.',
  },
  {
    id: 'classic',
    label: 'The classics',
    blurb:
      'The questions interviewers actually ask, every one of which has a trap that returns a plausible answer rather than an error. Being wrong here is silent.',
  },
];

/** The fixture, seeded so that every naive query below is wrong in a visible way. */
export const SQL_TABLES: SqlTable[] = [
  {
    name: "users",
    note: "Five customers. One has no country, which is where several of these go wrong.",
    columns: ["id", "email", "country", "created_at"],
    rows: [
      [1, "ada@example.com", "GB", "2024-01-03"],
      [2, "grace@example.com", "US", "2024-01-05"],
      [3, "linus@example.com", null, "2024-01-06"],
      [4, "barbara@example.com", "US", "2024-02-01"],
      [5, "alan@example.com", "GB", "2024-02-11"],
    ],
  },
  {
    name: "orders",
    note: "Nine orders. Most are paid; one is cancelled; two tie for the largest.",
    columns: ["id", "user_id", "status", "total_cents", "created_at"],
    rows: [
      [101, 1, "paid", 5000, "2024-03-01"],
      [102, 2, "paid", 2500, "2024-03-02"],
      [103, 3, "paid", 9900, "2024-03-03"],
      [104, 4, "paid", 4000, "2024-03-04"],
      [105, 3, "paid", 1500, "2024-03-05"],
      [106, 5, "cancelled", 3000, "2024-03-06"],
      [107, 1, "paid", 800, "2024-03-07"],
      [108, 1, "paid", 9900, "2024-03-08"],
      [109, 5, "paid", 2200, "2024-03-09"],
    ],
  },
  {
    name: "payments",
    note: "Eight attempts. One order was captured twice, one capture failed.",
    columns: ["id", "order_id", "amount_cents", "status", "created_at"],
    rows: [
      [9001, 101, 5000, "captured", "2024-03-01T10:00:00"],
      [9002, 102, 2500, "captured", "2024-03-02T10:00:00"],
      [9003, 102, 2500, "captured", "2024-03-02T10:00:04"],
      [9004, 104, 4000, "captured", "2024-03-04T10:00:00"],
      [9005, 105, 1500, "captured", "2024-03-05T10:00:00"],
      [9006, 107, 800, "failed", "2024-03-07T10:00:00"],
      [9007, 108, 9900, "captured", "2024-03-08T10:00:00"],
      [9008, 109, 2200, "captured", "2024-03-09T10:00:00"],
    ],
  },
  {
    name: "refunds",
    note: "Five refunds. One exceeds its payment, two together exceed theirs, one predates the payment it belongs to.",
    columns: ["id", "payment_id", "amount_cents", "created_at"],
    rows: [
      [7001, 9001, 1000, "2024-03-10T09:00:00"],
      [7002, 9004, 4500, "2024-03-11T09:00:00"],
      [7003, 9005, 1500, "2024-03-05T09:59:58"],
      [7004, 9002, 1500, "2024-03-12T09:00:00"],
      [7005, 9002, 1500, "2024-03-13T09:00:00"],
    ],
  },
  {
    name: "blocked_users",
    note: "Two rows, and the second one is NULL. That NULL is the whole exercise.",
    columns: ["user_id"],
    rows: [
      [2],
      [null],
    ],
  },
  {
    name: "job_runs",
    note: "Five runs of one nightly job. Two of them overlap, and one never finished.",
    columns: ["id", "job_name", "started_at", "finished_at", "status"],
    rows: [
      [1, "nightly-reconcile", "2024-03-01T02:00:00", "2024-03-01T02:14:00", "ok"],
      [2, "nightly-reconcile", "2024-03-02T02:00:00", "2024-03-02T02:11:00", "ok"],
      [3, "nightly-reconcile", "2024-03-03T02:00:00", "2024-03-03T02:09:00", "ok"],
      [4, "nightly-reconcile", "2024-03-03T02:05:00", "2024-03-03T02:20:00", "ok"],
      [5, "nightly-reconcile", "2024-03-04T02:00:00", null, "running"],
    ],
  },
];

export const SQL_EXERCISES: SqlExercise[] = [
  {
    id: "orphan-orders",
    kind: "verify",
    title: "The LEFT JOIN you turned into an INNER JOIN",
    prompt: "Find paid orders that were never captured. The suite says checkout works; you want to know whether money actually moved.",
    naive: {
      sql: "SELECT o.id, o.status, p.id AS payment_id\nFROM orders o\nLEFT JOIN payments p ON p.order_id = o.id\nWHERE p.status = 'captured' AND p.id IS NULL;",
      result: {
        columns: [],
        rows: [],
      },
    },
    correct: {
      sql: "SELECT o.id, o.status, o.total_cents\nFROM orders o\nLEFT JOIN payments p\n  ON p.order_id = o.id AND p.status = 'captured'\nWHERE p.id IS NULL;",
      result: {
        columns: ["id", "status", "total_cents"],
        rows: [
          [103, "paid", 9900],
          [106, "cancelled", 3000],
          [107, "paid", 800],
        ],
      },
    },
    whyWrong: "Putting a condition on the right-hand table in WHERE runs after the join, and the unmatched rows the LEFT JOIN produced have NULL in every payments column. p.status = 'captured' is NULL for exactly the rows you were looking for, NULL is not true, and they are filtered out — so the query that hunts for missing payments quietly discards them and returns nothing.",
    mechanism: "A condition on the outer table belongs in ON, not WHERE. In ON it restricts what counts as a match and still keeps the unmatched row; in WHERE it deletes the unmatched row after the fact, which silently demotes your LEFT JOIN to an INNER JOIN.",
    say: "If a LEFT JOIN returns no unmatched rows I check WHERE first, because a predicate on the right-hand table there turns it back into an inner join. The rule I use is that filters on the outer table go in ON and filters on the driving table go in WHERE.",
  },
  {
    id: "not-in-null",
    kind: "classic",
    title: "NOT IN against a column that can be NULL",
    prompt: "List users who are not on the blocked list. A permissions test needs the set of accounts that should still be able to sign in.",
    naive: {
      sql: "SELECT id, email FROM users\nWHERE id NOT IN (SELECT user_id FROM blocked_users);",
      result: {
        columns: [],
        rows: [],
      },
    },
    correct: {
      sql: "SELECT id, email FROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM blocked_users b WHERE b.user_id = u.id);",
      result: {
        columns: ["id", "email"],
        rows: [
          [1, "ada@example.com"],
          [3, "linus@example.com"],
          [4, "barbara@example.com"],
          [5, "alan@example.com"],
        ],
      },
    },
    whyWrong: "id NOT IN (1, NULL) expands to id <> 1 AND id <> NULL. Comparing anything to NULL yields UNKNOWN rather than true, and true AND UNKNOWN is UNKNOWN, so no row can ever satisfy it. One NULL anywhere in the subquery makes NOT IN return the empty set for every input — no error, no warning, just zero rows.",
    mechanism: "IN is fine with NULLs because a single true wins. NOT IN needs every comparison to be true, and a NULL guarantees one of them never is. NOT EXISTS uses row existence rather than three-valued comparison, so it is unaffected.",
    say: "I do not use NOT IN against a subquery unless the column is NOT NULL, because one NULL silently empties the result. NOT EXISTS or a LEFT JOIN with IS NULL both behave, and I would rather write the one that cannot surprise me at 2am.",
  },
  {
    id: "double-charge",
    kind: "verify",
    title: "The customer charged twice",
    prompt: "After a load test against checkout, find any order captured more than once.",
    naive: {
      sql: "SELECT order_id, COUNT(*) AS captures\nFROM payments\nWHERE status = 'captured'\nGROUP BY order_id;",
      result: {
        columns: ["order_id", "captures"],
        rows: [
          [101, 1],
          [102, 2],
          [104, 1],
          [105, 1],
          [108, 1],
          [109, 1],
        ],
      },
    },
    correct: {
      sql: "SELECT order_id, COUNT(*) AS captures, SUM(amount_cents) AS charged\nFROM payments\nWHERE status = 'captured'\nGROUP BY order_id\nHAVING COUNT(*) > 1;",
      result: {
        columns: ["order_id", "captures", "charged"],
        rows: [
          [102, 2, 5000],
        ],
      },
    },
    whyWrong: "Grouping without HAVING gives you every order and its capture count, which is a report rather than an answer. On a real table that is a million rows to eyeball, and the one row that matters is somewhere in the middle of it.",
    mechanism: "HAVING filters groups after aggregation, which is the only place a COUNT can be tested. Adding SUM alongside it turns \"this happened twice\" into \"this cost the customer £50\", which is the version that gets prioritised.",
    say: "Duplicate side effects are the thing I check after any retry or concurrency change, and the query is a GROUP BY with a HAVING COUNT(*) > 1. I include the summed amount, because the bug report lands differently when it names the money.",
  },
  {
    id: "count-nulls",
    kind: "classic",
    title: "COUNT(*) and COUNT(column) are different questions",
    prompt: "How many users are there, and how many have a country recorded?",
    naive: {
      sql: "SELECT COUNT(*) AS users, COUNT(country) AS with_country\nFROM users;",
      result: {
        columns: ["users", "with_country"],
        rows: [
          [5, 4],
        ],
      },
    },
    correct: {
      sql: "SELECT COUNT(*) AS users,\n       COUNT(country) AS with_country,\n       SUM(CASE WHEN country IS NULL THEN 1 ELSE 0 END) AS missing\nFROM users;",
      result: {
        columns: ["users", "with_country", "missing"],
        rows: [
          [5, 4, 1],
        ],
      },
    },
    whyWrong: "Nothing here is wrong, exactly — it is that the two counts are answering different questions and the difference is invisible unless you name it. COUNT(*) counts rows; COUNT(country) counts non-NULL values in that column. A reader who sees 5 and 4 has to infer the missing one.",
    mechanism: "Every aggregate except COUNT(*) skips NULLs — AVG, SUM and MIN all quietly narrow their denominator. Making the gap an explicit column turns an inference into a number you can assert on.",
    say: "I make the NULL count its own column rather than leaving people to subtract, because the whole point of a data check is that the anomaly is stated rather than implied. It is also the difference that catches a broken backfill.",
  },
  {
    id: "reconcile",
    kind: "verify",
    title: "The reconciliation that reconciles nothing",
    prompt: "Confirm that every paid order was captured for exactly its total. This is the query you run after a payments release.",
    naive: {
      sql: "SELECT SUM(o.total_cents) AS ordered, SUM(p.amount_cents) AS captured\nFROM orders o\nJOIN payments p ON p.order_id = o.id AND p.status = 'captured';",
      result: {
        columns: ["ordered", "captured"],
        rows: [
          [27600, 27600],
        ],
      },
    },
    correct: {
      sql: "SELECT o.id,\n       o.total_cents,\n       COALESCE(SUM(p.amount_cents), 0) AS captured\nFROM orders o\nLEFT JOIN payments p\n  ON p.order_id = o.id AND p.status = 'captured'\nWHERE o.status = 'paid'\nGROUP BY o.id, o.total_cents\nHAVING COALESCE(SUM(p.amount_cents), 0) <> o.total_cents;",
      result: {
        columns: ["id", "total_cents", "captured"],
        rows: [
          [102, 2500, 5000],
          [103, 9900, 0],
          [107, 800, 0],
        ],
      },
    },
    whyWrong: "Two failures at once. The inner join drops every order with no payment, so orders that were never captured cannot appear — and those are the worst case. Then summing both sides into single totals lets errors cancel: here one order was captured twice and two were not captured at all, and the grand totals come out equal to the penny. A green check over a broken ledger.",
    mechanism: "Reconciliation has to be per-row and outer-joined. Compare each order against its own captured sum, keep the orders with no payments via LEFT JOIN and COALESCE, and let HAVING surface only the rows that disagree.",
    say: "I never reconcile on grand totals, because overcharges and missing charges cancel out and the sum comes out right while the ledger is wrong. Per-row comparison with an outer join, and the assertion is that the mismatch set is empty.",
  },
  {
    id: "over-refund",
    kind: "verify",
    title: "Refunds that exceed what was captured",
    prompt: "Find payments that have been refunded for more than they took.",
    naive: {
      sql: "SELECT p.id AS payment_id, p.amount_cents, r.amount_cents AS refunded\nFROM payments p\nJOIN refunds r ON r.payment_id = p.id\nWHERE r.amount_cents > p.amount_cents;",
      result: {
        columns: ["payment_id", "amount_cents", "refunded"],
        rows: [
          [9004, 4000, 4500],
        ],
      },
    },
    correct: {
      sql: "SELECT p.id AS payment_id,\n       p.amount_cents,\n       SUM(r.amount_cents) AS refunded\nFROM payments p\nJOIN refunds r ON r.payment_id = p.id\nGROUP BY p.id, p.amount_cents\nHAVING SUM(r.amount_cents) > p.amount_cents;",
      result: {
        columns: ["payment_id", "amount_cents", "refunded"],
        rows: [
          [9002, 2500, 3000],
          [9004, 4000, 4500],
        ],
      },
    },
    whyWrong: "Comparing each refund row against the payment only catches a single refund that is too large on its own. Two partial refunds that are each under the payment but together exceed it pass the test one at a time — and partial refunds are the normal case, so this is the shape the real bug takes.",
    mechanism: "The invariant is about the total refunded per payment, so the comparison has to happen after aggregation: SUM in the select, HAVING to test it against the payment amount.",
    say: "I would ask whether refunds can be partial, because if they can then any row-level check is wrong by construction — the money leaks out in instalments that are each individually valid.",
  },
  {
    id: "refund-before-payment",
    kind: "verify",
    title: "A refund that arrives before its payment",
    prompt: "Find refunds timestamped earlier than the payment they belong to.",
    naive: {
      sql: "SELECT r.id AS refund_id, r.created_at AS refunded_at\nFROM refunds r\nORDER BY r.created_at;",
      result: {
        columns: ["refund_id", "refunded_at"],
        rows: [
          [7003, "2024-03-05T09:59:58"],
          [7001, "2024-03-10T09:00:00"],
          [7002, "2024-03-11T09:00:00"],
          [7004, "2024-03-12T09:00:00"],
          [7005, "2024-03-13T09:00:00"],
        ],
      },
    },
    correct: {
      sql: "SELECT r.id AS refund_id,\n       r.created_at AS refunded_at,\n       p.created_at AS paid_at\nFROM refunds r\nJOIN payments p ON p.id = r.payment_id\nWHERE r.created_at < p.created_at;",
      result: {
        columns: ["refund_id", "refunded_at", "paid_at"],
        rows: [
          [7003, "2024-03-05T09:59:58", "2024-03-05T10:00:00"],
        ],
      },
    },
    whyWrong: "Listing refunds by date shows you the ordering of refunds against each other, which is not the question. The anomaly is relative to a different table, and no amount of sorting one table reveals it.",
    mechanism: "Ordering violations are a join plus a comparison between two timestamps, not an ORDER BY. Once the tables are joined the predicate is trivial — and it catches clock skew between services, out-of-order event replay, and a webhook processed before the request that caused it.",
    say: "This is my favourite example of a case AI will not suggest and most test plans do not contain: not \"does a refund work\" but \"can a refund exist before its payment\". Distributed systems produce it constantly and no single-service test can see it.",
  },
  {
    id: "nth-highest",
    kind: "classic",
    title: "Second highest, when there is a tie",
    prompt: "What is the second-highest order value? Asked in almost every SQL screen, and the fixture has a tie at the top because a real table always does.",
    naive: {
      sql: "SELECT total_cents FROM orders\nORDER BY total_cents DESC\nLIMIT 1 OFFSET 1;",
      result: {
        columns: ["total_cents"],
        rows: [
          [9900],
        ],
      },
    },
    correct: {
      sql: "SELECT DISTINCT total_cents\nFROM (SELECT total_cents,\n             DENSE_RANK() OVER (ORDER BY total_cents DESC) AS rk\n      FROM orders)\nWHERE rk = 2;",
      result: {
        columns: ["total_cents"],
        rows: [
          [5000],
        ],
      },
    },
    whyWrong: "LIMIT 1 OFFSET 1 returns the second row, not the second distinct value. Two orders tie for the largest, so the second row is another copy of the maximum and the query answers 9900 — the same number as the first-highest.",
    mechanism: "DENSE_RANK gives tied rows the same rank and does not skip the next one, so rank 2 is the second distinct value. RANK would skip to 3 after a two-way tie; ROW_NUMBER would reproduce the bug. Which one is right depends on what the question means by \"second\", and asking that out loud is most of the answer.",
    say: "I would ask whether ties should share a place before writing it, then use DENSE_RANK for second distinct value and ROW_NUMBER for second row. Getting LIMIT/OFFSET right on data with no duplicates proves nothing, which is why I would seed a tie in the fixture.",
  },
  {
    id: "dedupe-keep-first",
    kind: "classic",
    title: "Find the duplicates, not the distinct rows",
    prompt: "Identify the surplus payment rows so they can be reversed — keeping the earliest capture per order.",
    naive: {
      sql: "SELECT DISTINCT order_id, amount_cents\nFROM payments WHERE status = 'captured';",
      result: {
        columns: ["order_id", "amount_cents"],
        rows: [
          [101, 5000],
          [102, 2500],
          [104, 4000],
          [105, 1500],
          [108, 9900],
          [109, 2200],
        ],
      },
    },
    correct: {
      sql: "SELECT id, order_id, amount_cents, created_at\nFROM (SELECT *,\n             ROW_NUMBER() OVER (PARTITION BY order_id\n                                ORDER BY created_at) AS rn\n      FROM payments WHERE status = 'captured')\nWHERE rn > 1;",
      result: {
        columns: ["id", "order_id", "amount_cents", "created_at"],
        rows: [
          [9003, 102, 2500, "2024-03-02T10:00:04"],
        ],
      },
    },
    whyWrong: "SELECT DISTINCT collapses the duplicates out of the result, which is the opposite of what a cleanup needs. It hides the problem and gives you no primary key to act on: you cannot delete or reverse a row you have just merged away.",
    mechanism: "ROW_NUMBER partitioned by the duplicate key and ordered by the tiebreaker numbers each group, so rn = 1 is the row you keep and rn > 1 is the row you remove. The ORDER BY inside OVER is what decides which copy survives, and leaving it out makes the query non-deterministic.",
    say: "DISTINCT hides duplicates; ROW_NUMBER lets you act on them. I always include the id and the ordering column in the output, because whoever runs the cleanup needs to see which copy survives before they run a delete.",
  },
  {
    id: "where-vs-having",
    kind: "classic",
    title: "Filtering before the count, not after",
    prompt: "Which users have more than one paid order? You are checking a repeat-customer segment that a marketing job reads, so a wrong answer sends real email.",
    naive: {
      sql: "SELECT user_id, COUNT(*) AS orders\nFROM orders\nGROUP BY user_id\nHAVING COUNT(*) > 1;",
      result: {
        columns: ["user_id", "orders"],
        rows: [
          [1, 3],
          [3, 2],
          [5, 2],
        ],
      },
    },
    correct: {
      sql: "SELECT user_id, COUNT(*) AS paid_orders\nFROM orders\nWHERE status = 'paid'\nGROUP BY user_id\nHAVING COUNT(*) > 1;",
      result: {
        columns: ["user_id", "paid_orders"],
        rows: [
          [1, 3],
          [3, 2],
        ],
      },
    },
    whyWrong: "Counting first and never filtering by status answers a different question: users with more than one order of any kind. User 5 has one paid order and one cancelled one, and gets counted as a repeat customer on the strength of an order that never completed.",
    mechanism: "WHERE runs before grouping and decides which rows enter each group; HAVING runs after and decides which groups survive. A row-level condition in HAVING either errors or silently picks an arbitrary row, and a group-level condition in WHERE cannot be expressed at all — the ordering is the whole distinction.",
    say: "WHERE narrows the rows going into the aggregate, HAVING narrows the groups coming out. If the filter is about a single row it goes in WHERE, and getting that backwards changes the answer rather than breaking the query, which is why it survives review.",
  },
  {
    id: "overlapping-runs",
    kind: "verify",
    title: "The nightly job that ran twice at once",
    prompt: "The reconcile job double-posted one night. Find any two runs of the same job that overlapped.",
    naive: {
      sql: "SELECT job_name, COUNT(*) AS runs\nFROM job_runs\nGROUP BY job_name;",
      result: {
        columns: ["job_name", "runs"],
        rows: [
          ["nightly-reconcile", 5],
        ],
      },
    },
    correct: {
      sql: "SELECT a.id AS run_a, b.id AS run_b,\n       a.started_at AS a_started, a.finished_at AS a_finished,\n       b.started_at AS b_started\nFROM job_runs a\nJOIN job_runs b\n  ON b.job_name = a.job_name\n AND b.id > a.id\n AND b.started_at < COALESCE(a.finished_at, '9999')\nORDER BY a.id;",
      result: {
        columns: ["run_a", "run_b", "a_started", "a_finished", "b_started"],
        rows: [
          [3, 4, "2024-03-03T02:00:00", "2024-03-03T02:09:00", "2024-03-03T02:05:00"],
        ],
      },
    },
    whyWrong: "Counting runs per job tells you the job ran five times, which you already knew. The failure is not how many times it ran — it is that two runs were alive at the same moment, and a count over the whole table cannot express a relationship between two rows.",
    mechanism: "Overlap is a self-join: the same table twice, matched on the job, with b.id > a.id to consider each pair once, and a predicate saying b started before a finished. COALESCE on finished_at matters because the run that never finished is still running and overlaps everything after it.",
    say: "Anything about two rows relating to each other is a self-join, and overlapping intervals is the standard one. The detail people miss is the unfinished run — a NULL end time has to be treated as still open, or the job that hung is the one case you never detect.",
  },
  {
    id: "avg-lies",
    kind: "classic",
    title: "The average over the wrong population",
    prompt: "What is the average order value? It goes on a dashboard, which means nobody will ever question it once it renders.",
    naive: {
      sql: "SELECT AVG(total_cents) AS avg_order FROM orders;",
      result: {
        columns: ["avg_order"],
        rows: [
          [4311.111111111111],
        ],
      },
    },
    correct: {
      sql: "SELECT COUNT(*) AS n,\n       AVG(total_cents) AS mean,\n       MIN(total_cents) AS min,\n       MAX(total_cents) AS max\nFROM orders\nWHERE status = 'paid';",
      result: {
        columns: ["n", "mean", "min", "max"],
        rows: [
          [8, 4475.0, 800, 9900],
        ],
      },
    },
    whyWrong: "Averaging every row includes the cancelled order, which is not an order value anybody wants in that number. The query is not broken and returns no error — it answers a slightly different question than the one that was asked, and the answer looks entirely reasonable, which is why it ships.",
    mechanism: "Every aggregate has a population, and the population is the thing to argue about rather than the function. Reporting the count, min and max beside the mean makes the population visible and shows the spread that a single mean flattens.",
    say: "I would ask which orders count before writing an AVG, because the denominator is the actual question. I also return n, min and max next to it — a mean on its own hides both the population and the outliers, and someone will paste it into a slide.",
  },
];

