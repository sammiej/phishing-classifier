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
    df["is_train"] = np.random.uniform(0, 1, len(df)) <= .8
    train, test = df[df["is_train"]==True], df[df["is_train"]==False]
    train = train.drop("is_train", axis=1)
    test = test.drop("is_train", axis=1)

    def write_data(df, orig_data, filename):
        data = {}
        for key in orig_data:
            if key != "data":
                data[key] = orig_data[key]
        arr = df.values
        data["data"] = []
        for row in arr:
            data["data"].append(row)

        buf = arff.dumps(data)
        # Remove spaces behind commas to ensure, file can be
        # properly parsed by other parsers
        buf = re.sub(r"(,)\s", r"\1", buf)
        
        with open(filename, "w") as f:
            f.write(buf)

    dirname = os.path.dirname(sys.argv[1])
    if not dirname:
        dirname = "."
    write_data(train, dataset, dirname + "/training_data.arff")
    write_data(test, dataset, dirname + "/test_data.arff")    
        
