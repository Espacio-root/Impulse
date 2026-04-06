// Persistent Segment Tree over userIndex domain 1..MAX_USERS
class PSTNode {
  constructor() {
    this.userState = null; // Contains { username, score, penalty } at leaves
    this.left = null;
    this.right = null;
  }
}

const MIN_INDEX = 1;
const MAX_INDEX = 10000;

function build(l = MIN_INDEX, r = MAX_INDEX) {
  const node = new PSTNode();
  if (l === r) {
    return node;
  }
  const mid = Math.floor((l + r) / 2);
  node.left = build(l, mid);
  node.right = build(mid + 1, r);
  return node;
}

function update(node, l, r, targetIndex, userState) {
  const newNode = new PSTNode();
  if (l === r) {
    newNode.userState = { ...userState }; // clone leaf data
    return newNode;
  }
  
  const mid = Math.floor((l + r) / 2);
  newNode.left = node.left;
  newNode.right = node.right;
  
  if (targetIndex <= mid) {
    newNode.left = update(node.left, l, mid, targetIndex, userState);
  } else {
    newNode.right = update(node.right, mid + 1, r, targetIndex, userState);
  }
  
  return newNode;
}

// Function to traverse the whole tree and collect all valid user states
// Used for the leaderboard construction.
function traverse(node, l = MIN_INDEX, r = MAX_INDEX) {
  if (!node) return [];
  if (l === r) {
    return node.userState ? [node.userState] : [];
  }
  const mid = Math.floor((l + r) / 2);
  let res = [];
  if (node.left) {
    res = res.concat(traverse(node.left, l, mid));
  }
  if (node.right) {
    res = res.concat(traverse(node.right, mid + 1, r));
  }
  return res;
}

module.exports = {
  build,
  update,
  traverse,
  MIN_INDEX,
  MAX_INDEX
};
