import sys

from playwright.sync_api import sync_playwright


CATEGORY_URL = "https://www.mymsme.org/projectreport-details/food-processing"


def main():
    target_text = sys.argv[1] if len(sys.argv) > 1 else "Ready To Eat Noodle"

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
        page.get_by_text(target_text, exact=True).first.click()
        page.wait_for_load_state("networkidle", timeout=60000)

        print("URL:", page.url)
        print("Title:", page.title())
        print(page.inner_text("body")[:2500])

        browser.close()


if __name__ == "__main__":
    main()
