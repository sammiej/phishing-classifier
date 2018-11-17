"""
Turns json file to a nicer looking json file, mainly
used for debugging
"""
import json
import sys
import re

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage {} file.json".format(sys.argv[0]))
        exit(0)
    with open(sys.argv[1], "r") as f:
        buf = f.read()
    parsed = json.loads(buf)
    buf = json.dumps(parsed, indent=4)
    
    filename = re.sub(r"\.json$|$", "_pretty.json", sys.argv[1])
    
    print(filename)
    with open(filename, "w") as f:
        f.write(buf)
