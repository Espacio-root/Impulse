export const problems = [
  {
    id: "A",
    title: "A+B Problem",
    statement: `Given two integers A and B, calculate their sum.
**Input**
Two integers A and B separated by a space. (-10^9 <= A, B <= 10^9)
**Output**
A single integer, the sum of A and B.

**Example**
Input:
1 2
Output:
3`,
    points: 500
  },
  {
    id: "B",
    title: "Even or Odd",
    statement: `Given an integer N, determine if it is Even or Odd.
**Input**
A single integer N. (-10^9 <= N <= 10^9)
**Output**
Print "Even" if N is even, otherwise print "Odd".

**Example**
Input:
5
Output:
Odd`,
    points: 1000
  },
  {
    id: "C",
    title: "Max Element in Array",
    statement: `Given an array of N integers, find the maximum element.
**Input**
The first line contains an integer N (1 <= N <= 10^5).
The second line contains N integers separated by spaces.
**Output**
A single integer, the maximum element.

**Example**
Input:
4
1 5 2 3
Output:
5`,
    points: 1500
  },
  {
    id: "D",
    title: "Two Sum",
    statement: `Given an array of integers and a target integer, print "YES" if there exist two different elements that sum up to target, otherwise print "NO".
**Input**
The first line contains two integers N and Target. (2 <= N <= 10^4).
The second line contains N integers.
**Output**
"YES" or "NO".

**Example**
Input:
4 9
2 7 11 15
Output:
YES`,
    points: 2000
  },
  {
    id: "E",
    title: "Valid Parentheses",
    statement: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
**Input**
A single string. (length <= 10^4)
**Output**
Print "YES" if valid, otherwise "NO".

**Example**
Input:
()[]{}
Output:
YES`,
    points: 2500
  }
];

export function getProblem(id) {
  return problems.find(p => p.id === id);
}
