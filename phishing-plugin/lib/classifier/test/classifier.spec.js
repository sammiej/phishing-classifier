/**
 * Tests the correctness of the classifier by making predictions on a test set
 * and comparing those predictions with the predictions made by the python script.
 */

const arff = require("arff");
const fs = require("fs");
const classifierPromise = require("../lib/classifier.js");

var dict = null;
new Promise((resolve, reject) => {
  fs.readFile("../../training/data/test_data.arff", "utf8", function(err, content) {
    if (err) {
      reject(err);
      return;
    }
    try {
      resolve(arff.parse(content));
    } catch(e) {
      if (e.code === "ENOENT") {
        console.error("Cannot run test, test data has moved directory");
      }
      reject(e);
    }
  });
})
  .then(dataset => {
    // Process dataset
    let X, y;
    let attrs = dataset["attributes"];
    let features = attrs.slice(0, attrs.length-1);
    let label = attrs[attrs.length-1];
    
    let data = dataset["data"];
    X = new Array(data.length);
    y = new Array(data.length);

    for (let i=0; i<data.length; i++) {
      let vect = new Array(features.length);
      for (let j=0; j<features.length; j++) {
        vect[j] = data[i][features[j].name];
      }
      X[i] = vect;
      y[i] = data[i][label.name];
    }
    dict = {X, y, dataset};
    return classifierPromise;
  })
  .then(classifier => {
    let {X, y, dataset} = dict;
    
    let predictions = new Array(y.length);
    for (let i=0; i<X.length; i++) {
      let featureVect = X[i];
      predictions[i] = classifier.predict(featureVect);
    }
    let match = 0;
    for (let i=0; i<predictions.length; i++) {
      if (y[i] == predictions[i]) {
        match += 1;
      }
    }
    let acc = match / y.length;
    console.log("Matches ", match);
    console.log("Number of Predictions ", predictions.length);
    console.log("Accuracy: ", acc * 100);
  })
  .catch(err => {
    console.error(err);
  });
