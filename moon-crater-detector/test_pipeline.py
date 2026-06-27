import cv2
import os
from src.predict import detect_craters
from src.utils import draw_craters

def test_detection():
    data_dir = "data"
    test_images = ["moon1.jpg", "moon2.jpg"]

    for img_name in test_images:
        img_path = os.path.join(data_dir, img_name)
        if not os.path.exists(img_path):
            print(f"Skipping {img_name}, file not found.")
            continue

        image = cv2.imread(img_path)
        if image is None:
            print(f"Failed to load {img_name}")
            continue

        print(f"Processing {img_name}...")
        craters = detect_craters(image)
        print(f"Found {len(craters)} craters in {img_name}")

        # Optionally save the result to see it (though we can't view it here easily)
        # processed = draw_craters(image, craters)
        # cv2.imwrite(f"test_result_{img_name}", processed)

if __name__ == "__main__":
    test_detection()
