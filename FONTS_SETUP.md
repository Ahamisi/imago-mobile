# Gilroy Font Setup Instructions

## 1. Download Gilroy Fonts
Download the following Gilroy font files and place them in `src/assets/fonts/`:
- Gilroy-Bold.ttf
- Gilroy-Regular.ttf  
- Gilroy-Medium.ttf
- Gilroy-Italic.ttf

## 2. iOS Setup
Add to `ios/ImagoMUm/Info.plist`:
```xml
<key>UIAppFonts</key>
<array>
    <string>Gilroy-Bold.ttf</string>
    <string>Gilroy-Regular.ttf</string>
    <string>Gilroy-Medium.ttf</string>
    <string>Gilroy-Italic.ttf</string>
</array>
```

## 3. Android Setup
Add to `android/app/src/main/assets/fonts/` folder (create if doesn't exist)
Copy all Gilroy font files there.

## 4. Metro Config
Update `metro.config.js` to include fonts:
```js
module.exports = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'ttf', 'otf'],
  },
};
```

## 5. React Native Link
Run: `npx react-native link`

For now, the app will use system fonts until Gilroy fonts are added. 