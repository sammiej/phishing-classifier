var exports = module.exports = {};

if(emailBody === "")
{
    exports.emptyCheck = true;
    export.nullCheck = false;
    console.log('The email body string passed in has no content.');
}
else if(emailBody == null)
{
    exports.emptyCheck = false;
    export.nullCheck = true;
    console.log('The email body string passed in points to NULL.');
}
else
{
    exports.emptyCheck = false;
    export.nullCheck = false;
    
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
    
    exports.keywordFeatures = function(emailBody) {
    
    	// Array of keywords
    	var keywords = new Array("update", "confirm", "user", "customer", "client", "suspend", "restrict", "hold", "verify",
    		"account", "notif", "login", "username", "password", "click", "log", "SSN", "social security", "secur", "inconvenien");
    
    	var counts = new Array(20);
    	var normalizations = new Array(20);
    
    	// Replace '\n' with space ' ' 
        emailStr = emailStr.replace("\n", " ");
    
    	// Count the word
    	var count = 0;
    	words = emailStr.split(" "); 
    	for (i=0 ; i < words.length ; i++){
       	// inner loop -- do the count
       	if (words[i] != "")
          	count += 1; 
    	}
    
    	// Convert all letters to lower-case
    	emailStr = emailStr.toLowerCase();
    
    	// Count the keywords
    	counts[0] = (emailStr.match(/update/g) || []).length;
    
        counts[1] = (emailStr.match(/confirm/g) || []).length;
    
    	counts[2] = (emailStr.match(/user/g) || []).length;
    
    	counts[3] = (emailStr.match(/customer/g) || []).length;
    
    	counts[4] = (emailStr.match(/client/g) || []).length;
    
    	counts[5] = (emailStr.match(/suspend/g) || []).length;
        	
    	counts[6] = (emailStr.match(/restrict/g) || []).length;
    
    	counts[7] = (emailStr.match(/hold/g) || []).length;
    
    	counts[8] = (emailStr.match(/verify/g) || []).length;
    
    	counts[9] = (emailStr.match(/account/g) || []).length;
    
    	counts[10] = (emailStr.match(/notif/g) || []).length;
    
    	counts[11] = (emailStr.match(/login/g) || []).length;
    
    	counts[12] = (emailStr.match(/username/g) || []).length;
    
    	counts[13] = (emailStr.match(/password/g) || []).length;
    
    	counts[14] = (emailStr.match(/click/g) || []).length;
    
    	counts[15] = (emailStr.match(/log/g) || []).length;
    
    	counts[16] = (emailStr.match(/ssn/g) || []).length;
    
    	counts[17] = (emailStr.match(/social security/g) || []).length;
    
    	counts[18] = (emailStr.match(/secur/g) || []).length;
    
    	counts[19] = (emailStr.match(/inconvenien/g) || []).length;
    
    	for(i=0; i < 20; i++){
    		normalizations[i] = counts[i]/count;
    	}
    
        var features = new Array(6);
    	var featureWordCount = new Array(6);
    	var featureNormalization = new Array(6);
    
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
    
    	return {
    		features: features,
    		featureWordCount: featureWordCount,
    		featureNormalization: featureNormalization
    	};
    
    }
}