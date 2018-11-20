"""
Adds more emails to the current dataset.
Assumes ham emails are stored in ../data/ham.mbox
and phishing emails are stored in ../data/phishing.mbox

"""

import sys

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage {} [ham|phishing] data.mbox".format(sys.argv[0]))
        exit(0)
    email_type = sys.argv[1]
    if email_type != "ham" and email_type != "phishing":
        print("Invalid email type option, must be either ham or phishing")
        exit(0)

    buf = ""
    with open(sys.argv[2], "r") as f:
        buf = f.read()

    if buf != "":
        if email_type == "ham":
            fpath = "../data/ham.mbox"
        else:
            fpath = "../data/phishing.mbox"
        
        with open(fpath, "a") as f:
            f.write(buf)
            f.write("\n")

    print("Finished Appending Data!")
