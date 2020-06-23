import Graph from '../graph';

describe('Graph tests', () => {
  describe('hasNode method tests', () => {
    let testGraph;

    beforeEach(() => {
      testGraph = Graph();
    });

    it('returns true when a node exists', () => {
      testGraph.nodes.node = [];

      expect(testGraph.hasNode('node')).toBeTruthy();
    });

    it('returns false when a node does not exist', () => {
      expect(testGraph.hasNode('node')).toBeFalsy();
    });
  });

  describe('addNode method tests', () => {
    let testGraph;

    beforeEach(() => {
      testGraph = Graph();
    });

    it('add a node and sets it value to an empty array', () => {
      testGraph.addNode('first');

      expect(testGraph.nodes.first).toEqual([]);
    });

    it('adds nodes of any type correctly', () => {
      testGraph.addNode('string');
      testGraph.addNode(2);
      testGraph.addNode(true);

      expect(testGraph.nodes.string).toEqual([]);
      expect(testGraph.nodes['2']).toEqual([]);
      expect(testGraph.nodes.true).toEqual([]);
    });

    it('defaults to an empty details objec when details are not provided', () => {
      testGraph.addNode('detail');

      expect(testGraph.details.detail).toEqual({});
    });

    it('sets the details correctly when details are provided', () => {
      testGraph.addNode('detail', { a: 'a', b: 'b' });

      expect(testGraph.details.detail).toEqual({ a: 'a', b: 'b' });
    });

    it('ignores adding node that exist', () => {
      testGraph.addNode('string');

      expect(testGraph.nodes.string).toEqual([]);

      testGraph.nodes.string.push(2, 3, 4, 5);

      testGraph.addNode('string');

      expect(testGraph.nodes.string).toEqual([2, 3, 4, 5]);
    });
  });

  describe('hasEdgeTo method tests', () => {
    let testGraph;

    beforeEach(() => {
      testGraph = Graph();
    });

    it('returns true when an edge exists to another node', () => {
      testGraph.nodes.node1 = ['node2'];
      testGraph.nodes.node2 = [];

      expect(testGraph.hasEdgeTo('node1', 'node2')).toBeTruthy();
    });

    it('return false when an edge exists to another node', () => {
      testGraph.nodes.node1 = [];
      testGraph.nodes.node2 = [];

      expect(testGraph.hasEdgeTo('node1', 'node2')).toBeFalsy();
    });
  });

  describe('addEdge method tests', () => {
    let testGraph;

    beforeEach(() => {
      testGraph = Graph();
    });

    it('adds an edge between nodes correctly & unidirectionally', () => {
      testGraph.nodes.node1 = [];
      testGraph.nodes.node2 = [];

      testGraph.addEdge('node1', 'node2');

      expect(testGraph.nodes.node1).toEqual(['node2']);
      expect(testGraph.nodes.node2).toEqual([]);
    });

    it('does not an an edge to a non-existent node', () => {
      testGraph.nodes.node1 = [];

      testGraph.addEdge('node1', 'node2');

      expect(testGraph.nodes.node1).toEqual([]);
    });

    it('does not re-add edges', () => {
      testGraph.nodes.node1 = [];
      testGraph.nodes.node2 = [];

      testGraph.addEdge('node1', 'node2');

      expect(testGraph.nodes.node1).toEqual(['node2']);
      expect(testGraph.nodes.node2).toEqual([]);

      testGraph.addEdge('node1', 'node2');

      expect(testGraph.nodes.node1).toEqual(['node2']);
      expect(testGraph.nodes.node2).toEqual([]);
    });
  });

  describe('isCircular method tests', () => {
    let testGraph;

    beforeEach(() => {
      testGraph = Graph();
    });

    it('finds circles where nodes reference themselves', () => {
      testGraph.nodes.node1 = ['node1'];

      const circleCheck = testGraph.isCircular();

      expect(circleCheck.isCircular).toBeTruthy();
      expect(circleCheck.node).toEqual('node1');
    });

    it('finds circles one node away', () => {
      testGraph.nodes.node1 = ['node2'];
      testGraph.nodes.node2 = ['node1'];

      const circleCheck = testGraph.isCircular();

      expect(circleCheck.isCircular).toBeTruthy();
      expect(circleCheck.node).toEqual('node1');
    });

    it('finds circles multiple nodes away', () => {
      testGraph.nodes.node1 = ['node2'];
      testGraph.nodes.node2 = ['node3'];
      testGraph.nodes.node3 = ['node4'];
      testGraph.nodes.node4 = ['node1'];

      const circleCheck = testGraph.isCircular();

      expect(circleCheck.isCircular).toBeTruthy();
      expect(circleCheck.node).toEqual('node1');
    });

    it('does not find false positives', () => {
      testGraph.nodes.node1 = ['node2'];
      testGraph.nodes.node2 = [];
      testGraph.nodes.node3 = ['node1'];

      const circleCheck = testGraph.isCircular();

      expect(circleCheck.isCircular).toBeFalsy();
    });
  });
});
