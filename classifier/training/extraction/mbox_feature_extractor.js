const features = require("../../classifier/lib/features.js");
const fs = require("fs");
const {parseEmail} = require("./parse_email.js");
const Mbox = require("node-mbox");

let data = [];
let allPromises = [];

function getFeatureVector(filePath, label, callback) {
    const mbox = new Mbox(filePath);

    mbox.on("message", function(msg) {
      allPromises.push(
        parseEmail(msg.toString())
        .then(email => {
          let {featureVect} = features.extract(email);
          featureVect.push(label);
          data.push(featureVect);
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
      console.log(`Finished reading ${filePath}`);
      callback();
    });
}
if (process.argv.length < 4) {
    console.log(`Usage: node ${process.argv[0]} append_email.mbox phishing|non-phishing`);
} else {
    if(process.argv[3] !== "non-phishing" && process.argv[3] !== "phishing") {
        console.error("Classification argument should be phishing|non-phishing");
    } else {
        getFeatureVector(process.argv[2], process.argv[3],function() {
            Promise.all(allPromises)
            .then(() => {
                let dataString = "";
                for (let i = 0; i < data.length; i++) {
                    dataString = dataString.concat(data[i].toString()+"\n");
                }
                fs.appendFile('../data/debug.arff', dataString, function(err) {
                    if (err) throw err;
                    console.log('Features added');
                });
            })
            .catch((err) => {
                console.error(err);
            });
        });
    }
}
