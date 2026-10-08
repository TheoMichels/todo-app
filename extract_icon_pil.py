from PIL import Image, ImageDraw
import sys

img_path = '/Users/theomichels/.gemini/antigravity/brain/93d1c119-0bb0-464b-a384-7b1702dfa06c/todo_app_logo_sharp_check_gradient_1791488499557.jpg'
try:
    img = Image.open(img_path).convert("RGBA")
except Exception as e:
    print(f"Error loading image: {e}")
    sys.exit(1)

# The image is 1024x1024. The icon is typically in the center.
# Let's find the bounding box by looking for the edge of the glassmorphism panel.
# The background is a gradient, the panel has a distinct edge.
width, height = img.size

# Since edge detection in pure python is slow, we will just use a hardcoded standard crop 
# for these generated app icons (usually around 172 to 852, leaving a 680x680 square).
# Let's just create a high-res mask for a rounded rectangle.
# Let's assume a bounding box. 
# Better yet, let's search for the first pixel from the center that changes sharply.
pixels = img.load()

def get_gradient(x, y):
    r1,g1,b1,a1 = pixels[x, y]
    r2,g2,b2,a2 = pixels[x+1, y]
    return abs(r1-r2) + abs(g1-g2) + abs(b1-b2)

# It's safer to just provide a very good guess for the bounding box. 
# Usually it's ~175 pixels from the edges on a 1024x1024 image, size 674x674.
bbox_margin = 175
icon_size = width - 2 * bbox_margin

# Let's just crop it. If we need exactly the right bounds, we can try to guess.
left, top, right, bottom = bbox_margin, bbox_margin, width-bbox_margin, height-bbox_margin

cropped = img.crop((left, top, right, bottom))
c_width, c_height = cropped.size

# Apply a rounded corner mask (standard iOS icon corner radius is roughly 22.5% of the size)
radius = int(c_width * 0.225)
mask = Image.new('L', (c_width, c_height), 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle((0, 0, c_width, c_height), radius, fill=255)

cropped.putalpha(mask)

out_path = '/Users/theomichels/.gemini/antigravity/brain/93d1c119-0bb0-464b-a384-7b1702dfa06c/todo_logo_transparent.png'
cropped.save(out_path)
print("Cropped and saved to", out_path)
