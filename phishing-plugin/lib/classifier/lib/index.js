const features = require("./features.js");
const classifierPromise = require("./classifier.js");
var classifier = null;

classifierPromise
  .then(classifierObj => classifier = classifierObj);

/**
 * 
 * @param email object containing body and senders,
 *   body is the email body, and sender is the list of sender emails.
 * @return null if classifier is not yet loaded, otherwise return the
 *   the label of the classification.
 */
function predict(email) {
  if (!classifier) {
    console.log("Classifier not yet loaded!");
    return null;
  }
  if (!Array.isArray(email.sender)) {
    email.sender = [email.sender];
  }
  let {featureVect, featureObj} = features.extract(email);
  return classifier.predict(featureVect);
}

module.exports = {predict};

