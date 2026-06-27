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

if uploaded_file is not None:
    # Convert the file to an opencv image.
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    image = cv2.imdecode(file_bytes, 1)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Original Image")
        st.image(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), use_container_width=True)

    with st.spinner('Detecting craters...'):
        craters = detect_craters(image)
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
    sample_col1, sample_col2 = st.columns(2)
    with sample_col1:
        st.image("data/moon1.jpg", caption="Sample 1", use_container_width=True)
    with sample_col2:
        st.image("data/moon2.jpg", caption="Sample 2", use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.write("Developed for Bharatiya Antariksh Hackathon 2026")
