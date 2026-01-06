# Icon Design Concept for Odoo Dev Tools

## Recommended Design

### Visual Concept
```
╔══════════════════════════╗
║                          ║
║     ╭──────────╮        ║
║    │    🔧     │        ║  Purple rounded square
║    │     O     │        ║  with white wrench icon
║    │           │        ║  and stylized "O" letter
║     ╰──────────╯        ║
║                          ║
╚══════════════════════════╝
```

### Color Palette

**Primary (Odoo Purple):**
- Main: `#714B67` or `#875A7B`
- Light: `#A569A0`
- Dark: `#4A2F44`

**Accent:**
- White: `#FFFFFF`
- Light gray: `#F0F0F0` (for backgrounds)

## Design Elements

### 1. Background
- Rounded square (20% border radius)
- Solid Odoo purple (`#875A7B`)
- Or gradient: top `#A569A0` → bottom `#714B67`

### 2. Main Symbol
Choose one of these options:

**Option A: Wrench + O**
- White wrench icon overlapping a circular "O"
- Minimalist, professional
- Clear association with "tools"

**Option B: Code Brackets**
- `< O />` in white
- Developer-focused
- Clean and modern

**Option C: Developer Badge**
- Shield/badge shape with "O"
- Small wrench or gear in corner
- Professional and trustworthy

### 3. Size Considerations

**128x128 (Master)**
- Full detail
- Shadow/depth effects allowed
- Can include subtle gradients

**48x48**
- Simplified details
- Remove subtle effects
- Keep main shapes

**32x32**
- Very simple
- Bold, thick lines
- High contrast

**16x16**
- Maximum simplification
- May need to be just a solid shape with single letter
- Ensure recognizability

## Example Design Specs

### For 128x128:
```
- Canvas: 128x128px
- Background: Rounded rectangle, 104x104px, centered
- Border radius: 20px
- Main icon: 64x64px, centered
- Padding: 12px from edges
- Shadow: Optional, subtle
```

### For 16x16:
```
- Canvas: 16x16px
- Background: Rounded rectangle, 14x14px
- Border radius: 3px
- Main icon: 8x8px (single letter "O" or simple symbol)
- Very bold lines (2-3px thick)
```

## Production Steps

### Method 1: Use Figma (Recommended)
1. Create new project in Figma
2. Create 128x128 artboard
3. Design the master icon
4. Export as PNG at 1x, 2x, 4x
5. Resize in image editor to exact dimensions
6. Save as `icon-128.png`, `icon-48.png`, etc.

### Method 2: Use AI Generation
1. Use ChatGPT DALL-E with this prompt:
   ```
   Create a square app icon for a Chrome extension called "Odoo Dev Tools".
   Design requirements:
   - Size: 1024x1024px (will be scaled down)
   - Style: Modern, flat design, professional
   - Colors: Purple (#875A7B) background, white elements
   - Symbol: Wrench or developer tools icon with letter "O"
   - Shape: Rounded square
   - Clean, minimalist, high contrast
   - No text except letter "O"
   - Transparent background is acceptable
   ```

2. Download the generated image
3. Use an image editor to:
   - Resize to 128x128, 48x48, 32x32, 16x16
   - Adjust contrast if needed
   - Save as PNG files

### Method 3: Icon Generator Service
1. Go to https://appicon.co or https://icon.kitchen
2. Upload a simple design or logo
3. Generate all required sizes automatically
4. Download the icon pack

## Quick Mockup in ASCII

### 128x128 concept:
```
████████████████████████████
██                        ██
██  ╔══════════════════╗  ██
██  ║                  ║  ██
██  ║      ┌──┐        ║  ██
██  ║      │ 🔧│        ║  ██
██  ║      │  │        ║  ██
██  ║      │  O│        ║  ██
██  ║      └──┘        ║  ██
██  ║                  ║  ██
██  ╚══════════════════╝  ██
██                        ██
████████████████████████████
```

### 16x16 concept (simplified):
```
████████████████
██          ██
██    O     ██
██          ██
████████████████
```

## Testing Your Icons

After creating the icons:

1. **Place files in public/ directory:**
   ```
   public/icon-16.png
   public/icon-32.png
   public/icon-48.png
   public/icon-128.png
   ```

2. **Test in development:**
   ```bash
   pnpm dev
   ```

3. **Check in Chrome:**
   - Go to `chrome://extensions/`
   - Your icon should appear in the extensions list
   - Click the extension - icon should show in toolbar

4. **Test on different backgrounds:**
   - Light theme
   - Dark theme
   - Ensure visibility in both

## Resources

- **Figma**: https://figma.com (free)
- **GIMP**: https://gimp.org (free)
- **Photopea**: https://photopea.com (free, web-based)
- **Icon Kitchen**: https://icon.kitchen (free generator)
- **Odoo Brand Assets**: https://github.com/odoo/design-themes
