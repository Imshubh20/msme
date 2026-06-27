import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright


CATEGORY_URL = "https://www.mymsme.org/projectreport-details/food-processing"
OUTPUT_FILE = Path(__file__).with_name("food_processing_reports.json")


def clean_text(value):
    replacements = {
        "â€“": "-",
        "â€™": "'",
        "Ã¢â‚¬Â": "-",
        "Ã¢â‚¬â€œ": "-",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return " ".join(value.split())


def extract_description(body_text, title):
    text = body_text.replace("\r", "\n")
    lines = [clean_text(line) for line in text.splitlines()]
    lines = [line for line in lines if line]

    if title in lines:
        start = lines.index(title) + 1
    else:
        start = 0

    stop_words = {
        f"Project Report {title}",
        "Enquiry Now",
        "Industry",
        "Select Industry",
    }

    selected = []
    for line in lines[start:]:
        if line in stop_words or line.startswith("Project Report "):
            break
        selected.append(line)

    return clean_text(" ".join(selected))[:2500]


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/148.0.0.0 Safari/537.36"
            )
        )

        page.goto(CATEGORY_URL, wait_until="networkidle", timeout=60000)

        links = page.locator("a").evaluate_all(
            """anchors => anchors
                .map(anchor => ({
                    title: anchor.innerText.trim(),
                    href: anchor.getAttribute('href')
                }))
                .filter(link =>
                    link.title &&
                    link.href &&
                    link.href.includes('/report-details/food-processing')
                )
            """
        )

        unique_reports = []
        seen = set()
        for link in links:
            title = clean_text(link["title"])
            url = urljoin(CATEGORY_URL, link["href"])
            key = (title.lower(), url)
            if key not in seen:
                seen.add(key)
                unique_reports.append({"title": title, "url": url})

        reports = []
        for report in unique_reports:
            page.goto(report["url"], wait_until="networkidle", timeout=60000)
            body_text = page.inner_text("body")
            description = extract_description(body_text, report["title"])
            has_detail_page = bool(description)
            if not description:
                description = (
                    f"{report['title']} project report under Food Processing. "
                    "The detail page did not return public content, but the project is "
                    "listed on the Food Processing category page."
                )
            reports.append(
                {
                    "category": "Food Processing",
                    "title": report["title"],
                    "description": description,
                    "url": report["url"] if has_detail_page else CATEGORY_URL,
                    "source_url": report["url"],
                    "has_detail_page": has_detail_page,
                }
            )
            print(f"Collected: {report['title']}")

        OUTPUT_FILE.write_text(
            json.dumps(reports, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

        browser.close()

    print(f"\nSaved {len(reports)} reports to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
