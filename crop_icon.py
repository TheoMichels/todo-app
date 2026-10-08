from PIL import Image, ImageChops

def crop_center(img_path, output_path, crop_factor=0.85):
    img = Image.open(img_path)
    width, height = img.size
    
    # Calculate new dimensions
    new_width = int(width * crop_factor)
    new_height = int(height * crop_factor)
    
    # Calculate coordinates for center crop
    left = (width - new_width) / 2
    top = (height - new_height) / 2
    right = (width + new_width) / 2
    bottom = (height + new_height) / 2
    
    # Crop and resize back to original
    img_cropped = img.crop((left, top, right, bottom))
    img_resized = img_cropped.resize((width, height), Image.Resampling.LANCZOS)
    img_resized.save(output_path)
    print(f"Cropped {img_path} with factor {crop_factor} and saved to {output_path}")

crop_center('/Users/theomichels/.gemini/antigravity/brain/bdf7ded6-f48b-44c1-8025-4a6b7b2c29a2/logo_4k_v2_1791490846493.jpg', 'assets/icon.png', 0.8)
crop_center('/Users/theomichels/.gemini/antigravity/brain/bdf7ded6-f48b-44c1-8025-4a6b7b2c29a2/logo_4k_v2_1791490846493.jpg', 'assets/favicon.png', 0.8)
crop_center('/Users/theomichels/.gemini/antigravity/brain/bdf7ded6-f48b-44c1-8025-4a6b7b2c29a2/logo_4k_v2_1791490846493.jpg', 'public/apple-touch-icon.png', 0.8)

