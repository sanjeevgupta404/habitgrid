import asyncio
import os
import subprocess
import time
from playwright.async_api import async_playwright

async def verify_app():
    # Start local Python web server in the background
    server_process = subprocess.Popen(
        ["python3", "-m", "http.server", "3003", "--bind", "127.0.0.1"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1) # wait for server to bind

    # Keep track of any console errors
    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Emulate responsive mobile layout or desktop
        context = await browser.new_context(viewport={"width": 800, "height": 900})
        page = await context.new_page()

        # Capture console errors
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            print("Navigating to local page...")
            await page.goto("http://127.0.0.1:3003/index.html")

            # Verify Landing screen is active
            assert await page.is_visible("#landing-screen")
            assert await page.is_visible("#start-btn")
            assert not await page.is_visible("#error-container") # Error container should remain hidden

            print("Clicking start button...")
            await page.click("#start-btn")

            # Verify screen transition
            assert await page.is_visible("#quiz-screen")
            assert not await page.is_visible("#landing-screen")

            # Check for the quotes remaining indicator
            indicator_text = await page.inner_text("#progress-text-indicator")
            print(f"Indicator shows initially: '{indicator_text}'")
            assert "question 1 of" in indicator_text.lower()

            # Grab option button text before keyboard press
            first_btn_text = await page.locator(".option-btn").first.inner_text()
            print(f"First choice option is: {first_btn_text}")

            # Test keyboard support by pressing "1"
            print("Pressing key '1' to select first answer...")
            await page.keyboard.press("1")

            # Check that feedback panel is revealed
            assert await page.is_visible("#reveal-panel")

            # Verify all buttons are disabled immediately
            option_btns = await page.locator(".option-btn").all()
            for btn in option_btns:
                is_disabled = await btn.is_disabled()
                assert is_disabled, "Option button should be disabled after answering"

            # Try clicking buttons again or pressing keys to ensure double-answering is blocked
            # (state.hasAnswered is true, buttons are disabled, so they shouldn't trigger anything)
            print("Confirming double answering is prevented (no console logs or state changes)...")
            # We pass force=True to allow clicking on a disabled button for testing
            await page.click(".option-btn:nth-child(2)", force=True)

            # Proceed to next verse
            print("Clicking 'Next Verse'...")
            await page.click("#next-btn")

            # Check that we progressed
            new_indicator_text = await page.inner_text("#progress-text-indicator")
            print(f"Indicator shows after next verse: '{new_indicator_text}'")
            assert "question 2 of" in new_indicator_text.lower()

            # Take a screenshot to visually verify style integrity
            os.makedirs("/home/jules/verification", exist_ok=True)
            screenshot_path = "/home/jules/verification/quiz_polished_screen.png"
            await page.screenshot(path=screenshot_path)
            print(f"Polished screenshot saved to {screenshot_path}")

        finally:
            await browser.close()
            server_process.terminate()
            server_process.wait()

    if console_errors:
        print("ERROR: Console errors captured:")
        for err in console_errors:
            print(f" - {err}")
        raise AssertionError("Console errors detected!")
    else:
        print("SUCCESS: Zero console errors detected during run.")

if __name__ == "__main__":
    asyncio.run(verify_app())
