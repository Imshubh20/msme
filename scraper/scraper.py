from urllib.parse import urljoin
import sys

from playwright.sync_api import sync_playwright


DEFAULT_URL = "https://www.mymsme.org/projectreport"


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/148.0.0.0 Safari/537.36"
            )
        )

        page.goto(url, wait_until="networkidle", timeout=60000)

        print("Status:", page.evaluate("() => document.readyState"))
        print("Title:", page.title())
        print("\nPage Preview:\n")
        print(page.inner_text("body")[:1500])

        links = page.locator("a").evaluate_all(
            """anchors => anchors
                .map(anchor => ({
                    text: anchor.innerText.trim(),
                    href: anchor.getAttribute('href')
                }))
                .filter(link => link.text || link.href)
            """
        )

        print("\nLinks:\n")
        for link in links:
            text = " ".join(link["text"].split())
            href = urljoin(url, link["href"] or "")
            print(f"{text} -> {href}")

        browser.close()


if __name__ == "__main__":
    main()
