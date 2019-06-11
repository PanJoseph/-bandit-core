/*
  eslint no-param-reassign: [
    "error",
    {
      "props": true,
      "ignorePropertyModificationsFor": ["details", "nodes", "stack", "visited"]
    }
  ]
*/
import assign from 'object-assign';
import { flattenDeep } from './utils';

function hasNode(nodes, node) {
  return Object.keys(nodes).indexOf(node) > -1;
}

function addNode(nodes, details, node, detail = {}) {
  if (!hasNode(nodes, node)) {
    nodes[node] = [];
    details[node] = detail;
  }

  return null;
}

function hasEdgeTo(nodes, node1, node2) {
  return nodes[node1].indexOf(node2) > -1;
}

function addEdge(nodes, node1, node2) {
  if (hasNode(nodes, node1) && hasNode(nodes, node2) && !hasEdgeTo(nodes, node1, node2)) {
    nodes[node1].push(node2);
  }

  return null;
}

function isCircularHelper(nodes, node, visited, stack) {
  if (!visited[node]) {
    visited[node] = true;
    stack[node] = true;

    const siblings = nodes[node];

    for (let idx = 0; idx < siblings.length; idx += 1) {
      const currentNode = siblings[idx];

      if (
        (!visited[currentNode] && isCircularHelper(nodes, currentNode, visited, stack)) ||
        stack[currentNode]
      ) {
        return true;
      }
    }
  }

  stack[node] = false;
  return false;
}

function isCircular(nodes) {
  const nodeKeys = Object.keys(nodes);
  const visited = {};
  const stack = {};

  for (let idx = 0; idx < nodeKeys.length; idx += 1) {
    const node = nodeKeys[idx];

    if (isCircularHelper(nodes, node, visited, stack)) return { isCircular: true, node };
  }

  return { isCircular: false };
}

function toMap(nodes, details) {
  const nodeKeys = Object.keys(nodes);

  const nodeMap = nodeKeys.map(node => ({
    details: details[node],
    id: node,
    label: node
  }));

  const edgeMap = flattenDeep(
    nodeKeys.map(node => nodes[node].map(child => ({ from: node, to: child })))
  );

  return { edges: edgeMap, nodes: nodeMap };
}

function Graph() {
  const properties = {
    nodes: {},
    details: {}
  };

  const funcs = {
    hasNode: node => hasNode(properties.nodes, node),
    addNode: (node, details) => addNode(properties.nodes, properties.details, node, details),
    hasEdgeTo: (node1, node2) => hasEdgeTo(properties.nodes, node1, node2),
    addEdge: (node1, node2) => addEdge(properties.nodes, node1, node2),
    isCircular: () => isCircular(properties.nodes),
    toMap: () => toMap(properties.nodes, properties.details)
  };

  return assign({}, properties, funcs);
}

export default Graph;
