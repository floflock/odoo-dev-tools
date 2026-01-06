# Icon Specifications for Odoo Dev Tools

This document describes the icon requirements for the Chrome extension.

## Required Icon Sizes

Chrome extensions require icons in the following sizes:

### Extension Icons
- **16x16** - Favicon on the extension's pages
- **32x32** - Windows computers often require this size
- **48x48** - Extension management page
- **128x128** - Chrome Web Store and installation

### File Locations
Place all icons in the `public/` directory:
```
public/
├── icon-16.png
├── icon-32.png
├── icon-48.png
└── icon-128.png
```

## Design Recommendations

### Theme
- **Primary Color**: Odoo purple (#714B67 or #875A7B)
- **Accent**: Development/tools theme (wrench, code, or developer symbol)
- **Style**: Clean, modern, professional
- **Background**: Transparent or solid color

### Design Concepts

**Option 1: Odoo Logo + Tools**
- Base: Stylized "O" (Odoo logo inspired)
- Add: Small wrench or code symbol overlay
- Colors: Odoo purple with white/light accents

**Option 2: Developer Badge**
- Shape: Rounded square or shield
- Icon: Code brackets `</>` or wrench symbol
- Text: "O" or "Odoo"
- Colors: Purple gradient

**Option 3: Minimalist**
- Simple geometric shape
- Single letter "O" with developer accent
- Flat design, high contrast
- Colors: Purple on white or vice versa

## Technical Requirements

### Format
- **File format**: PNG with transparency
- **Color mode**: RGB
- **Bit depth**: 24-bit or 32-bit (with alpha channel)

### Quality Guidelines
- Sharp edges at all sizes
- Readable at 16x16 (smallest size)
- Consistent design across all sizes
- Avoid fine details that disappear when scaled down
- Test on both light and dark backgrounds

## Design Tools

### Free Options
- **Figma** (web-based, free tier)
- **GIMP** (free, cross-platform)
- **Inkscape** (free, vector graphics)
- **Canva** (web-based, free tier)

### AI Generation Options
- **DALL-E** via ChatGPT
- **Midjourney**
- **Stable Diffusion**
- **Adobe Firefly**

### Icon Generators
- **Icon Kitchen** (icon.kitchen)
- **App Icon Generator** (appicon.co)
- **MakeAppIcon** (makeappicon.com)

## Example Prompts for AI Generation

### For DALL-E/Midjourney:
```
"Create a modern app icon for a developer tools extension.
Purple color scheme, simple geometric design with a wrench or code symbol.
Professional, clean, minimalist style. Transparent background. 128x128 pixels."
```

### For Stable Diffusion:
```
"app icon, developer tools, purple theme, wrench symbol,
flat design, minimalist, professional, clean lines,
high contrast, transparent background"
```

## Quick Start: Generate Icons

1. **Create the 128x128 master icon** first
2. **Scale down** to create smaller versions:
   - 48x48 (can adjust details if needed)
   - 32x32 (simplify if necessary)
   - 16x16 (may need to simplify significantly)
3. **Test** all sizes in Chrome
4. **Adjust** contrast and visibility if needed

## After Creating Icons

Once you have the icon files:
1. Place them in the `public/` directory
2. Run `pnpm build` to verify they're included
3. Test the extension with the new icons
4. Commit and push to repository
