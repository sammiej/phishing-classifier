/**
 * Extract features from emails and output the results into attr file.
 */
const features = require("../../classifier/lib/features.js");
const Mbox = require("node-mbox");
const simpleParser = require("mailparser").simpleParser;
const fs = require("fs");
const assert = require("assert");
const {parseEmail} = require("./parse_email.js");

const files = ["../data/phishing.mbox", "../data/ham.mbox"];
const arff = require("arff");

const output = {
  relation: "email-features"
};

let allPromises = [];

let attr = [];
let data = [];

attr.push({name: "containJS", type: "numeric"});
attr.push({name: "numLinks", type: "numeric"});
attr.push({name: "numDomainMisMatch", type: "numeric"});
attr.push({name: "isHtmlEmail", type: "numeric"});
attr.push({name: "numDotsInSender", type: "numeric"});
attr.push({name: "IPAddrInUrl", type: "numeric"});
attr.push({name: "hasKeywordInLinkText", type: "numeric"});
attr.push({name: "numDistinctDomains", type: "numeric"});
attr.push({name: "disparitiesHrefAndLinkText", type: "numeric"});
attr.push({name: "keywordNorm0", type: "numeric"});
attr.push({name: "keywordNorm1", type: "numeric"});
attr.push({name: "keywordNorm2", type: "numeric"});
attr.push({name: "keywordNorm3", type: "numeric"});
attr.push({name: "keywordNorm4", type: "numeric"});
attr.push({name: "keywordNorm5", type: "numeric"});

attr.push({name: "class", type: "enum", values: ["phishing", "non-phishing"]});
output.attributes = attr;

function convertMbox(filename, classLabel, callback) {
  const mbox = new Mbox(filename);

  mbox.on("message", function(msg) {
    allPromises.push(
      parseEmail(msg.toString())
      .then(email => {
        let {featureObj} = features.extract(email);

        featureObj.class = classLabel;
        data.push(featureObj);
        return Promise.resolve();
      })
      .catch(err => {
        console.error(err);
      })
    );
  });

  mbox.on("error", function(err) {
    console.log("Error reading email from mbox");
  });

  mbox.on("end", function() {
    console.log(`Finished reading ${filename}`);
    callback();
  });
}

convertMbox(files[0], "phishing", () => {
  convertMbox(files[1], "non-phishing", () => {
    console.log("Please wait while program is finishing up");
    Promise.all(allPromises)
      .then(() => {
        output.data = data;
        fs.writeFile("../data/data.arff", arff.format(output), function(err) {
          if (err) {
            console.err(err);
          }
          else {
            console.log("Success!");
          }
        });
        console.log("Done");
      })
      .catch(err => {
        console.error(err);
      });
  });
});
