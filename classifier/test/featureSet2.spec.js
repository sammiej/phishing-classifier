var assert = require('assert');
var features = require('../lib/features/featureSet2.js');

var emailBody = "This is confirmation request email to update your account's username and password.\n Please click on the link, login and update as soon as possible by verifying your identification.\n If you don't click, our customer/client service representatives will suspend or restrict your account without notifying you!!\n Remember, we are controlling your account' username and password. If you don't want us to suspend your account, provide us with your SSN (social security number) as well.\n To do that, please log in into your account.\n However, you still need to confirm that you authorize us to hold your hands.\n Sorry for any inconvenience, but it will make you more secure in this world. Although it is inconvenient, please provide us with your confirmation!!! We will update your information without sending you any notification.\n Further more, we won't hold your hands anymore, because you don't confirm it.\n\n";

describe('KeywordFeatures Test', function() {
  // Normalization
  
  it('Should return the normalization for feature (1)', function () {
    assert.equal(features.KeywordFeatures(emailBody)[0], 7/143);
  });
  
  it('Should return the normalization for feature (2)', function () {
    assert.equal(features.KeywordFeatures(emailBody)[1], 4/143);
  });
  
  it('Should return the normalization for feature (3)', function () {
    assert.equal(features.KeywordFeatures(emailBody)[2], 5/143);
  });
  
  it('Should return the normalization for feature (4)', function () {
    assert.equal(features.KeywordFeatures(emailBody)[3], 8/143);
  });
  
  it('Should return the normalization for feature (5)', function () {
    assert.equal(features.KeywordFeatures(emailBody)[4], 9/143);
  });
  
  it('Should return the normalization for feature (6)', function () {
    assert.equal(features.KeywordFeatures(emailBody)[5], 6/143);
  });

});
