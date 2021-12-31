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
      device: null,
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

  onClick() {
    switch (this.state.currentStatus) {
      case Idle:
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
            // Getting Battery Service…
            return server.getPrimaryService('battery_service');
          })
          .then(service => {
            // Getting Battery Level Characteristic…
            return service.getCharacteristic('battery_level');
          })
          .then(characteristic => {
            // Reading Battery Level…
            return characteristic.readValue();
          })
          .then(value => {
            this.log(`Battery percentage is ${value.getUint8(0)}`);
            this.cleanup()
          })
          .catch(error => {
             this.errorLog(`Web Bluetooth error:\n ${error}`);
             this.cleanup();
           });
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
