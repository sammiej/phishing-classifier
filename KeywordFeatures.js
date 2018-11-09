var exports = module.exports = {};


    /*
     * Calculate the word count and normalisation of the features
     *   of six sets of keywords.
     *
     * Params: Email body (type: string)
     * Returns: Object that contains three arrays.
     *              features: Six sets of keywords;
     *		        featureWordCount: Word counts of six keyword sets;
     *		        featureNormalization: Normalisations of six keyword sets.
     */
    
exports.KeywordFeatures = function(emailBody) {
    
    var emptyCheck;
    var nullCheck;
    var features = new Array(6);
	var featureWordCount = new Array(6);
	var featureNormalization = new Array(6);

    if(emailBody === "")
    {
        emptyCheck = true;
        nullCheck = false;
        console.log('The email body string passed in has no content.');
    
        for (i=0 ; i < 6 ; i++)
        {
        	features[i]="";
		    featureWordCount[i]=0;
		    featureNormalization[i]=0;
    	}
    }
    
    else if(emailBody == null)
    {
        emptyCheck = false;
        nullCheck = true;
        console.log('The email body string passed in points to NULL.');
    
        for (i=0 ; i < 6 ; i++)
        {
            features[i]=null;
        	featureWordCount[i]=0;
    		featureNormalization[i]=0;
    	}
    }
    
    else
    {
        emptyCheck = false;
        nullCheck = false;
        
    	// Array of keywords
    	var keywords = new Array("update", "confirm", "user", "customer", "client", "suspend", "restrict", "hold", "verify",
    		"account", "notif", "login", "username", "password", "click", "log", "SSN", "social security", "secur", "inconvenien");
    
    	var counts = new Array(20);
    	var normalizations = new Array(20);
    
    	// Replace '\n' with space ' ' 
        emailBody = emailBody.replace("\n", " ");
    
    	// Count the word
    	var count = 0;
    	words = emailBody.split(" "); 
    	for (i=0 ; i < words.length ; i++){
       	// inner loop -- do the count
       	if (words[i] != "")
          	count += 1; 
    	}
    
    	// Convert all letters to lower-case
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
    
    	for(i=0; i < 20; i++){
    		normalizations[i] = counts[i]/count;
    	}
    
    
        // Feature 1: Update; Confirm
        features[0] = keywords[0] + "; " + keywords[1];
    	featureWordCount[0] = counts[0] + counts[1];
    	featureNormalization[0] = normalizations[0] + normalizations[1];
    
        // Feature 2: User; Customer; Client
        features[1] = keywords[2] + "; " + keywords[3] + "; " + keywords[4];
    	featureWordCount[1] = counts[2] + counts[3] + counts[4];
    	featureNormalization[1] = normalizations[2] + normalizations[3] + normalizations[4];
    
        // Feature 3: Suspend; Restrict; Hold
        features[2] = keywords[5] + "; " + keywords[6] + "; " + keywords[7];
    	featureWordCount[2] = counts[5] + counts[6] + counts[7];
    	featureNormalization[2] = normalizations[5] + normalizations[6] + normalizations[7];
    
        // Feature 4: Verify; Account; Notif
        features[3] = keywords[8] + "; " + keywords[9] + "; " + keywords[10];
    	featureWordCount[3] = counts[8] + counts[9] + counts[10];
    	featureNormalization[3] = normalizations[8] + normalizations[9] + normalizations[10];
    
        // Feature 5: Login; Username; Password; Click; Log
        features[4] = keywords[11] + "; " + keywords[12] + "; " + keywords[13] + "; " + keywords[14] + "; " + keywords[15];
    	featureWordCount[4] = counts[11] + counts[12] + counts[13] + counts[14] + counts[15];
    	featureNormalization[4] = normalizations[11] + normalizations[12] + normalizations[13] + normalizations[14] + normalizations[15];
    
        // Feature 6: SSN; Social Security; Secur; Inconvenient
        features[5] = keywords[16] + "; " + keywords[17] + "; " + keywords[18] + "; " + keywords[19];
    	featureWordCount[5] = counts[16] + counts[17] + counts[18] + counts[19]; 
    	featureNormalization[5] = normalizations[16] + normalizations[17] + normalizations[18] + normalizations[19];
    }
    
    return {
		emptyCheck: emptyCheck,
		nullCheck: nullCheck,
		features: features,
		featureWordCount: featureWordCount,
    	featureNormalization: featureNormalization
	};
}
