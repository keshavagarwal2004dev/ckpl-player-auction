# Favicon Update Instructions

## Current Status
The HTML has been updated to reference the new favicon files. Now you need to add the CHRIST University logo as the favicon.

## Steps to Complete Favicon Replacement:

### 1. Save the Logo Image
1. Save the CHRIST University Physical Education Department logo image you attached
2. Name it `ckpl-logo.png`

### 2. Generate Favicon Files
You need to create multiple sizes for different devices. Use one of these methods:

**Method A: Online Favicon Generator (Easiest)**
1. Go to https://realfavicongenerator.net/
2. Upload the `ckpl-logo.png` image
3. Download the generated package
4. Extract these files to the `public/` folder:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

**Method B: Manual Creation**
If you have image editing software (Photoshop, GIMP, etc.):

1. Create a square version of the logo (512x512px recommended)
2. Generate these sizes:
   - **favicon.ico**: 16x16, 32x32, 48x48 (multi-size ICO file)
   - **favicon-16x16.png**: 16x16px PNG
   - **favicon-32x32.png**: 32x32px PNG
   - **apple-touch-icon.png**: 180x180px PNG

3. Save all files to: `c:\Users\kesh2\OneDrive\Desktop\sports\ckpl-player-auction\public\`

### 3. Replace Existing Files
Copy the new favicon files to the `public/` directory, replacing:
```
public/
├── favicon.ico (replace)
├── favicon-16x16.png (new)
├── favicon-32x32.png (new)
└── apple-touch-icon.png (new)
```

### 4. Verify Installation
After adding the files:
1. Run `npm run build`
2. Clear browser cache (Ctrl + Shift + Delete)
3. Refresh the page
4. Check the browser tab for the new CHRIST University logo

## Quick PowerShell Command to Check Files
```powershell
Get-ChildItem "c:\Users\kesh2\OneDrive\Desktop\sports\ckpl-player-auction\public" | Where-Object {$_.Name -like "favicon*" -or $_.Name -like "apple*"}
```

## What's Already Done ✅
- ✅ HTML updated with proper favicon references
- ✅ Multiple sizes configured for different devices
- ✅ Apple touch icon support added

## What You Need to Do
- [ ] Save the CHRIST University logo as PNG
- [ ] Generate favicon files (use online generator recommended)
- [ ] Copy files to `public/` folder
- [ ] Rebuild and test

---

**Recommended Tool:** https://realfavicongenerator.net/  
**Current Logo:** CHRIST University Kengeri Physical Education Department badge (gold circular design)
