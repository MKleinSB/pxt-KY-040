
const enum direction {
    //% block="↩️"
    clockwise = 2,
    //% block="↪️"
    counterclockwise = 4
}

let CLKPin = DigitalPin.P0;
let DTPin = DigitalPin.P1;

//% weight=100 color=#0000bb icon="\uf1ce" blockId="KY-040"
namespace KY040 {

    const KYEventID = 3100;

    //% pin.fieldEditor="gridpicker" 
    //% pin.fieldOptions.columns=2
    //% blockId=onTurned block="on turned in direction %direction"
    //% block.loc.de="wenn in Richtung %direction gedreht"
    export function onTurned(Richtung: direction, handler: () => void) {
        control.onEvent(KYEventID + Richtung, Richtung, handler);

    }

    //% blockId=turnedInDirection
    //% block="turned in direction %Tdirect"
    //% block.loc.de="in Richtung %Tdirect gedreht"
    //% Tdirect.fieldEditor="gridpicker" Tdirect.fieldOptions.columns=2
    export function turnedInDirection(Tdirect: direction): boolean {
        CLKAKTUELL = pins.digitalReadPin(CLKPin)
        if (CLKAKTUELL != CLKLETZTE) {
            if (pins.digitalReadPin(DTPin) != CLKAKTUELL) {
                Richtung = 1
            } else {
                Richtung = 0
            }
            CLKLETZTE = CLKAKTUELL

            if ((Richtung == 1)){
                if (Tdirect==direction.counterclockwise) {
                    serial.writeLine("counterclockwise")
                    return true
                }
                
            } else {
                if (Tdirect == direction.clockwise) {
                    serial.writeLine("clockwise")
                    return true
                }
           }
            
        }
        return false;
    }

    function RotaryEncoder() {
        CLKAKTUELL = pins.digitalReadPin(CLKPin)
        if (CLKAKTUELL != CLKLETZTE) {
            if (pins.digitalReadPin(DTPin) != CLKAKTUELL) {
                Richtung = 1
            } else {
                Richtung = 0
            }
            serial.writeLine("turn recognized: ")
            if (Richtung == 1) {
                serial.writeLine("counterclockwise")
                control.raiseEvent(KYEventID + direction.counterclockwise, direction.counterclockwise);                
            } else {
                serial.writeLine("clockwise")
                control.raiseEvent(KYEventID + direction.clockwise, direction.clockwise);               
            }
            CLKLETZTE=CLKAKTUELL
        }
    }
    pins.onPulsed(CLKPin, PulseValue.High, function () {
        RotaryEncoder()
    })
    pins.onPulsed(CLKPin, PulseValue.Low, function () {
        RotaryEncoder()
    })

    //% blockId=SetKy 
    //% block="setKYPins Clock %CPin DT %DPin"
    //% block.loc.de="KY-040 Pins an Clock %CPin DT %DPin"
    //% CPin.defl=DigitalPin.C16  DPin.defl=DigitalPin.C17
    export function setKY040(CPin: DigitalPin, DPin: DigitalPin): void {
        CLKPin = CPin;
        DTPin = DPin;
        pins.setPull(CLKPin, PinPullMode.PullUp)
        pins.setPull(DTPin, PinPullMode.PullUp)
    }

    let Richtung = 1
    let CLKAKTUELL = 0
    let CLKLETZTE = 0


}