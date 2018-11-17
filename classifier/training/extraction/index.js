/**
 * Extract features from emails and output the results into attr file.
 */
const features = require("../../lib/features.js");
const Mbox = require("node-mbox");
const simpleParser = require("mailparser").simpleParser;
const fs = require("fs");
const assert = require("assert");

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

/**
 * @param email raw email.
 * @return Promise that resolves to an object containing sender and body of the email.
 */
function parseEmail(rawEmail) {
  return simpleParser(rawEmail)
    .then(parsed => {
      let split = "\n\n";
      let index = rawEmail.indexOf(split);
      assert(index >= 0);      
      let body = rawEmail.substring(index+split.length);
      let sender = [];
      for (let addr of parsed.from.value) {
        if (addr.address) {
          sender.push(addr.address);
        } else {
          if (addr.group &&
              addr.group.length >= 1) {
            for (let gaddr of addr.group) {
              if (gaddr.address) {
                sender.push(gaddr.address);
              }
            }
          }
        }
      }
      return {body, sender};
    })
    .catch(err => {
      let reason = new Error("Error when parsing email");
      reason.stack += `\nCaused By:\n${err.stack}`;
      return reason;
    });
}


function extract(email) {
  let numFeatures = 15;
  let featureObj = {};

  featureObj.containJS = features.parseJS(email.body);
  featureObj.numLinks = features.numOfLinks(email.body);
  featureObj.numDomainMisMatch = features.numOfDomainMisMatch(email.body, email.sender);
  featureObj.isHtmlEmail = features.isHtmlEmail(email.body);
  featureObj.numDotsInSender = features.countDots(email.sender);

  featureObj.IPAddrInUrl = features.urlContainsIP(email.body);
  featureObj.hasKeywordInLinkText = features.keywordPresenceInUrls(email.body);
  featureObj.numDistinctDomains = features.numberOfLinkedToDomain(email.body);
  featureObj.disparitiesHrefAndLinkText = features.disparitiesBetweenHrefLinkText(email.body);

  let normVector = features.keywordNormalizations(email.body);
  for (let i = 0; i < normVector.length; i++) {
    featureObj[`keywordNorm${i}`] = normVector[i];
  }

  //console.log(featureObj);
  // Invariant check
  for (let key in featureObj) {
    if (isNaN(featureObj[key])) {
      // console.log(email);
      //console.log(featureObj);
      //assert(false);
    }
  }
  
  return featureObj;
}

function convertMbox(filename, classLabel, callback) {
  const mbox = new Mbox(filename);
  
  mbox.on("message", function(msg) {
    allPromises.push(
      parseEmail(msg.toString())
      .then(email => {
        let featureObj = extract(email);

        // if (featureObj.numDomainMisMatch > 100) {
        //   console.log("Over 100");
        //   return new Promise((resolve, reject) => {
        //     featureObj.class = classLabel;
        //     data.push(featureObj);
        //     fs.writeFile("ticket2.mbox", msg.toString(), (err) => {
        //       if (err) reject(err);
        //       resolve();
        //     });
        //   });
        // }
        
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

// convertMbox("ticket2.mbox", "phishing", () => {
//   console.log("Wait...");
//   Promise.all(allPromises)
//     .then(() => {
//       console.log("Done");
//     });
// });

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
