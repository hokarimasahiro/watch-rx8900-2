function soundRecvProc (recvData: string) {
    if (recvData.includes("A")) {
        plotLED()
        watchfont.showIcon(
        "01110",
        "10001",
        "11111",
        "10001",
        "10001"
        )
        vibration()
        clearLED()
    } else if (recvData.includes("B")) {
        plotLED()
        watchfont.showIcon(
        "11110",
        "10001",
        "11110",
        "10001",
        "11110"
        )
        vibration()
        clearLED()
    }
}
function vibration () {
    pins.digitalWritePin(DigitalPin.P2, 1)
    basic.pause(200)
    pins.digitalWritePin(DigitalPin.P2, 0)
}
function controllerInit () {
    radioGroup = Math.abs(control.deviceSerialNumber()) % 98 + 1
    watchfont.showNumber2(radioGroup)
    radio.setTransmitPower(7)
    ledInit()
}
function rtcSettingProc (timeData: string[]) {
    rtc.setClockData(clockData.year, parseFloat(timeData[1]))
    rtc.setClockData(clockData.month, parseFloat(timeData[2]))
    rtc.setClockData(clockData.day, parseFloat(timeData[3]))
    rtc.setClockData(clockData.hour, parseFloat(timeData[4]))
    rtc.setClockData(clockData.minute, parseFloat(timeData[5]))
    rtc.setClockData(clockData.second, parseFloat(timeData[6]))
    rtc.setClock()
}
function plotLED () {
    strip.showColor(neopixel.colors(NeoPixelColors.Orange))
    strip.show()
}
function controllerProc () {
    radio.setGroup(radioGroup)
    if (input.buttonIsPressed(Button.A)) {
        Y = Math.constrain(input.rotation(Rotation.Pitch) * -10, -512, 512)
        X = Math.constrain(input.rotation(Rotation.Roll) * 10, -512, 512)
    } else {
        X = 0
        Y = 0
    }
    radio.sendString("$," + X + "," + Y)
    getButtonNo()
    strip.showColor(color[buttonNo])
    strip.show()
    radio.sendNumber(buttonNo)
    radio.setGroup(0)
    basic.pause(50)
}
function clockProc () {
    basic.pause(100)
    rtc.getClock()
    if (saveSecond != rtc.getClockData(clockData.second)) {
        saveSecond = rtc.getClockData(clockData.second)
        saveMillisecond = input.runningTime()
    }
    milliSecond = input.runningTime() - saveMillisecond
    if (rtc.getClockData(clockData.minute) == 0 && rtc.getClockData(clockData.second) == 0) {
        pins.digitalWritePin(DigitalPin.P2, 1)
        basic.pause(200)
        pins.digitalWritePin(DigitalPin.P2, 0)
        basic.pause(800)
    }
    if (input.buttonIsPressed(Button.A)) {
        basic.clearScreen()
        diplayTime(1)
    } else if (input.buttonIsPressed(Button.B)) {
        displaySecondData()
    } else if (input.logoIsPressed()) {
        diplayTime(1)
    } else {
        rotateDisplay()
        for (let counter = 0; counter <= 4; counter++) {
            watchfont.unplot(2, counter)
        }
        watchfont.showSorobanNumber(rtc.getClockData(clockData.hour), 0, 2)
        watchfont.showSorobanNumber(rtc.getClockData(clockData.minute), 3, 2)
        if (milliSecond < 500) {
            if (rtc.getClockData(clockData.second) >= 50) {
                watchfont.plot(2, 0)
            } else if (rtc.getClockData(clockData.second) >= 40) {
                watchfont.plot(2, 1)
            } else if (rtc.getClockData(clockData.second) >= 30) {
                watchfont.plot(2, 2)
            } else if (rtc.getClockData(clockData.second) >= 20) {
                watchfont.plot(2, 3)
            } else if (rtc.getClockData(clockData.second) >= 10) {
                watchfont.plot(2, 4)
            } else {
                watchfont.plot(2, 1)
                watchfont.plot(2, 3)
            }
        }
    }
    getButtonNo()
    if (buttonNo == 1) {
        sendTimeData()
    }
}
function clearLED () {
    strip.showColor(neopixel.colors(NeoPixelColors.Black))
    strip.show()
}
function soundProc () {
    if (input.buttonIsPressed(Button.A)) {
        radio.sendString("A")
        while (input.buttonIsPressed(Button.A)) {
        	
        }
    }
    if (input.buttonIsPressed(Button.B)) {
        radio.sendString("B")
        while (input.buttonIsPressed(Button.B)) {
        	
        }
    }
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        basic.pause(100)
        music.play(music.tonePlayable(3000, music.beat(BeatFraction.Quarter)), music.PlaybackMode.UntilDone)
        while (pins.digitalReadPin(DigitalPin.P8) == 0) {
        	
        }
    }
}
function diplayTime (displayType: number) {
    sendTimeData()
    if (displayType == 0) {
        rotateDisplay()
        for (let counter2 = 0; counter2 <= 4; counter2++) {
            watchfont.unplot(2, counter2)
        }
        watchfont.showNumber2(rtc.getClockData(clockData.hour))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(200)
        watchfont.showNumber2(rtc.getClockData(clockData.minute))
        basic.pause(1000)
        basic.clearScreen()
        basic.pause(500)
    } else if (displayType == 1) {
        basic.showString("" + rtc.getClockData(clockData.hour) + ":" + rtc.getClockData(clockData.minute))
    }
}
function sountInit () {
    radio.setGroup(33)
    ledInit()
}
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    serialData = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    if (serialData.charAt(0) == "g") {
        sendTimeData()
    } else if (serialData.charAt(0) == "s") {
        rtcSettingProc(serialData.split(","))
    }
})
function rotateDisplay () {
    if (input.rotation(Rotation.Pitch) <= -40) {
        watchfont.setRotatation(rotate.down)
    } else {
        watchfont.setRotatation(rotate.up)
    }
    if (input.rotation(Rotation.Roll) < -75) {
        watchfont.setRotatation(rotate.right)
    } else if (input.rotation(Rotation.Roll) > 75) {
        watchfont.setRotatation(rotate.left)
    }
}
function clockINit () {
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
    pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
    ledInit()
    rtc.getClock()
    saveSecond = rtc.getClockData(clockData.second)
    diplayTime(1)
}
radio.onReceivedString(function (receivedString) {
    if (TYPE == 1) {
        if (radio.receivedPacket(RadioPacketProperty.SignalStrength) >= -70) {
            recvData = receivedString.split(",")
            if (recvData[0] == "CQ") {
                radio.sendString("" + recvData[1] + "," + control.deviceName() + "," + convertToText(radioGroup))
            }
        }
    } else if (TYPE == 2) {
        soundRecvProc(receivedString)
    }
})
function getButtonNo () {
    buttonNo = 0
    if (pins.digitalReadPin(DigitalPin.P8) == 0) {
        buttonNo += 1
    }
    if (pins.digitalReadPin(DigitalPin.P12) == 0) {
        buttonNo += 2
    }
    if (pins.digitalReadPin(DigitalPin.P13) == 0) {
        buttonNo += 4
    }
    if (input.isGesture(Gesture.Shake)) {
        buttonNo = 6
    }
}
function ledInit () {
    strip = neopixel.create(DigitalPin.P1, 4, NeoPixelMode.RGB)
    strip.setBrightness(32)
    color = [
    neopixel.colors(NeoPixelColors.Black),
    neopixel.colors(NeoPixelColors.Red),
    neopixel.colors(NeoPixelColors.Green),
    neopixel.colors(NeoPixelColors.Blue),
    neopixel.colors(NeoPixelColors.Yellow),
    neopixel.colors(NeoPixelColors.Violet),
    neopixel.colors(NeoPixelColors.White),
    neopixel.colors(NeoPixelColors.Orange)
    ]
}
function displaySecondData () {
    rotateDisplay()
    watchfont.showNumber2(rtc.getClockData(clockData.second))
}
function sendTimeData () {
    rtc.getClock()
    serial.writeNumbers([
    rtc.getClockData(clockData.year),
    rtc.getClockData(clockData.month),
    rtc.getClockData(clockData.day),
    rtc.getClockData(clockData.weekday),
    rtc.getClockData(clockData.hour),
    rtc.getClockData(clockData.minute),
    rtc.getClockData(clockData.second)
    ])
}
let recvData: string[] = []
let serialData = ""
let milliSecond = 0
let saveMillisecond = 0
let saveSecond = 0
let buttonNo = 0
let color: number[] = []
let X = 0
let Y = 0
let strip: neopixel.Strip = null
let radioGroup = 0
let TYPE = 0
pins.digitalWritePin(DigitalPin.P2, 0)
pins.setPull(DigitalPin.P5, PinPullMode.PullUp)
pins.setPull(DigitalPin.P11, PinPullMode.PullUp)
pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
TYPE = 1 - pins.digitalReadPin(DigitalPin.P5)
TYPE += (1 - pins.digitalReadPin(DigitalPin.P11)) * 2
watchfont.showNumber2(TYPE)
while (pins.digitalReadPin(DigitalPin.P5) == 0 || pins.digitalReadPin(DigitalPin.P11) == 0) {
	
}
if (TYPE == 1) {
    controllerInit()
} else if (TYPE == 2) {
    sountInit()
} else {
    clockINit()
}
serial.redirectToUSB()
basic.forever(function () {
    if (TYPE == 1) {
        controllerProc()
    } else if (TYPE == 2) {
        soundProc()
    } else {
        clockProc()
    }
})
