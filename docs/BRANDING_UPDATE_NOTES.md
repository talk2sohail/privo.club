# Branding Update Notes for Privo.club

## Completed Updates ✅

1. **Package Metadata**: Updated `package.json` with new name "privo-club"
2. **Frontend Metadata**: Updated all metadata in `layout.tsx` and `manifest.ts`
3. **UI Text**: Updated all user-facing text across:
   - Homepage (`src/app/page.tsx`)
   - Sign-in page (`src/app/auth/signin/page.tsx`)
   - Event page (`src/app/event/[id]/page.tsx`)
4. **Backend**: 
   - Updated Go module name to `privo-club-backend`
   - Updated all import paths
   - Updated API response text
   - Renamed service file to `privo-club-backend.service`
   - Updated Postman collection
5. **Documentation**: Updated all markdown files with new branding

## Logo/Icon Updates Needed 🎨

The brand design file is located at: `docs/brand-design.png`

### Current Icon Placeholder
The current icon in `/public/icons/icon.svg` is a simple "i" placeholder. 

### New Icon Requirements
According to the brand design, the new logo should be:
- A **gift box icon** with a bow on top (as shown in the brand design)
- Colors: White icon on dark/transparent background
- Should work well at all sizes (48px to 512px)

### Steps to Update Icons:

1. **Create the SVG icon**: 
   - Extract or recreate the gift box icon from `docs/brand-design.png`
   - Save as `/public/icons/icon.svg`
   - Ensure it's a clean SVG with proper viewBox
   - Recommended: White color (#FFFFFF) for the icon itself

2. **Generate all icon sizes**:
   ```bash
   cd /home/runner/work/invito/invito
   node scripts/generate-icons.js
   ```
   This will automatically generate:
   - `icon-small.webp` (48x48)
   - `icon-medium.ico` (72, 96, 128, 256)
   - `icon-high.svg` (copy of source)
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)

3. **Verify the changes**:
   - Clear browser cache
   - Reinstall PWA if already installed
   - Check manifest at `/manifest.webmanifest`

### Alternative: Simple Text-Based Update
If creating the SVG is difficult, you can update the current icon to show "P" instead of "i":

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text 
    x="50" 
    y="50" 
    text-anchor="middle" 
    dominant-baseline="central" 
    font-family="Arial, sans-serif" 
    font-size="60" 
    font-weight="bold" 
    fill="#FFFFFF"
  >P</text>
</svg>
```

Then run the icon generation script.

## Additional Customization Options

### Update Header Logo on Dashboard
The dashboard header (in `src/app/page.tsx`) currently shows:
```tsx
<span className="text-xl font-bold text-white">i</span>
```

Consider updating this to use the gift box icon or "P" to match the new branding.

### Update Sign-in Page Icon
The sign-in page (in `src/app/auth/signin/page.tsx`) currently shows:
```tsx
<span className="text-2xl font-bold text-white">i</span>
```

Update this similarly to match the new branding.

## Theme Color Consideration

The current theme color is purple (`#7c3aed`). Review the brand design to see if this should be adjusted to match the new Privo.club aesthetic.
