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

        # Go to the local HTML file
        page.goto(f'file://{file_path}')

        # Wait for the page to be fully loaded
        page.wait_for_load_state('networkidle')

        # 1. Check that the initial weather data for Rome is loaded.
        expect(page.locator('#location')).to_have_value('Rome')

        # 2. Type "London" in the search box.
        page.fill('#location', 'London')

        # 3. Wait for suggestions to appear and click the first one.
        page.wait_for_selector('.suggestion-item')
        page.click('.suggestion-item')

        # 4. Wait for the weather to update.
        page.wait_for_load_state('networkidle')
        time.sleep(2) # a little extra time for rendering

        # 5. Verify that the weather for London is displayed.
        expect(page.locator('#location')).to_have_value('London')

        # 6. Click on an hourly forecast card.
        hour_cards = page.query_selector_all('.hour-card')
        if len(hour_cards) > 3:
            hour_cards[3].click()

        time.sleep(1)

        # 7. Switch to Italian.
        page.click('#lang-it')
        time.sleep(1)

        # 8. Verify that the text is translated and emojis are present.
        expect(page.locator('h1')).to_have_text('Previsioni Meteo 🌦️')
        expect(page.locator('[data-translate="temperature"]')).to_contain_text('Temperatura: 🌡️')

        # 9. Take a screenshot of the final state.
        page.screenshot(path='jules-scratch/verification/verification_all.png')

        browser.close()

if __name__ == '__main__':
    run()
