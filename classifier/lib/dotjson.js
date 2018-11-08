/**
 * This file provides an EnsembleClassifier interface,
 * and a way to construct Decision Trees from a json
 * file to be used as an ensemble classifier.
 */

const fs = require("fs");

var filename = __dirname + "/out.json";

var ensemble = null;

class EnsembleClassifier {
  /**
   * ensemble: all the individual classifiers in the ensemble, each individual
   *   learner must have a predict function. Should be a list of classifiers.
   */
  constructor(ensemble) {
    this.ensemble = ensemble;
  }

  /**
   * Make a classification prediction based on a feature vector.
   *
   * @param featureVector the vector of features, should have the same
   *   dimensionality as the feature vector used for training.
   */
  predict(featureVector) {
    let classes = {};
    for (let classifier of this.ensemble) {
      // Prediction label
      let label = classifier.predict(featureVector);
      if (!classes[label]) {
        classes[label] = 1;
      }
      else {
        classes[label] += 1;
      }
    }
    let max = 0;
    let bestLabel = null;
    for (let label in classes) {
      if (classes[label] > max) {
        max = classes[label];
        bestLabel = label;
      }
    }
    return bestLabel;
  }
}

class DecisionNode {
  constructor() {
    this.label = null;
  }
  
  setLeftChild(node) {
    this.left = node;
  }
  
  setRightChild(node) {
    this.right = node;
  }

  /**
   * Set the condition that this node uses to make a decision. If the
   * condition is set then this node should not be a leaf node, which
   * means that it should not have its label set.
   */
  setCondition(cond) {
    let arr = cond.split(" ");
    this.relation = arr[1];
    let match = /\[(.*)\]/g.exec(arr[0]);
    this.featureIndex = parseInt(match[1]);
    this.splitVal = parseFloat(arr[2]);
  }

  /**
   * Set the class label if this node, if the class label is set then
   * the node is a leaf node, and it should have no conditions set.
   */
  setLabel(classLabel) {
    this.label = classLabel;
  }

  getLabel() {
    return this.label;
  }

  /**
   * @return true if this node is a leaf node, false otherwise.
   */
  isLeaf() {
    return this.label != null;
  }
  
  /**
   * Make a decision based on the feature vector.
   * 
   * @return a node based on the decision obtained using the
   *   feature vector, or null if an error occurred. The node
   *   returned will be itself if the node is a leaf node.
   */
  makeDecision(featureVector) {
    if (this.isLeaf()) {
      return this;
    }
    // If condition is evaluated to true we go to left child
    // If condition is evaluated to false we go to right child    
    switch(this.relation) {
    case "<=":
    case "=<":
      if (featureVector[this.featureIndex] <= this.splitVal) {
        return this.left;
      }
      return this.right;
    case ">=":
    case "=>":
      if (featureVector[this.featureIndex] >= this.splitVal) {
        return this.left;
      }
      return this.right;
    }
    console.error("Bad decision node! Messed up relation operator!");
    return null;
  }

  toString(){
    return `X[${this.featureIndex}] ${this.relation} ${this.splitVal}`;
  }
};

class DecisionTree {
  // Precondition: Root node has id string 0.
  constructor(jgraph) {
    let nodes = jgraph["nodes"];
    let edges = jgraph["edges"];
    // Load all nodes
    let nodeMap = {};
    for (let node of nodes) {
      let nn = new DecisionNode();
      nn.id = node.id;
      if (node.condition) {
        nn.setCondition(node.condition);
      }
      else if (node.class) {
        nn.setLabel(node.class);
      }
      else {
        console.error("Bad tree node!");
      }
      nodeMap[nn.id] = nn;
    }
    // Load all edges
    for (let edge of edges) {
      let src = edge.source;
      let target = edge.target;
      if (edge.direction == "left") {
        nodeMap[src].setLeftChild(nodeMap[target]);
      }
      else {
        nodeMap[src].setRightChild(nodeMap[target]);
      }
    }
    this.root = nodeMap["0"];
  }

  /**
   * Make a classification prediction based on the featureVector.
   *
   * @param featureVector feature vector used for making the decision.
   * @return a classification label, predicted by this decision tree.
   */
  predict(featureVector) {
    let node = this.root;
    while (!node.isLeaf()) {
      node = node.makeDecision(featureVector);
    }
    return node.getLabel();
  }
};

/**
 * Construct the forest of decision tree from a json file that contains a
 * json array of json graph objects.
 */
function processJsonGraph(data) {
  try {
    let forest = [];
    let jgraphs = JSON.parse(data.toString());
    console.log("Number of trees: " + jgraphs.length);
    for (let jgraph of jgraphs) {
      let tree = new DecisionTree(jgraph);
      forest.push(tree);
    }
    ensemble= new EnsembleClassifier(forest);
    onReady();
  }
  catch(e) {
    console.error(e);
  }
}

function onReady() {
  let label = ensemble.predict([5.9, 2.9, 1.0, 0.5]);
  console.log("Predicted: " + label);
}

fs.readFile(filename, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  processJsonGraph(data);
});
