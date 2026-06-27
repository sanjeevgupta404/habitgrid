import cv2
import numpy as np

def draw_craters(image, craters):
    """
    Draws detected craters on the image.
    craters: List of (x, y, r) tuples.
    """
    annotated = image.copy()
    if craters is not None:
        for (x, y, r) in craters:
            # Draw the outer circle
            cv2.circle(annotated, (int(x), int(y)), int(r), (0, 255, 0), 2)
            # Draw the center of the circle
            cv2.circle(annotated, (int(x), int(y)), 2, (0, 0, 255), 3)
    return annotated

def get_image_download_link(img, filename="processed_image.png"):
    """Generates a link to download the processed image."""
    # This will be used in the Streamlit app
    import base64
    from io import BytesIO
    from PIL import Image

    buffered = BytesIO()
    img_pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    img_pil.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    href = f'<a href="data:file/png;base64,{img_str}" download="{filename}">Download Processed Image</a>'
    return href
