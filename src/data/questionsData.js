// Official 25 Examination Questions for TECH HABBA 2.0 - IT QUIZ ROUND 1
// Directly extracted from the official OneDrive document

export const officialQuestions = [
  {
    id: 1,
    questionNumber: 1,
    category: "Algorithms & Complexity",
    question: "What is the time complexity of the following code?",
    code: `for (i = 1; i <= n; i *= 2) {
    for (j = 1; j <= i; j++) {
        count++;
    }
}`,
    options: [
      { key: "A", text: "O(log n)" },
      { key: "B", text: "O(n)" },
      { key: "C", text: "O(n log n)" },
      { key: "D", text: "O(n²)" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "The outer loop runs for values of i = 1, 2, 4, 8, ..., 2^k <= n. The inner loop executes i times for each outer iteration. The total count is the geometric sum: 1 + 2 + 4 + ... + 2^k = 2^(k+1) - 1. Since 2^k <= n, this sum is bounded by 2n - 1, which evaluates to O(n)."
  },
  {
    id: 2,
    questionNumber: 2,
    category: "Data Structures & Databases",
    question: "A B+ tree index has a maximum of 100 children per internal node. If the root is at level 1 and the tree has three levels, what is the maximum number of leaf nodes?",
    code: null,
    options: [
      { key: "A", text: "100" },
      { key: "B", text: "1,000" },
      { key: "C", text: "10,000" },
      { key: "D", text: "1,000,000" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "Level 1 is the root, which can have at most 100 children (internal nodes at level 2). Each of these 100 level-2 internal nodes can have up to 100 children (leaf nodes at level 3). Hence, maximum number of leaf nodes = 100 × 100 = 10,000."
  },
  {
    id: 3,
    questionNumber: 3,
    category: "Database Systems",
    question: "Which concurrency-control protocol guarantees conflict serializability by requiring a transaction to acquire all its locks before it begins execution?",
    code: null,
    options: [
      { key: "A", text: "Basic Two-Phase Locking" },
      { key: "B", text: "Strict Two-Phase Locking" },
      { key: "C", text: "Conservative (Static) Two-Phase Locking" },
      { key: "D", text: "Timestamp Ordering" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "Conservative (or Static) Two-Phase Locking (C2PL) requires each transaction to declare and acquire all its read and write locks before it begins any execution. This protocol guarantees both conflict serializability and freedom from deadlocks."
  },
  {
    id: 4,
    questionNumber: 4,
    category: "Computer Networks",
    question: "A host has IP address 192.168.10.130/26. What is the network address?",
    code: null,
    options: [
      { key: "A", text: "192.168.10.0" },
      { key: "B", text: "192.168.10.64" },
      { key: "C", text: "192.168.10.128" },
      { key: "D", text: "192.168.10.192" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "A /26 prefix gives a subnet mask of 255.255.255.192. The subnet block size is 256 - 192 = 64. The subnets start at .0, .64, .128, and .192. The host address 192.168.10.130 lies between 128 and 191, so the network address is 192.168.10.128."
  },
  {
    id: 5,
    questionNumber: 5,
    category: "Graph Algorithms",
    question: "Which algorithm is suitable for finding shortest paths in a graph containing negative-weight edges but no negative-weight cycles?",
    code: null,
    options: [
      { key: "A", text: "Prim's algorithm" },
      { key: "B", text: "Dijkstra's algorithm" },
      { key: "C", text: "Bellman–Ford algorithm" },
      { key: "D", text: "Kruskal's algorithm" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "Dijkstra's algorithm may fail with negative-weight edges. Prim and Kruskal find Minimum Spanning Trees. The Bellman–Ford algorithm correctly computes single-source shortest paths in graphs with negative weights, provided there are no negative-weight cycles."
  },
  {
    id: 6,
    questionNumber: 6,
    category: "Database Systems & SQL",
    question: "What does the expression NULL = NULL evaluate to in standard SQL?",
    code: null,
    options: [
      { key: "A", text: "TRUE" },
      { key: "B", text: "FALSE" },
      { key: "C", text: "UNKNOWN" },
      { key: "D", text: "Zero" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "In SQL three-valued logic (3VL), NULL represents an unknown value. Any direct equality comparison involving NULL (such as NULL = NULL) evaluates to UNKNOWN, not TRUE or FALSE. The 'IS NULL' predicate must be used instead."
  },
  {
    id: 7,
    questionNumber: 7,
    category: "Database Concurrency",
    question: "Which concurrency anomaly occurs when one transaction overwrites another transaction's update based on a stale read?",
    code: null,
    options: [
      { key: "A", text: "Dirty read" },
      { key: "B", text: "Lost update" },
      { key: "C", text: "Phantom read" },
      { key: "D", text: "Cascading rollback" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "A Lost Update anomaly occurs when two transactions read the same data item and subsequently update it based on the earlier read value. The second transaction overwrites the first transaction's modifications without including them."
  },
  {
    id: 8,
    questionNumber: 8,
    category: "Computer Networks & Protocols",
    question: "Which TCP mechanism prevents a sender from overwhelming the receiver's buffer?",
    code: null,
    options: [
      { key: "A", text: "Congestion window" },
      { key: "B", text: "Receiver-advertised window" },
      { key: "C", text: "Sequence numbering" },
      { key: "D", text: "Slow start threshold" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "TCP Flow Control uses the Receiver-advertised Window (rwnd) carried in TCP headers to inform the sender of how much free buffer space the receiver has available, preventing buffer overflow at the receiving host."
  },
  {
    id: 9,
    questionNumber: 9,
    category: "Computer Networks & IP Addressing",
    question: "How many usable host addresses are available in a conventional IPv4 /27 subnet?",
    code: null,
    options: [
      { key: "A", text: "30" },
      { key: "B", text: "32" },
      { key: "C", text: "62" },
      { key: "D", text: "64" }
    ],
    marks: 1,
    correctAnswer: "A",
    explanation: "In a /27 subnet, the number of host bits is 32 - 27 = 5. Total addresses = 2^5 = 32. Subtracting 2 for the network and broadcast addresses gives 32 - 2 = 30 usable host addresses."
  },
  {
    id: 10,
    questionNumber: 10,
    category: "Network Protocols & Ports",
    question: "What is the default port number for HTTPS?",
    code: null,
    options: [
      { key: "A", text: "21" },
      { key: "B", text: "53" },
      { key: "C", text: "80" },
      { key: "D", text: "443" }
    ],
    marks: 1,
    correctAnswer: "D",
    explanation: "HTTPS (Hypertext Transfer Protocol Secure) defaults to port 443 (TCP). Port 80 is HTTP, port 53 is DNS, and port 21 is FTP."
  },
  {
    id: 11,
    questionNumber: 11,
    category: "Operating Systems & Memory",
    question: "What is the primary purpose of a Translation Lookaside Buffer (TLB)?",
    code: null,
    options: [
      { key: "A", text: "Cache disk blocks" },
      { key: "B", text: "Cache virtual-to-physical address translations" },
      { key: "C", text: "Schedule CPU processes" },
      { key: "D", text: "Detect network congestion" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "A TLB is a high-speed hardware cache located inside the Memory Management Unit (MMU) that stores recent virtual page number to physical frame number translations to speed up virtual memory access."
  },
  {
    id: 12,
    questionNumber: 12,
    category: "Machine Learning & Data Science",
    question: "Which technique reduces dimensionality by finding directions of maximum variance in the data?",
    code: null,
    options: [
      { key: "A", text: "K-means" },
      { key: "B", text: "PCA" },
      { key: "C", text: "Apriori" },
      { key: "D", text: "DBSCAN" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "Principal Component Analysis (PCA) is an unsupervised linear dimensionality reduction technique that identifies orthogonal axes (principal components) along which the variance of the data is maximized."
  },
  {
    id: 13,
    questionNumber: 13,
    category: "Data Structures & Heap",
    question: "What is the time complexity of building a binary heap using bottom-up heap construction?",
    code: null,
    options: [
      { key: "A", text: "O(n)" },
      { key: "B", text: "O(n log n)" },
      { key: "C", text: "O(log n)" },
      { key: "D", text: "O(n²)" }
    ],
    marks: 1,
    correctAnswer: "A",
    explanation: "Bottom-up heap construction (Floyd's algorithm) builds a heap in O(n) linear time because the number of nodes at height h is at most ceil(n / 2^(h+1)), and the sum sum(h / 2^h) converges to a constant."
  },
  {
    id: 14,
    questionNumber: 14,
    category: "Data Structures & Hashing",
    question: "What is the worst-case time complexity of searching in a hash table with separate chaining?",
    code: null,
    options: [
      { key: "A", text: "O(1)" },
      { key: "B", text: "O(log n)" },
      { key: "C", text: "O(n)" },
      { key: "D", text: "O(n log n)" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "In the worst case, all n keys hash to the same bucket, turning that bucket into a singly linked list containing all n elements. Linear search through this list takes O(n) time."
  },
  {
    id: 15,
    questionNumber: 15,
    category: "C Programming & Recursion",
    question: "Consider the following C function:\nWhat is the value returned by the function call fun(5)?",
    code: `int fun(int n) {
    static int x = 0;
    if (n <= 0) return 0;
    x = x + n;
    int res = fun(n - 2);
    return res + x;
}`,
    options: [
      { key: "A", text: "9" },
      { key: "B", text: "27" },
      { key: "C", text: "22" },
      { key: "D", text: "18" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "Because x is static, it persists across calls:\n- fun(5): x becomes 0+5=5. Calls fun(3).\n- fun(3): x becomes 5+3=8. Calls fun(1).\n- fun(1): x becomes 8+1=9. Calls fun(-1).\n- fun(-1): returns 0.\nNow returning back:\n- fun(1) returns res + x = 0 + 9 = 9.\n- fun(3) returns res + x = 9 + 9 = 18.\n- fun(5) returns res + x = 18 + 9 = 27."
  },
  {
    id: 16,
    questionNumber: 16,
    category: "Algorithm Analysis & Recurrences",
    question: "Consider the recurrence relation T(n) = 2T(√n) + log₂(n) for n > 2, with the base case T(2) = 1. Which of the following represents the tightest asymptotic bound for T(n)?",
    code: null,
    options: [
      { key: "A", text: "Theta(n log n)" },
      { key: "B", text: "Theta((log n)²)" },
      { key: "C", text: "Theta(log n × log log n)" },
      { key: "D", text: "Theta(√n × log n)" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "Substitute m = log₂ n (so n = 2^m and √n = 2^(m/2)). The relation becomes T(2^m) = 2T(2^(m/2)) + m. Let S(m) = T(2^m). Then S(m) = 2S(m/2) + m. By the Master Theorem (Case 2, a=2, b=2, f(m)=m^1), S(m) = Θ(m log m). Substituting back m = log n yields Θ(log n × log log n)."
  },
  {
    id: 17,
    questionNumber: 17,
    category: "Database Normalization",
    question: "Consider a relational schema R(A, B, C, D) with the set of functional dependencies F = {AB → C, C → D, D → B}. Which of the following is the highest normal form satisfied by the relation R?",
    code: null,
    options: [
      { key: "A", text: "First Normal Form (1NF)" },
      { key: "B", text: "Boyce-Codd Normal Form (BCNF)" },
      { key: "C", text: "Third Normal Form (3NF)" },
      { key: "D", text: "Second Normal Form (2NF)" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "Candidate keys of R are AB, AC, and AD. Hence, all attributes {A, B, C, D} are prime attributes. For 3NF, in every non-trivial FD X → Y, either X is a superkey OR Y is a prime attribute. Since every attribute in R is prime, all dependencies satisfy 3NF. However, C → D violates BCNF because C is not a superkey. Thus, the highest normal form is 3NF."
  },
  {
    id: 18,
    questionNumber: 18,
    category: "File Organization & B+ Trees",
    question: "In a B+ tree, an internal (non-leaf) node can contain up to p block pointers and p − 1 search key values. Suppose a search key takes 12 bytes, a block pointer takes 8 bytes, a record pointer takes 12 bytes, and the disk block size is 510 bytes with no header overhead. What is the maximum value of the order p for an internal node?",
    code: null,
    options: [
      { key: "A", text: "15" },
      { key: "B", text: "16" },
      { key: "C", text: "25" },
      { key: "D", text: "26" }
    ],
    marks: 1,
    correctAnswer: "D",
    explanation: "An internal node contains p block pointers and (p - 1) search keys (record pointers are only stored at the leaves). Therefore: p × 8 + (p - 1) × 12 <= 510 => 8p + 12p - 12 <= 510 => 20p <= 522 => p <= 26.1. The maximum integer value for p is 26."
  },
  {
    id: 19,
    questionNumber: 19,
    category: "Relational Database Theory",
    question: "Consider a relational schema R(A, B, C, D) with the set of functional dependencies F = {A → B, B → C, C → D}. Which of the following is the candidate key for the relation R?",
    code: null,
    options: [
      { key: "A", text: "A" },
      { key: "B", text: "AB" },
      { key: "C", text: "D" },
      { key: "D", text: "B" }
    ],
    marks: 1,
    correctAnswer: "A",
    explanation: "Computing attribute closures: A+ = {A, B, C, D}. Because A can uniquely determine all attributes in R and no proper subset of A can do so, A is the unique candidate key."
  },
  {
    id: 20,
    questionNumber: 20,
    category: "SQL Aggregation & NULL Handling",
    question: "A relational table Students contains 10 rows in total. In the marks column, 8 rows store valid integer values and 2 rows store NULL. What values will be returned by the SQL aggregate expressions COUNT(*) and COUNT(marks), respectively?",
    code: null,
    options: [
      { key: "A", text: "10 and 10" },
      { key: "B", text: "8 and 10" },
      { key: "C", text: "8 and 8" },
      { key: "D", text: "10 and 8" }
    ],
    marks: 1,
    correctAnswer: "D",
    explanation: "COUNT(*) counts the total number of rows in the table regardless of NULLs (evaluates to 10). COUNT(column_name) ignores NULL values in that specific column and counts only non-null values (evaluates to 8)."
  },
  {
    id: 21,
    questionNumber: 21,
    category: "Computer Networks & Subnetting",
    question: "An organization is allocated an IPv4 subnet with the CIDR notation 192.168.1.0/26. What is the maximum number of usable host IP addresses available in this subnet?",
    code: null,
    options: [
      { key: "A", text: "64" },
      { key: "B", text: "30" },
      { key: "C", text: "126" },
      { key: "D", text: "62" }
    ],
    marks: 1,
    correctAnswer: "D",
    explanation: "With a /26 prefix, 32 - 26 = 6 bits are allocated for hosts. Total address count = 2^6 = 64. Subtracting 2 (network address and broadcast address) gives 64 - 2 = 62 usable host IP addresses."
  },
  {
    id: 22,
    questionNumber: 22,
    category: "Data Link Layer & CSMA/CD",
    question: "A local area network using CSMA/CD operates at a bandwidth of 10 Mbps and has a one-way propagation delay of 20 μs between the two farthest stations. What is the minimum frame size required for guaranteed collision detection?",
    code: null,
    options: [
      { key: "A", text: "200 bits" },
      { key: "B", text: "400 bits" },
      { key: "C", text: "800 bits" },
      { key: "D", text: "50 bits" }
    ],
    marks: 1,
    correctAnswer: "B",
    explanation: "For collision detection in CSMA/CD, the transmission time must be at least twice the propagation delay (Tt >= 2 × Tp). Thus: Minimum Frame Size = 2 × Tp × Bandwidth = 2 × (20 × 10^-6 s) × (10 × 10^6 bps) = 40 × 10 = 400 bits."
  },
  {
    id: 23,
    questionNumber: 23,
    category: "Neural Networks & Perceptrons",
    question: "A single-layer perceptron receives two inputs x1 = 2 and x2 = 3 with corresponding weights w1 = 0.5 and w2 = -1.0, and a bias term b = 1.5. What is the net weighted input z = w1x1 + w2x2 + b before applying the activation function?",
    code: null,
    options: [
      { key: "A", text: "-2.0" },
      { key: "B", text: "-3.5" },
      { key: "C", text: "5.5" },
      { key: "D", text: "-0.5" }
    ],
    marks: 1,
    correctAnswer: "D",
    explanation: "Net weighted input z = (w1 × x1) + (w2 × x2) + b = (0.5 × 2) + (-1.0 × 3) + 1.5 = 1.0 - 3.0 + 1.5 = -0.5."
  },
  {
    id: 24,
    questionNumber: 24,
    category: "Cryptography & Network Security",
    question: "In a communication network of 10 users, every pair of users requires a unique shared secret key to communicate securely using symmetric-key cryptography. How many distinct secret keys are required in total across the network?",
    code: null,
    options: [
      { key: "A", text: "20" },
      { key: "B", text: "90" },
      { key: "C", text: "45" },
      { key: "D", text: "100" }
    ],
    marks: 1,
    correctAnswer: "C",
    explanation: "With n users in a symmetric-key system where every pair shares a distinct key, the total number of keys required is given by the combination formula n × (n - 1) / 2. For n = 10: (10 × 9) / 2 = 45 keys."
  },
  {
    id: 25,
    questionNumber: 25,
    category: "Machine Learning Evaluation Metrics",
    question: "A binary classification model is evaluated on a test set of 100 samples, yielding the following confusion matrix counts: True Positives (TP) = 40, False Positives (FP) = 10, True Negatives (TN) = 30, and False Negatives (FN) = 20. What is the precision of the model?",
    code: null,
    options: [
      { key: "A", text: "0.67" },
      { key: "B", text: "0.57" },
      { key: "C", text: "0.70" },
      { key: "D", text: "0.80" }
    ],
    marks: 1,
    correctAnswer: "D",
    explanation: "Precision measures the proportion of positive identifications that were actually correct: Precision = TP / (TP + FP) = 40 / (40 + 10) = 40 / 50 = 0.80."
  }
];

// Guaranteed sequential question order: 1 to 25 exactly as drafted
export function getExamQuestions(seed = null) {
  // Always return questions in the exact same order (Q1 to Q25)
  return [...officialQuestions];
}

