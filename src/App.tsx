import React, { useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

enum NodeColor {
  RED = "red",
  BLACK = "black",
}

class Node {
  value: number;
  color: NodeColor;
  left: Node | null = null;
  right: Node | null = null;
  parent: Node | null = null;

  constructor(value: number, color: NodeColor, parent: Node | null = null) {
    this.value = value;
    this.color = color;
    this.parent = parent;
  }

  isRed() {
    return this.color === NodeColor.RED;
  }
}

class RedBlackTree {
  root: Node | null = null;

  insert(value: number) {
    const newNode = new Node(value, NodeColor.RED);
    if (!this.root) {
      this.root = newNode;
      this.root.color = NodeColor.BLACK;
      return;
    }

    let parent: Node | null = null;
    let current: Node | null = this.root;

    while (current) {
      parent = current;
      current = value < current.value ? current.left : current.right;
    }

    newNode.parent = parent;
    if (!parent) return;

    value < parent.value ? (parent.left = newNode) : (parent.right = newNode);
    this.fixInsert(newNode);
  }

  private fixInsert(node: Node) {
    while (node.parent?.isRed()) {
      const grandparent = node.parent.parent;
      if (!grandparent) break;

      const isLeftChild = node.parent === grandparent.left;
      const uncle = isLeftChild ? grandparent.right : grandparent.left;

      if (uncle?.isRed()) {
        this.recolor(node.parent, uncle, grandparent);
        node = grandparent;
        continue;
      }

      if (this.needsRotation(node, isLeftChild)) {
        node = node.parent;
        isLeftChild ? this.rotateLeft(node) : this.rotateRight(node);
      }

      node.parent!.color = NodeColor.BLACK;
      grandparent.color = NodeColor.RED;
      isLeftChild ? this.rotateRight(grandparent) : this.rotateLeft(grandparent);
    }

    this.root!.color = NodeColor.BLACK;
  }

  private recolor(parent: Node, uncle: Node, grandparent: Node) {
    parent.color = NodeColor.BLACK;
    uncle.color = NodeColor.BLACK;
    grandparent.color = NodeColor.RED;
  }

  private needsRotation(node: Node, isLeftChild: boolean) {
    return isLeftChild ? node === node.parent!.right : node === node.parent!.left;
  }

  private rotateLeft(node: Node) {
    const rightChild = node.right!;
    node.right = rightChild.left;
    if (rightChild.left) rightChild.left.parent = node;

    rightChild.parent = node.parent;
    this.replaceParentChild(node, rightChild);
    rightChild.left = node;
    node.parent = rightChild;
  }

  private rotateRight(node: Node) {
    const leftChild = node.left!;
    node.left = leftChild.right;
    if (leftChild.right) leftChild.right.parent = node;

    leftChild.parent = node.parent;
    this.replaceParentChild(node, leftChild);
    leftChild.right = node;
    node.parent = leftChild;
  }

  private replaceParentChild(oldChild: Node, newChild: Node) {
    if (!oldChild.parent) this.root = newChild;
    else if (oldChild === oldChild.parent.left) oldChild.parent.left = newChild;
    else oldChild.parent.right = newChild;
  }

  getTree(): Node | null {
    return this.root;
  }
}

const TreeNode: React.FC<{ node: Node | null; x: number; y: number; parentX?: number; parentY?: number }> = ({ node, x, y, parentX, parentY }) => {
  if (!node) return null;

  const radius = 20;
  const dx = x - (parentX || 0);
  const dy = y - (parentY || 0);
  const distance = Math.sqrt(dx * dx + dy * dy);

  const offsetX = (dx / distance) * radius;
  const offsetY = (dy / distance) * radius;

  return (
    <>
      {parentX && parentY && (
        <motion.line
          x1={parentX + offsetX}
          y1={parentY + offsetY}
          x2={x - offsetX}
          y2={y - offsetY}
          stroke="black"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={node.color}
        stroke="white"
        strokeWidth="2"
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
      />
      <motion.text
        x={x}
        y={y}
        textAnchor="middle"
        fill="white"
        dy=".3em"
        className="font-bold text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {node.value}
      </motion.text>
      <TreeNode node={node.left} x={x - 50} y={y + 50} parentX={x} parentY={y} />
      <TreeNode node={node.right} x={x + 50} y={y + 50} parentX={x} parentY={y} />
    </>
  );
};

const App: React.FC = () => {
  const [tree, setTree] = useState<RedBlackTree>(new RedBlackTree());
  const [value, setValue] = useState<string>("");

  const onInsert = () => {
    const num = parseInt(value);

    if (isNaN(num)) return alert("Indtast venligst et tal");

    const newTree = Object.create(Object.getPrototypeOf(tree), Object.getOwnPropertyDescriptors(tree));
    newTree.insert(num);
    setTree(newTree);
    setValue("");
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white text-gray-900 p-6">
      <h1 className="text-4xl font-bold mt-6 mb-4 text-blue-600">Red-Black Tree Visualizer</h1>
      <div className="flex gap-4 items-center bg-gray-100 p-4 rounded shadow-lg">
        <input
          type="number"
          className="p-2 text-gray-900 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Indtast tal"
        />
        <button
          onClick={onInsert}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold transition duration-300"
        >
          Indsæt
        </button>
      </div>
      <svg className="mt-10 bg-gray-100 rounded shadow-lg" width="800" height="500">
        <TreeNode node={tree.getTree()} x={400} y={50} />
      </svg>
    </div>
  );
};

export default App;
