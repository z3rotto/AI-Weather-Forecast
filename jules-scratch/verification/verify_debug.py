from playwright.sync_api import sync_playwright, expect
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console events
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        # Get the absolute path to the HTML file
        file_path = os.path.abspath('index.html')

        # Go to the local HTML file with debug mode enabled
        page.goto(f'file://{file_path}?debug=true')

        # Wait for the page to be fully loaded
        page.wait_for_load_state('networkidle')

        # 1. Check that the debug container is visible.
        expect(page.locator('#debug-container')).to_be_visible()

        # 2. Check that the initial weather data for Rome is loaded.
        expect(page.locator('#location')).to_have_value('Rome')

        # 3. Type "London" in the search box.
        page.fill('#location', 'London')

        # 4. Wait for suggestions to appear and click the first one.
        page.wait_for_selector('.suggestion-item', timeout=10000) # Increased timeout
        page.click('.suggestion-item')

        # 5. Wait for the weather to update.
        page.wait_for_load_state('networkidle')
        time.sleep(3) # a little extra time for rendering

        # 6. Verify that the weather for London is displayed.
        expect(page.locator('#location')).to_have_value('London')

        # 7. Take a screenshot of the final state.
        page.screenshot(path='jules-scratch/verification/verification_debug.png')

        browser.close()

if __name__ == '__main__':
    run()
