var assert = require('assert');
var features = require('../KeywordFeatures.js');

var emailBody = "This is confirmation request email to update your account's username and password.\n Please click on the link, login and update as soon as possible by verifying your identification.\n If you don't click, our customer/client service representatives will suspend or restrict your account without notifying you!!\n Remember, we are controlling your account' username and password. If you don't want us to suspend your account, provide us with your SSN (social security number) as well.\n To do that, please log in into your account.\n However, you still need to confirm that you authorize us to hold your hands.\n Sorry for any inconvenience, but it will make you more secure in this world. Although it is inconvenient, please provide us with your confirmation!!! We will update your information without sending you any notification.\n Further more, we won't hold your hands anymore, because you don't confirm it.\n\n";

describe('KeywordFeatures Test', function() {

    // Empty string check
    
    it('Should return the string empty check of the input email body string', function () {
            assert.equal(features.KeywordFeatures(emailBody).emptyCheck, false);
        });

    // // Null string check
    
    it('Should return the string NULL check of the input email body string', function () {
            assert.equal(features.KeywordFeatures(emailBody).nullCheck, false);
        });
    
    // Word count
    
    it('Should return the word count for feature (1)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureWordCount[0], 7);
        });
    
    it('Should return the word count for feature (2)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureWordCount[1], 4);
        });
    
    it('Should return the word count for feature (3)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureWordCount[2], 5);
        });
    
    it('Should return the word count for feature (4)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureWordCount[3], 8);
        });
    
    it('Should return the word count for feature (5)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureWordCount[4], 9);
        });
    
    it('Should return the word count for feature (6)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureWordCount[5], 6);
        });
    
    // Normalization
    
    it('Should return the normalization for feature (1)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureNormalization[0], 7/143);
        });
    
    it('Should return the normalization for feature (2)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureNormalization[1], 4/143);
        });
    
    it('Should return the normalization for feature (3)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureNormalization[2], 5/143);
        });
    
    it('Should return the normalization for feature (4)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureNormalization[3], 8/143);
        });
    
    it('Should return the normalization for feature (5)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureNormalization[4], 9/143);
        });
    
    it('Should return the normalization for feature (6)', function () {
            assert.equal(features.KeywordFeatures(emailBody).featureNormalization[5], 6/143);
        });

});



emailBodyEmpty = "";

describe('KeywordFeatures Test - Empty Email String', function() {

    // Empty string check
    
    it('Should return the string empty check of the input email body string', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).emptyCheck, true);
        });
    
    // Null string check
    
    it('Should return the string NULL check of the input email body string', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).nullCheck, false);
        });
    
    // Work count
    
    it('Should return the word count for feature (1)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureWordCount[0], 0);
        });
    
    it('Should return the word count for feature (2)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureWordCount[1], 0);
        });
    
    it('Should return the word count for feature (3)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureWordCount[2], 0);
        });
        
    it('Should return the word count for feature (4)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureWordCount[3], 0);
        });
    
    it('Should return the word count for feature (5)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureWordCount[4], 0);
        });
    
    it('Should return the word count for feature (6)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureWordCount[5], 0);
        });

    // Normalization
    
    it('Should return the normalization for feature (1)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureNormalization[0], 0);
        });
        
    it('Should return the normalization for feature (2)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureNormalization[1], 0);
        });

    it('Should return the normalization for feature (3)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureNormalization[2], 0);
        });

    it('Should return the normalization for feature (4)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureNormalization[3], 0);
        });
        
    it('Should return the normalization for feature (5)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureNormalization[4], 0);
        });

    it('Should return the normalization for feature (6)', function () {
            assert.equal(features.KeywordFeatures(emailBodyEmpty).featureNormalization[5], 0);
        });
});



emailBodyNull = null;

describe('KeywordFeatures Test - Null Email String', function() {

    // Empty string check
    
    it('Should return the string empty check of the input email body string', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).emptyCheck, false);
    });

    // Null string check
    
    it('Should return the string NULL check of the input email body string', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).nullCheck, true);
    });

    // Word count
    
    it('Should return the word count for feature (1)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureWordCount[0], 0);
    });
    
    it('Should return the word count for feature (2)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureWordCount[1], 0);
    });
    
    it('Should return the word count for feature (3)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureWordCount[2], 0);
    });
    
    it('Should return the word count for feature (4)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureWordCount[3], 0);
    });
    
    it('Should return the word count for feature (5)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureWordCount[4], 0);
    });
    
    it('Should return the word count for feature (6)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureWordCount[5], 0);
    });

    // Normalization
    
    it('Should return the normalization for feature (1)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureNormalization[0], 0);
    });
    
    it('Should return the normalization for feature (2)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureNormalization[1], 0);
    });
    
    it('Should return the normalization for feature (3)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureNormalization[2], 0);
    });
    
    it('Should return the normalization for feature (4)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureNormalization[3], 0);
    });
    
    it('Should return the normalization for feature (5)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureNormalization[4], 0);
    });
    
    it('Should return the normalization for feature (6)', function () {
        assert.equal(features.KeywordFeatures(emailBodyNull).featureNormalization[5], 0);
    });

});



