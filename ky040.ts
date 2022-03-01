const enum direction {
    //% block="↩️"
    clockwise = 2,
    //% block="↪️"
    counterclockwise = 4
}
let CLKPin = DigitalPin.P0;
let DTPin = DigitalPin.P1;
let EvCounter = 1
let SWPin = DigitalPin.P2;

//% weight=100 color=#0000bb icon="\uf1ce" blockId="KY-040"
namespace KY040 {

    const KYEventID = 3100;
    let lastPressed = 1;
    let pressedID = 5600;

    //% blockId=SetKy weight=100
    //% block="setKYPins CLK %CPin DT %DPin SW %EPin"
    //% block.loc.de="KY-040 Pins an CLK %CPin DT %DPin SW %EPin"
    //% CPin.defl=DigitalPin.C16  DPin.defl=DigitalPin.C17 EPin.defl=DigitalPin.P2
    //% CPin.fieldEditor="gridpicker" DPin.fieldEditor="gridpicker" EPin.fieldEditor="gridpicker"
    //% CPin.fieldOptions.columns=5 DPpin.fieldOptions.columns=5 EPin.fieldOptions.columns=5
    export function setKY040(CPin: DigitalPin, DPin: DigitalPin, EPin: DigitalPin): void {
        CLKPin = CPin;
        DTPin = DPin;
        SWPin=EPin;
        pins.setPull(CLKPin, PinPullMode.PullUp)
        pins.setPull(DTPin, PinPullMode.PullUp)
        pins.onPulsed(CLKPin, PulseValue.High, function () {
            RotaryEncoder()
        })
        pins.onPulsed(CLKPin, PulseValue.Low, function () {
            RotaryEncoder()
        })
    }

    //% pin.fieldEditor="gridpicker" weight=90
    //% pin.fieldOptions.columns=2
    //% blockId=onTurned block="on turned in direction %direction"
    //% block.loc.de="wenn in Richtung %direction gedreht"
    export function onTurned(Richtung: direction, handler: () => void) {
        control.onEvent(KYEventID + Richtung, 0, handler);
    }


    //% blockId=onPressEvent block="on KY040 pressed"
    //% block.loc.de="wenn KY040 gedrückt"
    //% EPin.defl = DigitalPin.P2
    //% EPin.fieldEditor="gridpicker"
    //% EPin.fieldOptions.columns=5 
    export function onPressEvent(handler: () => void) {
        pins.setPull(SWPin, PinPullMode.PullUp)
        control.onEvent(pressedID, 0, handler);
        control.inBackground(() => {
            while (true) {
                const pressed = pins.digitalReadPin(SWPin);
                if (pressed != lastPressed) {
                    lastPressed = pressed;
                    serial.writeLine("P")
                    if (pressed == 0) control.raiseEvent(pressedID, 0);
                }
                basic.pause(50);
            }
        })
    }


    function RotaryEncoder() {
        CLKAKTUELL = pins.digitalReadPin(CLKPin)
        if (CLKAKTUELL != CLKLETZTE) {
            if (pins.digitalReadPin(DTPin) != CLKAKTUELL) {
                Richtung = 1
            } else {
                Richtung = 0
            }
            EvCounter += 1
            if (EvCounter % 2 == 0) { // kill every second Event            
                if (Richtung == 1) {
                    serial.writeLine("counterclockwise")
                    control.raiseEvent(KYEventID + direction.clockwise, direction.clockwise);
                } else {
                    serial.writeLine("clockwise")
                    control.raiseEvent(KYEventID + direction.counterclockwise, direction.counterclockwise);
                }
            }
            CLKLETZTE = CLKAKTUELL
        }
    }
    let Richtung = 1
    let CLKAKTUELL = 0
    let CLKLETZTE = 0
}