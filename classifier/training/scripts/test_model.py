"""
Test a trained random forest classifier model against a test set
to measure the model's accuracy.
"""
import sys
import arff
import pandas as pd
import numpy as np
from sklearn.externals import joblib

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage {} test_data.arff model.joblib".format(sys.argv[0]))
        exit(0)
    clf_file = sys.argv[2]
    clf = joblib.load(clf_file)

    with open(sys.argv[1]) as f:
        dataset = arff.load(f)

    column_labels = []
    for attr in dataset["attributes"]:
        column_labels.append(attr[0])
    data = np.array(dataset["data"])

    df = pd.DataFrame(data, columns=column_labels)
    features = df.columns[:-1]
    X = df[features]
    y = df["class"]

    num_ham_emails = len(df[df["class"]=="non-phishing"])
    num_phish_emails = len(df[df["class"]=="phishing"])

    print("Number of non-phishing emails used: {}".format(num_ham_emails))
    print("Number of phishing emails used: {}".format(num_phish_emails))

    y = y.replace("non-phishing", 0)
    y = y.replace("phishing", 1)

    predictions = clf.predict(X)
    match = 0
    insult = 0 #false positive
    fraud = 0 #false negative
    for actual, prediction in zip(y, predictions):
        if actual == prediction:
            match += 1
        else:
            if actual == 0:
                insult += 1
            elif actual == 1:
                fraud += 1

    true_pos = num_phish_emails-fraud
    true_neg = num_ham_emails-insult

    precision = true_pos/(true_pos + insult)
    recall = true_pos/(true_pos + fraud)

    f1 = 2 * (precision * recall) / (precision + recall)

    print("F1: {0:.2f}".format(f1))

    insult_rate = insult/num_ham_emails * 100
    print("Insult rate: {0:.2f}%".format(insult_rate))

    fraud_rate = fraud/num_phish_emails * 100
    print("Fraud rate: {0:.2f}%".format(fraud_rate))

    print("Matches: {}".format(match))
    print("Number of Predictions: {}".format(len(predictions)))
    acc = match / len(predictions)
    acc *= 100
    print("Accuracy: {0:.2f}%".format(acc))
