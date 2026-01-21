# Background Image Setup

To add your custom background image to the fundraiser page:

## Steps:

1. **Save your background image** as `background.jpg` in the root folder (same location as index.html)

2. **Image Requirements:**
   - Recommended size: 900px x 700px or larger
   - Format: JPG, PNG, or WebP (rename to background.jpg)
   - Content: Should showcase your prize (e.g., the custom AADS darts shirts)
   - The grid will automatically overlay on top with semi-transparent dark background

3. **Alternative image names:**
   If you want to use a different filename or format, edit line ~52 in index.html:
   ```css
   background-image: url('background.jpg');
   ```
   Change to:
   ```css
   background-image: url('your-image-name.png');
   ```

## Current Design:
- Grid overlays on the background image
- Semi-transparent dark background behind squares for readability
- Orange border frames the entire image
- Responsive design adjusts grid size based on screen width

## Tips:
- Use high-quality images that represent your prize well
- Ensure the image isn't too busy - the grid needs to be readable on top
- The darker the background image, the better the white/gold squares will stand out
