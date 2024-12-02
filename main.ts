//% color=#126180 icon="\uf0fb" block="Tello Drone Control"
//% groups="['Connection', 'Maneuvers']"
namespace TelloControl {

    // Initialize the connection variables
    let telloIP = "192.168.10.1";
    let commandPort = 8889;

    // Function to read and display response on the micro:bit
    function readResponse(): void {
        let response = serial.readString();
        if (response.includes("OK")) {
            basic.showString("Connected");
        } else {
            basic.showString("Failed");
            basic.showString(response); // Display the actual error
        }
    }

    function sendCommandToTello(command: string): void {

        // Will only work after you connect to WiFi (connectToWifi function)
        sendAT(`AT+CIPSEND=${command.length}`, 500);  // Send command length and command
        serial.writeString(command + "\r\n"); // Send the actual command
        basic.pause(500);
        readResponse(); // Display Tello's response
    }

    function sendAT(command: string, wait: number = 0) {
        serial.writeString(`${command}\u000D\u000A`);
        basic.pause(wait);
    }

    // Function to initialize ESP8266 and redirect serial communication
    //% block="Initialize ESP8266 with TX %tx| RX %rx"
    //% group="Connection"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    export function initESP8266(tx: SerialPin, rx: SerialPin): void {
        serial.redirect(tx, rx, BaudRate.BaudRate115200); // Redirect TX and RX
        basic.pause(100);
        serial.setTxBufferSize(128);
        serial.setRxBufferSize(128);
        sendAT("AT+RST", 2000); // Reset the ESP8266
        sendAT("AT+CWMODE=1", 500); // Set ESP8266 to Station Mode (STA mode)
    }

    //% block="Flip"
    //% group="Maneuvers"
    export function flip(): void {
        sendCommandToTello("flip b");
    }

    //% block="Emergency Stop"
    //% group="Maneuvers"
    export function emergency(): void {
        sendCommandToTello("emergency");
    }

    //% block="Move right"
    //% group="Maneuvers"
    export function right(): void {
        sendCommandToTello("right");
    }

    //% block="Move Left"
    //% group="Maneuvers"
    export function left(): void {
        sendCommandToTello("left");
    }

    //% block="Move Back"
    //% group="Maneuvers"
    export function back(): void {
        sendCommandToTello("back");
    }

    //% block="Move Forward"
    //% group="Maneuvers"
    export function forward(): void {
        sendCommandToTello("forward");
    }

    //% block="Land"
    //% group="Maneuvers"
    export function land(): void {
        sendCommandToTello("land");
    }

    //% block="Takeoff"
    //% group="Maneuvers"
    export function takeOff(): void {
        sendCommandToTello("takeoff");
    }

    //% block="Wi-Fi connected"
    //% group="Connection"
    export function isWiFiConnected(): boolean {
        sendAT("AT+CWJAP?"); // Checks the current Wi-Fi status
        basic.pause(500); // Give time to get the response
        let response = serial.readString(); // Read response from ESP8266
        if (response.includes("No AP")) {
            return false; // Not connected
        } else if (response.includes("OK") || response.includes("Connected")) {
            return true; // Connected
        } else {
            return false; // In case of other unexpected responses
        }
    }

    // Connect to Tello Wi-Fi (1st block to use)
    //% group="Connection"
    //% block="connect to Tello Wi-Fi SSID %ssid"
    export function connectToWiFi(ssid: string): void {
        setupUDPConnection(); // Run once
        sendAT(`AT+CWJAP="${ssid}",""`, 5000); // Assuming no password is required
        readResponse(); // Display response on micro:bit
    }
    
    // Seting up UDP connection (2nd block to use)
    //% group="Connection"
    //% block="Set up UDP connection"
    export function setupUDPConnection(): void {
        sendAT(`AT+CIPSTART="UDP","${telloIP}",${commandPort}`, 500);
        basic.pause(500); // Allow some time for connection setup
    }
    
    //% block="Initialize Tello into SDK mode (3rd block to use)"
    //% group="Connection"
    export function initialize(): void {
        sendCommandToTello("command");
    }
}