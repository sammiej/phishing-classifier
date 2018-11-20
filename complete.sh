#!/bin/bash

# Requires the python3 command, if python is python3 then do alias python3="python" before
# running this script

# Script trains the classifier, constructs the model for javascript
# and then installs the new model in the phishing plugin for mailspring
# NOTE: This script is only intended to be used for testing
# Script steps:
# - Appends data to the current dataset
# - Extract features from data and make data set split
# - Train model with training data split
# - Evaluate model on test data split
# - Convert trained model to model that can be loaded with javascript
# - Move the trained model to the correct location in mailspring's classifier installation

log_info () {
    echo "[Script--INFO]" $1
}

scriptdir="$(dirname "$0")"
cd $scriptdir

log_info "Current script directory: ${scriptdir}"

# Step 1: Appends data to the current dataset

# If data needs to be appended name it ham_append.mbox, or phishing_append.mbox
# and then place the file in this directory with the script. Once data is appended
# the file will be renamed, to avoid re-adding already added emails
email_type=""
append_file=""
if [ -e "./ham_append.mbox" ]; then
    email_type="ham"
    append_file="ham_append.mbox"
elif [ -e "./phishing_append.mbox" ]; then
    email_type="phishing"
    append_file="phishing_append.mbox"
fi

if [ ! -z "$email_type" ]; then
    # Need to append data
    log_info "Appending new data to dataset"
    cd "./classifier/training/scripts"
    python3 append_mbox_data.py $email_type $append_file
    mv $append_file "processed_${append_file}"
    log_info "Renamed processed data append file"
    cd -
fi

# Step 2: Extract features from data and Make data set split
log_info "Extracting features"
cd "./classifier/training/extraction"
npm install
node index.js
cd -

log_info "Splitting Dataset"
cd "./classifier/training/scripts"
python3 data_split.py "../data/data.arff"

# Step 3: Train model with training data split
log_info "Training model"
python3 train.py "../data/training_data.arff"

# Step 4: Evaluate model on test data split
log_info "Evaluating model"
python3 test_model.py "../data/test_data.arff" "model.joblib"

# Step 5: Convert trained model to model that can be loaded with javascript
log_info "Converting trained model"
python3 dot_to_json.py model.dot

# Step 6: Move trained model to correct location for classifier and plugin
log_info "Moving models to saved model directory"
mv model.* "../../classifier/model/"

log_info "Moving models to mailspring classifier model directory"
cd -
cp ./classifier/classifier/model/model.* "./phishing-plugin/lib/classifier/model/"

