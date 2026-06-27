import cv2
import numpy as np
import os
from src.predict import detect_craters

def calculate_iou(circle1, circle2):
    """
    Approximates IoU for two circles.
    circle: (x, y, r)
    """
    x1, y1, r1 = circle1
    x2, y2, r2 = circle2

    d = np.sqrt((x1 - x2)**2 + (y1 - y2)**2)

    if d >= r1 + r2:
        return 0.0
    if d <= abs(r1 - r2):
        return 1.0 # One is inside another, or they are identical

    # Approximation using bounding boxes for simplicity in metric reporting
    box1 = [x1-r1, y1-r1, x1+r1, y1+r1]
    box2 = [x2-r2, y2-r2, x2+r2, y2+r2]

    xA = max(box1[0], box2[0])
    yA = max(box1[1], box2[1])
    xB = min(box1[2], box2[2])
    yB = min(box1[3], box2[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    box1Area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2Area = (box2[2] - box2[0]) * (box2[3] - box2[1])

    iou = interArea / float(box1Area + box2Area - interArea)
    return iou

def evaluate_detection(detected_craters, ground_truth_craters, iou_threshold=0.5):
    """
    Calculates precision and recall.
    """
    if not ground_truth_craters:
        return 0, 0, 0

    tp = 0
    matched_gt = set()

    for det in detected_craters:
        for i, gt in enumerate(ground_truth_craters):
            if i in matched_gt:
                continue
            if calculate_iou(det, gt) >= iou_threshold:
                tp += 1
                matched_gt.add(i)
                break

    precision = tp / len(detected_craters) if len(detected_craters) > 0 else 0
    recall = tp / len(ground_truth_craters)
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    return precision, recall, f1

def run_evaluation():
    print("--- Model Evaluation Report ---")
    # In a real scenario, we would have annotated ground truth.
    # For this prototype, we simulate evaluation on a sample.

    # Mock ground truth for moon1.jpg (estimated)
    # This is for demonstration of the evaluation framework.
    mock_gt = [(1290, 1226, 150), (1000, 500, 50), (2000, 1500, 80)]

    img = cv2.imread("data/moon1.jpg")
    if img is not None:
        detected = detect_craters(img)
        p, r, f1 = evaluate_detection(detected, mock_gt)
        print(f"Sample Image: moon1.jpg")
        print(f"Detected: {len(detected)}, Ground Truth (Mock): {len(mock_gt)}")
        print(f"Precision: {p:.2f}")
        print(f"Recall: {r:.2f}")
        print(f"F1-Score: {f1:.2f}")
    else:
        print("Data for evaluation not found.")

if __name__ == "__main__":
    run_evaluation()
