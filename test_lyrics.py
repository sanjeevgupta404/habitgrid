import asyncio
import os
import subprocess
import time
import urllib.parse
from playwright.async_api import async_playwright

async def verify_lyrics_fetching():
    # Start local Python web server in the background
    server_process = subprocess.Popen(
        ["python3", "-m", "http.server", "3004", "--bind", "127.0.0.1"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1) # wait for server to bind

    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 800, "height": 900})
        page = await context.new_page()

        # Capture console errors
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            print("--- Running test with fake API Key to verify Live API Fetching & Interception ---")

            # Navigate to the page but first let's setup request interception for Musixmatch API
            # This enables us to mock a successful Musixmatch API response wrapped in the JSONP callback!
            async def handle_musixmatch_request(route):
                request_url = route.request.url
                print(f"Intercepted Musixmatch request: {request_url}")

                # Parse query parameters to extract the callback name
                parsed = urllib.parse.urlparse(request_url)
                params = urllib.parse.parse_qs(parsed.query)
                callback_name = params.get('callback', [None])[0]

                if callback_name:
                    # Construct mocked JSONP response with lyrics_body
                    mock_response_body = {
                        "message": {
                            "header": {
                                "status_code": 200,
                                "execute_time": 0.05
                            },
                            "body": {
                                "lyrics": {
                                    "lyrics_id": 999999,
                                    "lyrics_body": "I'm a lyrical genius, a spiritual miracle\n******* This Lyrics is NOT for Commercial use *******"
                                }
                            }
                        }
                    }
                    js_payload = f"{callback_name}({json_dumps(mock_response_body)});"
                    await route.fulfill(
                        status=200,
                        content_type="application/javascript",
                        body=js_payload
                    )
                else:
                    await route.continue_()

            # Helper to quickly dump JSON in JS-safe format
            import json
            def json_dumps(obj):
                return json.dumps(obj)

            # Route Musixmatch requests to our handler
            await page.route("**/api.musixmatch.com/**", handle_musixmatch_request)

            # We can override the MUSIXMATCH_API_KEY value inside the browser context so it attempts live calls
            await page.add_init_script("window.MUSIXMATCH_API_KEY = 'MOCK_TEST_KEY';")

            await page.goto("http://127.0.0.1:3004/index.html")

            # Let's override it directly on the window object right after load to be absolutely sure
            await page.evaluate("window.MUSIXMATCH_API_KEY = 'MOCK_TEST_KEY';")

            # Verify Landing
            assert await page.is_visible("#landing-screen")
            await page.click("#start-btn")

            # Wait for quiz screen
            await page.wait_for_selector("#quiz-screen")

            # Wait for quote text to be updated from "Loading lyric bars..."
            # Wait until it doesn't contain "Loading lyric bars"
            for _ in range(30):
                text = await page.inner_text("#quote-text")
                if "loading" not in text.lower():
                    break
                await asyncio.sleep(0.1)

            quote_text = await page.inner_text("#quote-text")
            print(f"Loaded quote text: '{quote_text}'")
            # Verify that the quote indeed contains our mocked live text!
            assert "lyrical genius" in quote_text.lower()

            # Submit answer
            await page.keyboard.press("1")
            assert await page.is_visible("#reveal-panel")

            print("--- Running test with bad API response to verify Non-Fatal retry mechanism ---")
            # Next, let's test a failed API call that triggers a retry on another song
            # We'll intercept and return a 404 error header
            async def handle_musixmatch_fail(route):
                request_url = route.request.url
                parsed = urllib.parse.urlparse(request_url)
                params = urllib.parse.parse_qs(parsed.query)
                callback_name = params.get('callback', [None])[0]
                if callback_name:
                    mock_fail_body = {
                        "message": {
                            "header": {
                                "status_code": 404
                            },
                            "body": ""
                        }
                    }
                    js_payload = f"{callback_name}({json_dumps(mock_fail_body)});"
                    await route.fulfill(
                        status=200,
                        content_type="application/javascript",
                        body=js_payload
                    )
                else:
                    await route.continue_()

            # Register the failure route handler
            await page.unroute("**/api.musixmatch.com/**")
            await page.route("**/api.musixmatch.com/**", handle_musixmatch_fail)

            # Click next verse
            await page.click("#next-btn")

            # Let's wait a bit and observe. Since we return 404, it should:
            # 1. Fail for song 1 -> count consecutiveFailures = 1 -> retry on song 2
            # 2. Fail for song 2 -> count consecutiveFailures = 2 -> retry on song 3
            # 3. Fail for song 3 -> count consecutiveFailures = 3 -> switch to offline fallback mock lyrics!
            # Let's verify that after the 3rd failure, it displays mock lyrics and doesn't get stuck.
            for _ in range(50):
                text = await page.inner_text("#quote-text")
                if "loading" not in text.lower():
                    break
                await asyncio.sleep(0.1)

            final_text = await page.inner_text("#quote-text")
            print(f"Final quote text after consecutive failures: '{final_text}'")
            # The text should either be from getMockLyrics (e.g. contains custom lyrics or the template string)
            assert len(final_text) > 0
            assert "loading" not in final_text.lower()

            # Take a final screenshot of the gameplay screen
            os.makedirs("/home/jules/verification", exist_ok=True)
            screenshot_path = "/home/jules/verification/musixmatch_gameplay.png"
            await page.screenshot(path=screenshot_path)
            print(f"Gameplay screenshot saved to {screenshot_path}")

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
        print("SUCCESS: Verified Musixmatch live fetching and retry mechanics with zero console errors.")

if __name__ == "__main__":
    asyncio.run(verify_lyrics_fetching())
