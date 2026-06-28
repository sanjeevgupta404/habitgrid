import cv2
import numpy as np

def load_image(image_path):
    """Loads an image from the specified path."""
    return cv2.imread(image_path)

def to_grayscale(image):
    """Converts an image to grayscale."""
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image

def apply_clahe(gray_image):
    """Applies Contrast Limited Adaptive Histogram Equalization (CLAHE)."""
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray_image)

def denoise(image):
    """Applies Gaussian blurring to reduce noise."""
    return cv2.GaussianBlur(image, (5, 5), 0)

def preprocess_image(image):
    """Full preprocessing pipeline for crater detection."""
    gray = to_grayscale(image)
    enhanced = apply_clahe(gray)
    blurred = denoise(enhanced)
    return blurred
