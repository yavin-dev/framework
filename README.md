# Navi GitHub Pages
Github pages for the navi app

#### Update Steps
1. Enable mirage in app

2. Build the app with environment=production flag set

`ember build --environment=production`

2. Update /assets with
    * navi-app.js
    * navi-app.css
    * vendor.js
    * vendor.css

3. Update index.html script tags with the new assets
