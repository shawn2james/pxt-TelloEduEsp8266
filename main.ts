TelloControl.flipInDirection(null)
namespace TelloControl {

    // Initialize the connection variables
    let telloIP = "192.168.10.1";
    let commandPort = 8889;
    let isConnected = false; // flag to check if connected previously

    // Function to read and display response on the micro:bit
    function readResponse(): void {
        let response = serial.readString();
        if (response.includes("OK")) {
            if (!isConnected) {
                basic.showString("Connected");
                let isConnected2 = true;
            }
        } else {
            basic.showString("Failed");
            basic.showString(response); // Display the actual error
        }
    }

    // Will only work after you connect to WiFi (connectToWifi function)
    function sendCommandToTello(command: string): void {
        sendAT(`AT+CIPSEND=${command.length}`, 500);  // Send command length and command
        serial.writeString(command + "\r\n"); // Send the actual command
        basic.pause(500);
        readResponse(); // Display Tello's response
    }

    function sendAT(command: string, wait: number = 0) {
        serial.writeString(`${command}\u000D\u000A`);
        basic.pause(wait);
    }

    function setupUDPConnection(): void {
        sendAT(`AT+CIPSTART="UDP","${telloIP}",${commandPort}`, 500);
        basic.pause(500); // Allow some time for connection setup
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

    //% blockId=flip_direction_enum block="Flip Direction"
    //% enum
    enum FlipDirection {
        //% block="Forward"
        Forward = "f",
        //% block="Backward"
        Backward = "b",
        //% block="Left"
        Left = "l",
        //% block="Right"
        Right = "r"
    }

    //% block="Flip in direction %direction"
    //% group="Maneuvers"
    export function flipInDirection(direction: FlipDirection): void {
        sendCommandToTello(`flip ${direction}`);
    }

    //% block="Emergency Stop"
    //% group="Maneuvers"
    export function emergency(): void {
        sendCommandToTello("emergency");
    }

    //% block="Move Right $x cm"
    //% group="Maneuvers"
    export function right(x: number): void {
        sendCommandToTello(`right ${x}`);
    }

    //% block="Move Left $x cm"
    //% group="Maneuvers"
    export function left(x: number): void {
        sendCommandToTello(`left ${x}`);
    }

    //% block="Move Back $x cm"
    //% group="Maneuvers"
    export function back(x: number): void {
        sendCommandToTello(`back ${x}`);
    }

    //% block="Move Forward $x cm"
    //% group="Maneuvers"
    export function forward(x:number): void {
        sendCommandToTello(`forward ${x}`);
    }

    //% block="Go to $x $y $z at $speed"
    //% group="Maneuvers"
    export function goTo(x:number, y:number, z:number, speed:number): void {
        sendCommandToTello(`go ${x} ${y} ${z} ${speed}`);
    }

    //% block="Rotate clockwise $deg degrees"
    //% group="Maneuvers"
    export function rotatecw(deg: number): void {
        sendCommandToTello(`cw ${deg}`);
    }

    //% block="Rotate anti-clockwise $deg degrees"
    //% group="Maneuvers"
    export function rotateccw(deg: number): void {
        sendCommandToTello(`ccw ${deg}`);
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

    //% block="Stop"
    //% group="Maneuvers"
    export function stop(): void {
        sendCommandToTello("stop");
    }

    //% block="Wi-Fi connected"
    //% group="Connection"
    export function isWiFiConnected(): boolean {
        sendAT("AT+CWJAP?"); // Checks the current Wi-Fi status
        basic.pause(500); // Give time to get the response
        let response2 = serial.readString(); // Read response from ESP8266
        if (response2.includes("No AP")) {
            return false; // Not connected
        } else if (response2.includes("OK") || response2.includes("Connected")) {
            return true; // Connected
        } else {
            return false; // In case of other unexpected responses
        }
    }

    // Connect to Tello Wi-Fi (1st block to use)
    //% group="Connection"
    //% block="Connect to Tello Wi-Fi SSID %ssid"
    export function connectToWiFi(ssid: string): void {
        setupUDPConnection(); // Set up UDP connection first between the devices
        sendAT(`AT+CWJAP="${ssid}",""`, 5000); // Assuming no password is required
        readResponse(); // Display response on micro:bit
        setupUDPConnection(); // Set up UDP connection again
    }

    // Initialize Tello to receive commands  (2nd block to use)
    //% block="Initialize Tello into SDK mode"
    //% group="Connection"
    export function initialize(): void {
        sendCommandToTello("command");
    }
}
