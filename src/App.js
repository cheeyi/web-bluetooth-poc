import './App.css';
import LogView from './LogView';
import React from 'react';

const Idle = Symbol("Idle");
const Scanning = Symbol("Scanning");
const Connecting = Symbol("Connecting");

class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStatus: Idle,
      logEvents: [{date: this.currentDate(), content: 'Beginning of log'}]
    }
  }

  render() {
    return (
      <div className='App-container'>
        <div className='Text-header'>
          Web Bluetooth POC
        </div>
        <div className="status-container">
          Status: {this.state.currentStatus.description}
        </div>
        <div>
          <button onClick={() => this.onClick()} className='Action-button'>
            Click Me!
          </button>
          <button
            onClick={() => this.setState({logEvents: [{date: this.currentDate(), content: 'Beginning of log'}]})}
            className='Action-button'
            >
              Clear Logs
          </button>
        </div>
        <LogView logContent={this.state.logEvents} />
      </div>
    );
  }

  componentDidMount() {
    this.checkBluetoothAvailability();
  }

  onClick() {
    switch (this.state.currentStatus) {
      case Idle:
        this.startScan();
        break;
      case Scanning:
        break;
      case Connecting:
        break;
    }
  }

  cleanup() {
    this.log("Performing cleanup");
    if (this.device && this.device.gatt.connected) {
      this.log(`Disconnecting from ${this.device.name}`);
      this.device.gatt.disconnect();
      this.device = null;
    }
    this.setState({currentStatus: Idle});
  }

  checkBluetoothAvailability() {
    if (!navigator.bluetooth) {
      this.errorLog("Bluetooth capability not available. Make sure your device supports Bluetooth and that you're accessing the web app via HTTPS");
      return;
    }
    navigator.bluetooth.getAvailability().then(isAvailable => {
      if (isAvailable) {
        this.log("Bluetooth is available");
      } else {
        this.errorLog("Bluetooth capability not available or user rejected permission");
      }
    });
  }

  startScan() {
    if (!navigator.bluetooth) {
      this.errorLog("Cannot start scan, Bluetooth not supported!");
      return;
    }
    this.log("Starting a BLE scan");
    this.setState({currentStatus: Scanning});
    navigator.bluetooth.requestDevice({
      filters: [{
        services: ['environmental_sensing'],
      }],
      optionalServices: ['battery_service'],
    })
    .then(device => {
      this.log(`User confirmed ${device.name}, attempting to connect`);
      this.setState({currentStatus: Connecting});
      return device.gatt.connect();
    })
    .then(server => {
      this.device = server.device;
      return server.getPrimaryService('battery_service');
    })
    .then(service => service.getCharacteristic('battery_level'))
    .then(characteristic => characteristic.readValue())
    .then(value => {
      this.log(`Battery percentage is ${value.getUint8(0)}%`);
      this.cleanup();
    })
    .catch(error => {
      this.errorLog(`Web Bluetooth error:\n ${error}`);
      this.cleanup();
    });
  }

  log(toLog) {
    console.log(toLog);
    const currentEvents = this.state.logEvents.slice();
    this.setState({logEvents: currentEvents.concat({date: this.currentDate(), content: toLog})});
  }

  errorLog(toLog) {
    const errorDescription = `ERROR:\n ${toLog}`;
    console.error(errorDescription);
    const currentEvents = this.state.logEvents.slice();
    this.setState({logEvents: currentEvents.concat({date: this.currentDate(), content: errorDescription})});
  }

  currentDate() {
    return new Date().toLocaleString();
  }
}

function App() {
  return (
    <div className="App">
      <AppContainer />
    </div>
  );
}

export default App;
