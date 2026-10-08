from PIL import Image
import shutil

# 1. Update the iOS/Android icon (must be square, no rounded corners, no transparency)
img_path = '/Users/theomichels/.gemini/antigravity/brain/93d1c119-0bb0-464b-a384-7b1702dfa06c/todo_app_logo_sharp_check_gradient_1791488499557.jpg'
img = Image.open(img_path).convert("RGB")

bbox_margin = 175
width, height = img.size
left, top, right, bottom = bbox_margin, bbox_margin, width-bbox_margin, height-bbox_margin

# Crop to exactly the glassmorphism square
cropped = img.crop((left, top, right, bottom))
cropped.save('/Users/theomichels/App/todo/assets/icon.png')

# 2. Update the Favicon (can have transparency and rounded corners)
transparent_icon_path = '/Users/theomichels/.gemini/antigravity/brain/93d1c119-0bb0-464b-a384-7b1702dfa06c/todo_logo_transparent.png'
shutil.copy(transparent_icon_path, '/Users/theomichels/App/todo/assets/favicon.png')

print("Icons updated successfully!")
