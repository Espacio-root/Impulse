export const problems = [
  {
    id: "A",
    title: "A+B Problem",
    difficulty: "Easy",
    statement: `Given two integers A and B, calculate their sum.

**Input**
Two integers A and B separated by a space. (-10^9 <= A, B <= 10^9)

**Output**
A single integer, the sum of A and B.

**Example 1**
Input:
1 2
Output:
3

**Example 2**
Input:
-5 10
Output:
5`,
    samples: [
      { input: "1 2\n", expectedOutput: "3" },
      { input: "-5 10\n", expectedOutput: "5" }
    ],
    points: 500
  },
  {
    id: "B",
    title: "Even or Odd",
    difficulty: "Easy",
    statement: `Given an integer N, determine if it is Even or Odd.

**Input**
A single integer N. (-10^9 <= N <= 10^9)

**Output**
Print "Even" if N is even, otherwise print "Odd".

**Example 1**
Input:
5
Output:
Odd

**Example 2**
Input:
4
Output:
Even`,
    samples: [
      { input: "5\n", expectedOutput: "Odd" },
      { input: "4\n", expectedOutput: "Even" }
    ],
    points: 1000
  },
  {
    id: "C",
    title: "Max Element in Array",
    difficulty: "Easy",
    statement: `Given an array of N integers, find the maximum element.

**Input**
The first line contains an integer N (1 <= N <= 10^5).
The second line contains N integers separated by spaces.

**Output**
A single integer, the maximum element.

**Example 1**
Input:
4
1 5 2 3
Output:
5

**Example 2**
Input:
3
-1 -5 -2
Output:
-1`,
    samples: [
      { input: "4\n1 5 2 3\n", expectedOutput: "5" },
      { input: "3\n-1 -5 -2\n", expectedOutput: "-1" }
    ],
    points: 1500
  },
  {
    id: "D",
    title: "Two Sum",
    difficulty: "Medium",
    statement: `Given an array of integers and a target integer, print "YES" if there exist two different elements that sum up to target, otherwise print "NO".

**Input**
The first line contains two integers N and Target. (2 <= N <= 10^4).
The second line contains N integers.

**Output**
"YES" or "NO".

**Example 1**
Input:
4 9
2 7 11 15
Output:
YES

**Example 2**
Input:
3 100
1 2 3
Output:
NO`,
    samples: [
      { input: "4 9\n2 7 11 15\n", expectedOutput: "YES" },
      { input: "3 100\n1 2 3\n", expectedOutput: "NO" }
    ],
    points: 2000
  },
  {
    id: "E",
    title: "Valid Parentheses",
    difficulty: "Medium",
    statement: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.

**Input**
A single string. (length <= 10^4)

**Output**
Print "YES" if valid, otherwise "NO".

**Example 1**
Input:
()[]{}
Output:
YES

**Example 2**
Input:
(]
Output:
NO`,
    samples: [
      { input: "()[]{}\n", expectedOutput: "YES" },
      { input: "(]\n", expectedOutput: "NO" }
    ],
    points: 2500
  }
];

export function getProblem(id) {
  return problems.find(p => p.id === id);
}
