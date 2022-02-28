const enum direction {
    //% block="↩️"
    clockwise = 2,
    //% block="↪️"
    counterclockwise = 4
}
let CLKPin = DigitalPin.P0;
let DTPin = DigitalPin.P1;
let EvCounter = 1
let dsw = DigitalPin.P2;
let lastPressed = 1;
let pressedID = 5600;

//% weight=100 color=#0000bb icon="\uf1ce" blockId="KY-040"
namespace KY040 {

    const KYEventID = 3100;

    //% blockId=SetKy weight=100
    //% block="setKYPins CLK %CPin DT %DPin"
    //% block.loc.de="KY-040 Pins an CLK %CPin DT %DPin"
    //% CPin.defl=DigitalPin.C16  DPin.defl=DigitalPin.C17
    //% CPin.fieldEditor="gridpicker" DPin.fieldEditor="gridpicker"
    //% CPin.fieldOptions.columns=5 DPpin.fieldOptions.columns=5
    export function setKY040(CPin: DigitalPin, DPin: DigitalPin): void {
        CLKPin = CPin;
        DTPin = DPin;
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
        control.onEvent(KYEventID + Richtung, Richtung, handler);
    }


    //% blockId=onPressEvent block="on SW at pin %EPin|pressed"
    //% block.loc.de="wenn SW an Pin %EPin|gedrückt"
    //% EPin.defl = DigitalPin.C16
    //% EPin.fieldEditor="gridpicker"
    //% EPin.fieldOptions.columns=5 
    export function onPressEvent(EPin: DigitalPin, handler: () => void): void {
        dsw = EPin;
        pins.setPull(dsw, PinPullMode.PullUp)
        control.onEvent(pressedID, 0, handler);
        control.inBackground(() => {
            while (true) {
                const pressed = pins.digitalReadPin(dsw);
                if (pressed != lastPressed) {
                    lastPressed = pressed;
                    //serial.writeLine("P")
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
                    //serial.writeLine("counterclockwise")
                    control.raiseEvent(KYEventID + direction.clockwise, direction.clockwise);
                } else {
                    //serial.writeLine("clockwise")
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