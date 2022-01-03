# Web Bluetooth POC

A React web app that uses Web Bluetooth to scan for a Bluetooth device advertising the Environmental Sensing GATT service, connects to it, reads a value from the device's Battery Service's Battery Level GATT characteristic, logs it, and disconnects from the device. Obviously, this is a very specific use case, but one can easily change these by modifying `src/App.js` to scan for a different GATT service instead.

To take a quick peek at the web app, visit https://cheeyi.github.io/web-bluetooth-poc/, which was deployed from the `main` branch and lives on the `gh-pages` branch.

## Running the Web App Locally

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the root directory of the project:

1. Run `npm install` to install dependencies.
2. Run `npm start` to build and run the app in the development mode.
3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser (Chromium-based browsers preferred).

The page will reload when you make changes.

## Deploying to GitHub Pages

1. Open `package.json` and update `homepage` to point to your GitHub profile and repo name.
2. Run `npm run deploy`.

## Main Limitations

It's important to realize that the [Web Bluetooth specification](https://webbluetoothcg.github.io/web-bluetooth) has not been finalized yet. However, here are some limitations I've come across:

* Web Bluetooth's API availability is determined by your browser vendor. For example, Safari doesn't support Web Bluetooth because [Apple declined to implement it](https://www.zdnet.com/article/apple-declined-to-implement-16-web-apis-in-safari-due-to-privacy-concerns/).
* It's possible to scan for all BLE devices in the vicinity if one specifies `acceptAllDevices: true` in the `requestDevice` call, but only GATT services specified in the `optionalServices: []` key can be interacted with. This means that we'll not be able to do anything with a device if we don't know (or didn't guess correctly) what GATT services a device has beforehand.
* Web Bluetooth requires the user to explicitly select a device using a pop-up browser prompt. Depending on your app's use case, this may or may not be a dealbreaker.
* Some APIs have yet to be fully implemented, such as `getDevices()` as of the time of writing. Check out the [Implementation Status](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md) page for updated information.

## Resources

* [React tutorial](https://reactjs.org/tutorial/tutorial.html)
* [Web Bluetooth specification](https://webbluetoothcg.github.io/web-bluetooth)
* [Web Bluetooth examples](https://web.dev/bluetooth)
* [Type definition for Web Bluetooth](https://www.npmjs.com/package/@types/web-bluetooth)
