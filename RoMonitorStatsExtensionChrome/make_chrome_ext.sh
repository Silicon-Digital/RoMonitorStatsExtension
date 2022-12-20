# Remove old folder (if exists)
EXT_PATH=./RoMonitorStatsExtensionChrome

rm -r $EXT_PATH

mkdir $EXT_PATH
mkdir $EXT_PATH/src

cp ./manifest.chrome.json $EXT_PATH/manifest.json
cp ./dist $EXT_PATH/dist
cp ./_locales $EXT_PATH/_locales
cp ./src/options $EXT_PATH/src/options
cp ./src/RoMonitorLogo.png $EXT_PATH/RoMonitorLogo.png
cp ./romonitor.css $EXT_PATH/romonitor.css

zip -r RoMonitorChromeExtension.zip RoMonitorStatsExtensionChrome

rm -r $EXT_PATH
