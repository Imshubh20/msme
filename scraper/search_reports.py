import json
import math
import re
import sys
from collections import Counter
from pathlib import Path


DATA_FILE = Path(__file__).with_name("food_processing_reports.json")
STOP_WORDS = {
    "i",
    "want",
    "to",
    "start",
    "business",
    "project",
    "report",
    "manufacturing",
    "making",
    "food",
    "processing",
    "and",
    "with",
    "for",
    "the",
    "a",
    "an",
}


def tokenize(text):
    return [
        token
        for token in re.findall(r"[a-z0-9]+", text.lower())
        if token not in STOP_WORDS
    ]


def vectorize(text):
    return Counter(tokenize(text))


def cosine_similarity(left, right):
    common = set(left) & set(right)
    numerator = sum(left[word] * right[word] for word in common)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if not left_norm or not right_norm:
        return 0
    return numerator / (left_norm * right_norm)


def main():
    query = " ".join(sys.argv[1:]).strip()
    if not query:
        query = input("Describe your project: ").strip()

    reports = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    query_vector = vectorize(query)

    scored = []
    for report in reports:
        report_text = f"{report['title']} {report['title']} {report['title']} {report['description']}"
        score = cosine_similarity(query_vector, vectorize(report_text))
        scored.append((score, report))

    scored.sort(key=lambda item: item[0], reverse=True)

    for score, report in scored[:3]:
        print(f"\nScore: {score:.3f}")
        print(f"Title: {report['title']}")
        print(f"URL: {report['url']}")
        print(f"Description: {report['description'][:300]}")


if __name__ == "__main__":
    main()
