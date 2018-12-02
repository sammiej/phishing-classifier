"""
Split data.arff into training_data.arff and test_data.arff.
Default split is 80% training and 20% test.
"""
import arff
import pandas as pd
import numpy as np
import os
import sys
import re

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage {} data.arff".format(sys.argv[0]))
        exit(0)

    column_labels = []
    with open(sys.argv[1]) as f:
        dataset = arff.load(f)

    for attr in dataset["attributes"]:
        column_labels.append(attr[0])
    data = np.array(dataset["data"])

    df = pd.DataFrame(data, columns=column_labels)

    phishing = len(df[df["class"]=="phishing"])
    non_phishing = len(df[df["class"]=="non-phishing"])

    print("Number of phishing emails: {}".format(phishing))
    print("Number of non-phishing emails: {}".format(non_phishing))
