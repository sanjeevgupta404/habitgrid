import streamlit as st
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from src.predict import detect_craters
from src.utils import draw_craters, get_image_download_link

st.set_page_config(page_title="Moon Crater Detector", layout="wide")

st.title("🌕 Moon Crater Detection System")
st.markdown("""
Welcome to the **Lunar Surface Analysis Tool**.
Upload a lunar image to automatically detect and highlight craters.
""")

uploaded_file = st.sidebar.file_uploader("Choose a moon image...", type=["jpg", "jpeg", "png"])

st.sidebar.markdown("### Detection Settings")
dp = st.sidebar.slider("DP (Resolution)", 1.0, 2.0, 1.5, 0.1)
min_dist = st.sidebar.slider("Min Distance", 10, 100, 50, 5)
param1 = st.sidebar.slider("Edge Threshold", 50, 200, 100, 10)
param2 = st.sidebar.slider("Accumulator Threshold", 10, 100, 40, 5)
min_rad = st.sidebar.slider("Min Radius", 5, 100, 20, 5)
max_rad = st.sidebar.slider("Max Radius", 50, 500, 200, 10)

if uploaded_file is not None:
    # Convert the file to an opencv image.
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    image = cv2.imdecode(file_bytes, 1)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Original Image")
        st.image(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), use_container_width=True)

    with st.spinner('Detecting craters...'):
        # Allow dynamic parameter passing for judging flexibility
        from src.preprocess import preprocess_image
        processed = preprocess_image(image)
        circles = cv2.HoughCircles(
            processed,
            cv2.HOUGH_GRADIENT,
            dp=dp,
            minDist=min_dist,
            param1=param1,
            param2=param2,
            minRadius=min_rad,
            maxRadius=max_rad
        )
        if circles is not None:
            craters = np.round(circles[0, :]).astype("int")
        else:
            craters = []

        processed_image = draw_craters(image, craters)

    with col2:
        st.subheader("Detected Craters")
        st.image(cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB), use_container_width=True)

    st.sidebar.metric("Craters Found", len(craters))

    # Download section
    st.markdown("---")
    st.subheader("Results")
    st.write(f"Total craters detected: **{len(craters)}**")

    # Use streamlit's built-in download button
    buffered = BytesIO()
    img_pil = Image.fromarray(cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB))
    img_pil.save(buffered, format="PNG")

    st.download_button(
        label="Download Processed Image",
        data=buffered.getvalue(),
        file_name="detected_craters.png",
        mime="image/png"
    )

else:
    st.info("Please upload an image from the sidebar to begin analysis.")

    # Provide sample images
    st.subheader("Sample Images")
    sample_col1, sample_col2, sample_col3 = st.columns(3)

    # Use os.path.join for Windows compatibility
    import os
    data_dir = "data"

    with sample_col1:
        st.image(os.path.join(data_dir, "moon1.jpg"), caption="Sample 1", use_container_width=True)
    with sample_col2:
        st.image(os.path.join(data_dir, "moon2.jpg"), caption="Sample 2", use_container_width=True)
    with sample_col3:
        st.image(os.path.join(data_dir, "moon3.jpg"), caption="Sample 3", use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.write("Developed for Bharatiya Antariksh Hackathon 2026")
