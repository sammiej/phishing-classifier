"""
Train a random forest classifier model using the phishing email training data set
"""

DEBUG = False # If True create a debug directory containing the tree visualizations

import sys
import arff
import numpy as np
import pandas as pd
import graphviz
from sklearn.ensemble import RandomForestClassifier
from sklearn import tree
from sklearn.externals import joblib
if DEBUG:
    import os
    base_dir = os.path.dirname(os.path.abspath(__file__)) + "/debug"
    try:
        if not os.path.exists(base_dir):
            os.makedirs(base_dir)
    except:
        print("Unable to create debug directory, debug mode will be turned off")
        DEBUG = False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage {} training_data.arff".format(sys.argv[0]))
        exit(0)
        
    column_labels = []
    with open(sys.argv[1]) as f:
        dataset = arff.load(f)
        for attr in dataset["attributes"]:
            column_labels.append(attr[0])
        data = np.array(dataset["data"])

        df = pd.DataFrame(data, columns=column_labels)
        features = df.columns[:-1]
        X = df[features]
        y = df["class"]

    # Label and integer indicator must be in ascending order
    y = y.replace("non-phishing", 0)            
    y = y.replace("phishing", 1)
    
    print("Beginning training, this might take a couple minutes")
    clf = RandomForestClassifier(n_estimators=128, max_depth=32)
    clf.fit(X, y)
    print("Training complete")
    
    if DEBUG:
        i = 0
        def get_tree_name():
            global i
            tree_base_name = base_dir + "/tree"
            name = "{}{}".format(tree_base_name, i)
            i += 1
            return name

    print("Saving model please wait...")
    buf = ""
    for t in clf.estimators_:
        # class names must be in ascending order
        dot_data = tree.export_graphviz(t, out_file=None,
                                        class_names=["non-phishing", "phishing"])
        buf += dot_data + "\n"
        if DEBUG:
            graph = graphviz.Source(dot_data)
            graph.render(get_tree_name())

    with open("model.dot", "w") as f:
        f.write(buf)

    joblib.dump(clf, "model.joblib")
    
    print("Done")
