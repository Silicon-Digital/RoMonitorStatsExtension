EXT_PATH=./RoMonitorStatsExtensionChrome

mkdir $EXT_PATH
mkdir $EXT_PATH/src

cp ./manifest.chrome.json $EXT_PATH/manifest.json
cp -r ./dist $EXT_PATH/dist
cp -r ./_locales $EXT_PATH/_locales
cp -r ./src/options $EXT_PATH/src/options
cp ./src/RomonitorLogo.png $EXT_PATH/src/RomonitorLogo.png
cp ./romonitor.css $EXT_PATH/romonitor.css
cp ./icon* $EXT_PATH/

# Remove old zip file and create a new one
rm RoMonitorChromeExtension.zip
zip -r RoMonitorChromeExtension.zip RoMonitorStatsExtensionChrome

# Clean up folder
rm -r $EXT_PATH
