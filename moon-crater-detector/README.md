# Moon Crater Detector 🌕

A complete hackathon-ready prototype for Bharatiya Antariksh Hackathon 2026. This application analyzes lunar surface images and automatically detects and highlights craters using computer vision.

## Project Overview
This project uses OpenCV and Python to identify craters on the Moon's surface. It features a user-friendly Streamlit interface for image processing and visualization.

## Features
- **Image Upload:** Upload lunar images (JPG, JPEG, PNG).
- **Automated Detection:** Uses Hough Circle Transform and Blob Detection for robust crater identification.
- **Side-by-Side Comparison:** Compare the original and processed images.
- **Statistics:** Displays the total count of detected craters.
- **Downloadable Results:** Save the annotated image to your computer.

## Installation Steps
1. Ensure you have Python 3.12+ installed.
2. Navigate to the project directory:
   ```bash
   cd moon-crater-detector
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## How to Run the Project
Launch the Streamlit application:
```bash
streamlit run app.py
```

## Dataset Information
The system is designed to work with high-resolution lunar imagery. Sample images are included in the `data/` directory, sourced from NASA and Wikimedia Commons. For training deep learning models, datasets like the [LU5M812TGT](https://www.kaggle.com/datasets/riccardolagrassa/lu5m812tgt) or Roboflow Lunar Crater datasets are recommended.

## Project Structure
```
moon-crater-detector/
├── data/           # Sample lunar images
├── models/         # Pretrained model weights (if any)
├── notebooks/      # Exploratory Data Analysis and experimentation
├── src/            # Core processing logic
│   ├── preprocess.py
│   ├── train.py
│   ├── predict.py
│   └── utils.py
├── app.py          # Streamlit frontend
├── requirements.txt
└── README.md
```

## Future Improvements
- **Deep Learning Integration:** Implement a YOLOv8 or Mask R-CNN model for higher precision in complex terrains.
- **Elevation Data:** Incorporate Digital Elevation Models (DEM) for 3D crater analysis.
- **Real-time Processing:** Optimize the pipeline for video feed analysis from lunar orbiters.
- **Crater Classification:** Categorize craters by size and age.

---
Developed for **Bharatiya Antariksh Hackathon 2026**.
