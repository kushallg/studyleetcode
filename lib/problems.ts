import type { Problem, Difficulty, Pattern, Source } from "@/types";

// Raw seed: NeetCode 150 + Blind 75 merged. Source field tracks list membership.
// interleave_group is computed programmatically below.
type Raw = {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: Pattern;
  source: Source;
};

const RAW: Raw[] = [
  // Arrays & Hashing
  { id: "contains-duplicate", title: "Contains Duplicate", slug: "contains-duplicate", difficulty: "Easy", pattern: "Arrays & Hashing", source: "both" },
  { id: "valid-anagram", title: "Valid Anagram", slug: "valid-anagram", difficulty: "Easy", pattern: "Arrays & Hashing", source: "both" },
  { id: "two-sum", title: "Two Sum", slug: "two-sum", difficulty: "Easy", pattern: "Arrays & Hashing", source: "both" },
  { id: "group-anagrams", title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", pattern: "Arrays & Hashing", source: "both" },
  { id: "top-k-frequent-elements", title: "Top K Frequent Elements", slug: "top-k-frequent-elements", difficulty: "Medium", pattern: "Arrays & Hashing", source: "both" },
  { id: "encode-and-decode-strings", title: "Encode and Decode Strings", slug: "encode-and-decode-strings", difficulty: "Medium", pattern: "Arrays & Hashing", source: "both" },
  { id: "product-of-array-except-self", title: "Product of Array Except Self", slug: "product-of-array-except-self", difficulty: "Medium", pattern: "Arrays & Hashing", source: "both" },
  { id: "valid-sudoku", title: "Valid Sudoku", slug: "valid-sudoku", difficulty: "Medium", pattern: "Arrays & Hashing", source: "neetcode150" },
  { id: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", difficulty: "Medium", pattern: "Arrays & Hashing", source: "both" },

  // Two Pointers
  { id: "valid-palindrome", title: "Valid Palindrome", slug: "valid-palindrome", difficulty: "Easy", pattern: "Two Pointers", source: "both" },
  { id: "two-sum-ii-input-array-is-sorted", title: "Two Sum II - Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", difficulty: "Medium", pattern: "Two Pointers", source: "neetcode150" },
  { id: "3sum", title: "3Sum", slug: "3sum", difficulty: "Medium", pattern: "Two Pointers", source: "both" },
  { id: "container-with-most-water", title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", pattern: "Two Pointers", source: "both" },
  { id: "trapping-rain-water", title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", pattern: "Two Pointers", source: "both" },

  // Sliding Window
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", slug: "best-time-to-buy-and-sell-stock", difficulty: "Easy", pattern: "Sliding Window", source: "both" },
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", difficulty: "Medium", pattern: "Sliding Window", source: "both" },
  { id: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", difficulty: "Medium", pattern: "Sliding Window", source: "both" },
  { id: "permutation-in-string", title: "Permutation in String", slug: "permutation-in-string", difficulty: "Medium", pattern: "Sliding Window", source: "neetcode150" },
  { id: "minimum-window-substring", title: "Minimum Window Substring", slug: "minimum-window-substring", difficulty: "Hard", pattern: "Sliding Window", source: "both" },
  { id: "sliding-window-maximum", title: "Sliding Window Maximum", slug: "sliding-window-maximum", difficulty: "Hard", pattern: "Sliding Window", source: "both" },

  // Stack
  { id: "valid-parentheses", title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", pattern: "Stack", source: "both" },
  { id: "min-stack", title: "Min Stack", slug: "min-stack", difficulty: "Medium", pattern: "Stack", source: "neetcode150" },
  { id: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", difficulty: "Medium", pattern: "Stack", source: "neetcode150" },
  { id: "generate-parentheses", title: "Generate Parentheses", slug: "generate-parentheses", difficulty: "Medium", pattern: "Stack", source: "neetcode150" },
  { id: "daily-temperatures", title: "Daily Temperatures", slug: "daily-temperatures", difficulty: "Medium", pattern: "Stack", source: "neetcode150" },
  { id: "car-fleet", title: "Car Fleet", slug: "car-fleet", difficulty: "Medium", pattern: "Stack", source: "neetcode150" },
  { id: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", difficulty: "Hard", pattern: "Stack", source: "neetcode150" },

  // Binary Search
  { id: "binary-search", title: "Binary Search", slug: "binary-search", difficulty: "Easy", pattern: "Binary Search", source: "neetcode150" },
  { id: "search-a-2d-matrix", title: "Search a 2D Matrix", slug: "search-a-2d-matrix", difficulty: "Medium", pattern: "Binary Search", source: "neetcode150" },
  { id: "koko-eating-bananas", title: "Koko Eating Bananas", slug: "koko-eating-bananas", difficulty: "Medium", pattern: "Binary Search", source: "neetcode150" },
  { id: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", difficulty: "Medium", pattern: "Binary Search", source: "both" },
  { id: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", slug: "search-in-rotated-sorted-array", difficulty: "Medium", pattern: "Binary Search", source: "both" },
  { id: "time-based-key-value-store", title: "Time Based Key-Value Store", slug: "time-based-key-value-store", difficulty: "Medium", pattern: "Binary Search", source: "neetcode150" },
  { id: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", difficulty: "Hard", pattern: "Binary Search", source: "both" },

  // Linked List
  { id: "reverse-linked-list", title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", pattern: "Linked List", source: "both" },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", pattern: "Linked List", source: "both" },
  { id: "linked-list-cycle", title: "Linked List Cycle", slug: "linked-list-cycle", difficulty: "Easy", pattern: "Linked List", source: "both" },
  { id: "reorder-list", title: "Reorder List", slug: "reorder-list", difficulty: "Medium", pattern: "Linked List", source: "neetcode150" },
  { id: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", difficulty: "Medium", pattern: "Linked List", source: "both" },
  { id: "copy-list-with-random-pointer", title: "Copy List with Random Pointer", slug: "copy-list-with-random-pointer", difficulty: "Medium", pattern: "Linked List", source: "neetcode150" },
  { id: "add-two-numbers", title: "Add Two Numbers", slug: "add-two-numbers", difficulty: "Medium", pattern: "Linked List", source: "neetcode150" },
  { id: "find-the-duplicate-number", title: "Find the Duplicate Number", slug: "find-the-duplicate-number", difficulty: "Medium", pattern: "Linked List", source: "neetcode150" },
  { id: "lru-cache", title: "LRU Cache", slug: "lru-cache", difficulty: "Medium", pattern: "Linked List", source: "both" },
  { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", slug: "merge-k-sorted-lists", difficulty: "Hard", pattern: "Linked List", source: "both" },
  { id: "reverse-nodes-in-k-group", title: "Reverse Nodes in k-Group", slug: "reverse-nodes-in-k-group", difficulty: "Hard", pattern: "Linked List", source: "neetcode150" },

  // Trees
  { id: "invert-binary-tree", title: "Invert Binary Tree", slug: "invert-binary-tree", difficulty: "Easy", pattern: "Trees", source: "both" },
  { id: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", difficulty: "Easy", pattern: "Trees", source: "both" },
  { id: "diameter-of-binary-tree", title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", difficulty: "Easy", pattern: "Trees", source: "neetcode150" },
  { id: "balanced-binary-tree", title: "Balanced Binary Tree", slug: "balanced-binary-tree", difficulty: "Easy", pattern: "Trees", source: "neetcode150" },
  { id: "same-tree", title: "Same Tree", slug: "same-tree", difficulty: "Easy", pattern: "Trees", source: "both" },
  { id: "subtree-of-another-tree", title: "Subtree of Another Tree", slug: "subtree-of-another-tree", difficulty: "Easy", pattern: "Trees", source: "both" },
  { id: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium", pattern: "Trees", source: "both" },
  { id: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", difficulty: "Medium", pattern: "Trees", source: "both" },
  { id: "binary-tree-right-side-view", title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view", difficulty: "Medium", pattern: "Trees", source: "neetcode150" },
  { id: "count-good-nodes-in-binary-tree", title: "Count Good Nodes in Binary Tree", slug: "count-good-nodes-in-binary-tree", difficulty: "Medium", pattern: "Trees", source: "neetcode150" },
  { id: "validate-binary-search-tree", title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", difficulty: "Medium", pattern: "Trees", source: "both" },
  { id: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", difficulty: "Medium", pattern: "Trees", source: "both" },
  { id: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "Medium", pattern: "Trees", source: "both" },
  { id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", difficulty: "Hard", pattern: "Trees", source: "both" },
  { id: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", difficulty: "Hard", pattern: "Trees", source: "both" },

  // Tries
  { id: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", slug: "implement-trie-prefix-tree", difficulty: "Medium", pattern: "Tries", source: "both" },
  { id: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", slug: "design-add-and-search-words-data-structure", difficulty: "Medium", pattern: "Tries", source: "neetcode150" },
  { id: "word-search-ii", title: "Word Search II", slug: "word-search-ii", difficulty: "Hard", pattern: "Tries", source: "both" },

  // Heap / Priority Queue
  { id: "kth-largest-element-in-a-stream", title: "Kth Largest Element in a Stream", slug: "kth-largest-element-in-a-stream", difficulty: "Easy", pattern: "Heap / Priority Queue", source: "neetcode150" },
  { id: "last-stone-weight", title: "Last Stone Weight", slug: "last-stone-weight", difficulty: "Easy", pattern: "Heap / Priority Queue", source: "neetcode150" },
  { id: "k-closest-points-to-origin", title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", difficulty: "Medium", pattern: "Heap / Priority Queue", source: "neetcode150" },
  { id: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", slug: "kth-largest-element-in-an-array", difficulty: "Medium", pattern: "Heap / Priority Queue", source: "neetcode150" },
  { id: "task-scheduler", title: "Task Scheduler", slug: "task-scheduler", difficulty: "Medium", pattern: "Heap / Priority Queue", source: "neetcode150" },
  { id: "design-twitter", title: "Design Twitter", slug: "design-twitter", difficulty: "Medium", pattern: "Heap / Priority Queue", source: "neetcode150" },
  { id: "find-median-from-data-stream", title: "Find Median from Data Stream", slug: "find-median-from-data-stream", difficulty: "Hard", pattern: "Heap / Priority Queue", source: "both" },

  // Backtracking
  { id: "subsets", title: "Subsets", slug: "subsets", difficulty: "Medium", pattern: "Backtracking", source: "neetcode150" },
  { id: "combination-sum", title: "Combination Sum", slug: "combination-sum", difficulty: "Medium", pattern: "Backtracking", source: "both" },
  { id: "permutations", title: "Permutations", slug: "permutations", difficulty: "Medium", pattern: "Backtracking", source: "neetcode150" },
  { id: "subsets-ii", title: "Subsets II", slug: "subsets-ii", difficulty: "Medium", pattern: "Backtracking", source: "neetcode150" },
  { id: "combination-sum-ii", title: "Combination Sum II", slug: "combination-sum-ii", difficulty: "Medium", pattern: "Backtracking", source: "neetcode150" },
  { id: "word-search", title: "Word Search", slug: "word-search", difficulty: "Medium", pattern: "Backtracking", source: "both" },
  { id: "palindrome-partitioning", title: "Palindrome Partitioning", slug: "palindrome-partitioning", difficulty: "Medium", pattern: "Backtracking", source: "neetcode150" },
  { id: "letter-combinations-of-a-phone-number", title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", difficulty: "Medium", pattern: "Backtracking", source: "neetcode150" },
  { id: "n-queens", title: "N-Queens", slug: "n-queens", difficulty: "Hard", pattern: "Backtracking", source: "neetcode150" },

  // Graphs
  { id: "number-of-islands", title: "Number of Islands", slug: "number-of-islands", difficulty: "Medium", pattern: "Graphs", source: "both" },
  { id: "clone-graph", title: "Clone Graph", slug: "clone-graph", difficulty: "Medium", pattern: "Graphs", source: "both" },
  { id: "max-area-of-island", title: "Max Area of Island", slug: "max-area-of-island", difficulty: "Medium", pattern: "Graphs", source: "neetcode150" },
  { id: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", difficulty: "Medium", pattern: "Graphs", source: "both" },
  { id: "surrounded-regions", title: "Surrounded Regions", slug: "surrounded-regions", difficulty: "Medium", pattern: "Graphs", source: "neetcode150" },
  { id: "rotting-oranges", title: "Rotting Oranges", slug: "rotting-oranges", difficulty: "Medium", pattern: "Graphs", source: "neetcode150" },
  { id: "walls-and-gates", title: "Walls and Gates", slug: "walls-and-gates", difficulty: "Medium", pattern: "Graphs", source: "neetcode150" },
  { id: "course-schedule", title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", pattern: "Graphs", source: "both" },
  { id: "course-schedule-ii", title: "Course Schedule II", slug: "course-schedule-ii", difficulty: "Medium", pattern: "Graphs", source: "neetcode150" },
  { id: "redundant-connection", title: "Redundant Connection", slug: "redundant-connection", difficulty: "Medium", pattern: "Graphs", source: "neetcode150" },
  { id: "number-of-connected-components-in-an-undirected-graph", title: "Number of Connected Components in an Undirected Graph", slug: "number-of-connected-components-in-an-undirected-graph", difficulty: "Medium", pattern: "Graphs", source: "both" },
  { id: "graph-valid-tree", title: "Graph Valid Tree", slug: "graph-valid-tree", difficulty: "Medium", pattern: "Graphs", source: "both" },
  { id: "word-ladder", title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", pattern: "Graphs", source: "neetcode150" },

  // Advanced Graphs
  { id: "min-cost-to-connect-all-points", title: "Min Cost to Connect All Points", slug: "min-cost-to-connect-all-points", difficulty: "Medium", pattern: "Advanced Graphs", source: "neetcode150" },
  { id: "network-delay-time", title: "Network Delay Time", slug: "network-delay-time", difficulty: "Medium", pattern: "Advanced Graphs", source: "neetcode150" },
  { id: "cheapest-flights-within-k-stops", title: "Cheapest Flights Within K Stops", slug: "cheapest-flights-within-k-stops", difficulty: "Medium", pattern: "Advanced Graphs", source: "neetcode150" },
  { id: "reconstruct-itinerary", title: "Reconstruct Itinerary", slug: "reconstruct-itinerary", difficulty: "Hard", pattern: "Advanced Graphs", source: "neetcode150" },
  { id: "swim-in-rising-water", title: "Swim in Rising Water", slug: "swim-in-rising-water", difficulty: "Hard", pattern: "Advanced Graphs", source: "neetcode150" },
  { id: "alien-dictionary", title: "Alien Dictionary", slug: "alien-dictionary", difficulty: "Hard", pattern: "Advanced Graphs", source: "both" },

  // 1D Dynamic Programming
  { id: "climbing-stairs", title: "Climbing Stairs", slug: "climbing-stairs", difficulty: "Easy", pattern: "1D Dynamic Programming", source: "both" },
  { id: "min-cost-climbing-stairs", title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs", difficulty: "Easy", pattern: "1D Dynamic Programming", source: "neetcode150" },
  { id: "house-robber", title: "House Robber", slug: "house-robber", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "house-robber-ii", title: "House Robber II", slug: "house-robber-ii", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "longest-palindromic-substring", title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "palindromic-substrings", title: "Palindromic Substrings", slug: "palindromic-substrings", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "decode-ways", title: "Decode Ways", slug: "decode-ways", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "coin-change", title: "Coin Change", slug: "coin-change", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "maximum-product-subarray", title: "Maximum Product Subarray", slug: "maximum-product-subarray", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "word-break", title: "Word Break", slug: "word-break", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "both" },
  { id: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", difficulty: "Medium", pattern: "1D Dynamic Programming", source: "neetcode150" },

  // 2D Dynamic Programming
  { id: "unique-paths", title: "Unique Paths", slug: "unique-paths", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "both" },
  { id: "longest-common-subsequence", title: "Longest Common Subsequence", slug: "longest-common-subsequence", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "both" },
  { id: "best-time-to-buy-and-sell-stock-with-cooldown", title: "Best Time to Buy and Sell Stock with Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "coin-change-ii", title: "Coin Change II", slug: "coin-change-ii", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "target-sum", title: "Target Sum", slug: "target-sum", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "interleaving-string", title: "Interleaving String", slug: "interleaving-string", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "edit-distance", title: "Edit Distance", slug: "edit-distance", difficulty: "Medium", pattern: "2D Dynamic Programming", source: "both" },
  { id: "longest-increasing-path-in-a-matrix", title: "Longest Increasing Path in a Matrix", slug: "longest-increasing-path-in-a-matrix", difficulty: "Hard", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "distinct-subsequences", title: "Distinct Subsequences", slug: "distinct-subsequences", difficulty: "Hard", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "burst-balloons", title: "Burst Balloons", slug: "burst-balloons", difficulty: "Hard", pattern: "2D Dynamic Programming", source: "neetcode150" },
  { id: "regular-expression-matching", title: "Regular Expression Matching", slug: "regular-expression-matching", difficulty: "Hard", pattern: "2D Dynamic Programming", source: "neetcode150" },

  // Greedy
  { id: "maximum-subarray", title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", pattern: "Greedy", source: "both" },
  { id: "jump-game", title: "Jump Game", slug: "jump-game", difficulty: "Medium", pattern: "Greedy", source: "both" },
  { id: "jump-game-ii", title: "Jump Game II", slug: "jump-game-ii", difficulty: "Medium", pattern: "Greedy", source: "neetcode150" },
  { id: "gas-station", title: "Gas Station", slug: "gas-station", difficulty: "Medium", pattern: "Greedy", source: "neetcode150" },
  { id: "hand-of-straights", title: "Hand of Straights", slug: "hand-of-straights", difficulty: "Medium", pattern: "Greedy", source: "neetcode150" },
  { id: "merge-triplets-to-form-target-triplet", title: "Merge Triplets to Form Target Triplet", slug: "merge-triplets-to-form-target-triplet", difficulty: "Medium", pattern: "Greedy", source: "neetcode150" },
  { id: "partition-labels", title: "Partition Labels", slug: "partition-labels", difficulty: "Medium", pattern: "Greedy", source: "neetcode150" },
  { id: "valid-parenthesis-string", title: "Valid Parenthesis String", slug: "valid-parenthesis-string", difficulty: "Medium", pattern: "Greedy", source: "neetcode150" },

  // Intervals
  { id: "meeting-rooms", title: "Meeting Rooms", slug: "meeting-rooms", difficulty: "Easy", pattern: "Intervals", source: "both" },
  { id: "insert-interval", title: "Insert Interval", slug: "insert-interval", difficulty: "Medium", pattern: "Intervals", source: "both" },
  { id: "merge-intervals", title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", pattern: "Intervals", source: "both" },
  { id: "non-overlapping-intervals", title: "Non-overlapping Intervals", slug: "non-overlapping-intervals", difficulty: "Medium", pattern: "Intervals", source: "both" },
  { id: "meeting-rooms-ii", title: "Meeting Rooms II", slug: "meeting-rooms-ii", difficulty: "Medium", pattern: "Intervals", source: "both" },
  { id: "minimum-interval-to-include-each-query", title: "Minimum Interval to Include Each Query", slug: "minimum-interval-to-include-each-query", difficulty: "Hard", pattern: "Intervals", source: "neetcode150" },

  // Math & Geometry
  { id: "happy-number", title: "Happy Number", slug: "happy-number", difficulty: "Easy", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "plus-one", title: "Plus One", slug: "plus-one", difficulty: "Easy", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "rotate-image", title: "Rotate Image", slug: "rotate-image", difficulty: "Medium", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "spiral-matrix", title: "Spiral Matrix", slug: "spiral-matrix", difficulty: "Medium", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "set-matrix-zeroes", title: "Set Matrix Zeroes", slug: "set-matrix-zeroes", difficulty: "Medium", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "powx-n", title: "Pow(x, n)", slug: "powx-n", difficulty: "Medium", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "multiply-strings", title: "Multiply Strings", slug: "multiply-strings", difficulty: "Medium", pattern: "Math & Geometry", source: "neetcode150" },
  { id: "detect-squares", title: "Detect Squares", slug: "detect-squares", difficulty: "Medium", pattern: "Math & Geometry", source: "neetcode150" },

  // Bit Manipulation
  { id: "single-number", title: "Single Number", slug: "single-number", difficulty: "Easy", pattern: "Bit Manipulation", source: "both" },
  { id: "number-of-1-bits", title: "Number of 1 Bits", slug: "number-of-1-bits", difficulty: "Easy", pattern: "Bit Manipulation", source: "both" },
  { id: "counting-bits", title: "Counting Bits", slug: "counting-bits", difficulty: "Easy", pattern: "Bit Manipulation", source: "both" },
  { id: "reverse-bits", title: "Reverse Bits", slug: "reverse-bits", difficulty: "Easy", pattern: "Bit Manipulation", source: "both" },
  { id: "missing-number", title: "Missing Number", slug: "missing-number", difficulty: "Easy", pattern: "Bit Manipulation", source: "both" },
  { id: "sum-of-two-integers", title: "Sum of Two Integers", slug: "sum-of-two-integers", difficulty: "Medium", pattern: "Bit Manipulation", source: "both" },
  { id: "reverse-integer", title: "Reverse Integer", slug: "reverse-integer", difficulty: "Medium", pattern: "Bit Manipulation", source: "neetcode150" },
];

const DIFFICULTY_RANK: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

function buildProblems(): Problem[] {
  const byPattern = new Map<Pattern, Raw[]>();
  for (const r of RAW) {
    const arr = byPattern.get(r.pattern) ?? [];
    arr.push(r);
    byPattern.set(r.pattern, arr);
  }

  const out: Problem[] = [];
  for (const [, list] of byPattern) {
    list.sort((a, b) => {
      const d = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
      if (d !== 0) return d;
      return a.title.localeCompare(b.title);
    });
    list.forEach((r, idx) => {
      out.push({
        id: r.id,
        title: r.title,
        leetcode_url: `https://leetcode.com/problems/${r.slug}/`,
        difficulty: r.difficulty,
        pattern: r.pattern,
        source: r.source,
        interleave_group: (idx % 10) + 1,
      });
    });
  }
  return out;
}

export const PROBLEMS: Problem[] = buildProblems();
