import cv2
import numpy as np
from .preprocess import preprocess_image

def detect_craters(image):
    """
    Detects craters using Hough Circle Transform.
    Returns a list of (x, y, r).
    """
    processed = preprocess_image(image)

    # Hough Circles parameters can be tuned
    circles = cv2.HoughCircles(
        processed,
        cv2.HOUGH_GRADIENT,
        dp=1.5,
        minDist=50,
        param1=100,
        param2=40,
        minRadius=20,
        maxRadius=200
    )

    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        return circles
    return []

def detect_craters_blob(image):
    """
    Detects craters using SimpleBlobDetector.
    """
    processed = preprocess_image(image)

    # Set up the detector with parameters.
    params = cv2.SimpleBlobDetector_Params()

    # Change thresholds
    params.minThreshold = 10
    params.maxThreshold = 200

    # Filter by Area.
    params.filterByArea = True
    params.minArea = 100

    # Filter by Circularity
    params.filterByCircularity = True
    params.minCircularity = 0.1

    # Filter by Convexity
    params.filterByConvexity = True
    params.minConvexity = 0.5

    # Filter by Inertia
    params.filterByInertia = True
    params.minInertiaRatio = 0.1

    detector = cv2.SimpleBlobDetector_create(params)
    keypoints = detector.detect(processed)

    craters = []
    for kp in keypoints:
        x, y = kp.pt
        r = kp.size / 2
        craters.append((x, y, r))

    return craters
