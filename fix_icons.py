from PIL import Image
import shutil

# 1. Resize icon to 1024x1024
icon_path = '/Users/theomichels/App/todo/assets/icon.png'
img = Image.open(icon_path).convert("RGB")
img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
img.save(icon_path)

# 2. Copy to public/apple-touch-icon.png
shutil.copy(icon_path, '/Users/theomichels/App/todo/public/apple-touch-icon.png')
print("Icons resized and copied.")
