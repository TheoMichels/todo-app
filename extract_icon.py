import cv2
import numpy as np
from PIL import Image

# Load the image
img_path = '/Users/theomichels/.gemini/antigravity/brain/93d1c119-0bb0-464b-a384-7b1702dfa06c/todo_app_logo_sharp_check_gradient_1791488499557.jpg'
image = cv2.imread(img_path)
original = image.copy()

# Convert to grayscale and blur
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (5, 5), 0)

# Edge detection
edges = cv2.Canny(blurred, 50, 150)

# Find contours
contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Find the largest contour (should be the app icon background)
max_area = 0
best_cnt = None
for cnt in contours:
    area = cv2.contourArea(cnt)
    if area > max_area:
        max_area = area
        best_cnt = cnt

if best_cnt is not None:
    # Create a mask for the rounded rectangle
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.drawContours(mask, [best_cnt], -1, 255, -1)
    
    # Smooth the mask to get nice anti-aliased rounded corners
    mask = cv2.GaussianBlur(mask, (3, 3), 0)
    
    # Add alpha channel
    b, g, r = cv2.split(image)
    rgba = [b, g, r, mask]
    dst = cv2.merge(rgba, 4)
    
    # Get bounding box to crop
    x, y, w, h = cv2.boundingRect(best_cnt)
    
    # Crop the image
    cropped = dst[y:y+h, x:x+w]
    
    # Save output
    out_path = '/Users/theomichels/.gemini/antigravity/brain/93d1c119-0bb0-464b-a384-7b1702dfa06c/logo_extracted.png'
    cv2.imwrite(out_path, cropped)
    print(f"Success. Bounding box: {x}, {y}, {w}, {h}")
else:
    print("Failed to find contour")
