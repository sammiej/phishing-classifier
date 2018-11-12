var exports = module.exports = {};


/*
 * Calculate the word count and normalisation of the features
 *   of six sets of keywords.
 *
 * Params: Email body (type: string)
 * Returns: Normalisations of six keyword sets.
 */

exports.KeywordFeatures = function(emailBody) {
  
  var featureNormalization = new Array(6);

  if(!emailBody)
  {
    console.log("The email body string passed in has no content.");
    
    for (let i=0 ; i < 6 ; i++)
    {
	  featureNormalization[i]=0;
    }
  }
  else
  { 
    var keywords = new Array("update", "confirm", "user", "customer", "client", "suspend", "restrict", "hold", "verify",
    		                 "account", "notif", "login", "username", "password", "click", "log", "SSN", "social security", "secur", "inconvenien");
    
    var counts = new Array(20);
    
    emailBody = emailBody.replace("\n", " ");
    
    // Count the word
    var totalWordCount = 0;
    var words = emailBody.split(" "); 
    for (let i=0 ; i < words.length ; i++){
      // inner loop -- do the count
      if (words[i] != "")
        totalWordCount += 1; 
    }
    
    emailBody = emailBody.toLowerCase();
    
    // Count the keywords
    counts[0] = (emailBody.match(/update/g) || []).length;
    
    counts[1] = (emailBody.match(/confirm/g) || []).length;
    
    counts[2] = (emailBody.match(/user/g) || []).length;
    
    counts[3] = (emailBody.match(/customer/g) || []).length;
    
    counts[4] = (emailBody.match(/client/g) || []).length;
    
    counts[5] = (emailBody.match(/suspend/g) || []).length;
    
    counts[6] = (emailBody.match(/restrict/g) || []).length;
    
    counts[7] = (emailBody.match(/hold/g) || []).length;
    
    counts[8] = (emailBody.match(/verify/g) || []).length;
    
    counts[9] = (emailBody.match(/account/g) || []).length;
    
    counts[10] = (emailBody.match(/notif/g) || []).length;
    
    counts[11] = (emailBody.match(/login/g) || []).length;
    
    counts[12] = (emailBody.match(/username/g) || []).length;
    
    counts[13] = (emailBody.match(/password/g) || []).length;
    
    counts[14] = (emailBody.match(/click/g) || []).length;
    
    counts[15] = (emailBody.match(/log/g) || []).length;
    
    counts[16] = (emailBody.match(/ssn/g) || []).length;
    
    counts[17] = (emailBody.match(/social security/g) || []).length;
    
    counts[18] = (emailBody.match(/secur/g) || []).length;
    
    counts[19] = (emailBody.match(/inconvenien/g) || []).length;
    
    for(let i=0; i < 20; i++){
      counts[i] = counts[i]/totalWordCount;
    }  
    
    // Feature 1: Update; Confirm
    featureNormalization[0] = counts[0] + counts[1];
    
    // Feature 2: User; Customer; Client
    featureNormalization[1] = counts[2] + counts[3] + counts[4];
    
    // Feature 3: Suspend; Restrict; Hold
    featureNormalization[2] = counts[5] + counts[6] + counts[7];
    
    // Feature 4: Verify; Account; Notif
    featureNormalization[3] = counts[8] + counts[9] + counts[10];
    
    // Feature 5: Login; Username; Password; Click; Log
    featureNormalization[4] = counts[11] + counts[12] + counts[13] + counts[14] + counts[15];
    
    // Feature 6: SSN; Social Security; Secur; Inconvenient
    featureNormalization[5] = counts[16] + counts[17] + counts[18] + counts[19];
  }
  
  return featureNormalization;
};
