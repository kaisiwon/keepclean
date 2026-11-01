/**
 * Student Micro:bit - KeepClean
 * Platform: BBC micro:bit (MakeCode JavaScript / Static TypeScript)
 *
 * Controls:
 * - Button A: Mark the current cleaning section as checked & cleaned,
 *             increment the cleaned counter, and notify the Teacher Micro:bit via radio.
 * - Button B: Cycle through cleaning sections (1 to TOTAL_SECTIONS).
 * - Button A+B: Display the total number of sections checked and cleaned.
 */

const RADIO_GROUP = 1
const TOTAL_SECTIONS = 1

let currentSection = 1
let sectionsCleanedCount = 0
let cleanedSections: number[] = []

basic.showString("Student")

function isSectionCleaned(section: number): boolean {
    return cleanedSections.indexOf(section) !== -1
}

function showCurrentSection(): void {
    basic.showNumber(currentSection)
}

input.onButtonPressed(Button.B, function () {
    currentSection += 1
    if (currentSection > TOTAL_SECTIONS) {
        currentSection = 1
    }
    showCurrentSection()
})

// Button A: Check and clean the current section, increment counter, and send via radio
input.onButtonPressed(Button.A, function () {
    if (!isSectionCleaned(currentSection)) {
        // Record section as cleaned and increment counter
        cleanedSections.push(currentSection)
        sectionsCleanedCount += 1

        // Notify the Teacher Micro:bit via radio
        radio.sendValue("clean", currentSection)
        radio.sendValue("count", sectionsCleanedCount)

        // Visual feedback: checkmark followed by updated counter
        basic.showIcon(IconNames.Yes)
        music.play(music.stringPlayable("C C C E A B G C", 240), music.PlaybackMode.UntilDone)
        basic.pause(500)
        basic.showNumber(sectionsCleanedCount)
    } else {
        // Section was already checked and cleaned; show status and current counter
        basic.showIcon(IconNames.SmallDiamond)
        basic.pause(300)
        basic.showNumber(sectionsCleanedCount)
    }
})

// Button A+B: View the current count of sections checked and cleaned
input.onButtonPressed(Button.AB, function () {
    basic.showString("C:")
    basic.showNumber(sectionsCleanedCount)
    basic.pause(500)
    showCurrentSection()
})

// Handle incoming radio messages from the Teacher Micro:bit
radio.onReceivedValue(function (name: string, value: number) {
    if (name === "reset" && value === 1) {
        // Reset session state when instructed by the Teacher Micro:bit
        sectionsCleanedCount = 0
        cleanedSections = []
        currentSection = 1
        basic.showIcon(IconNames.No)
        basic.pause(500)
        showCurrentSection()
    } else if (name === "ack" && value === currentSection) {
        // Brief confirmation that the Teacher Micro:bit logged the section
        basic.showIcon(IconNames.Heart)
        basic.pause(400)
        basic.showNumber(sectionsCleanedCount)
    }
})

if (cleanedSections.length === TOTAL_SECTIONS) {
    basic.showString("All sections cleaned! Good job!")
}

// Initialise Student Micro:bit
radio.setGroup(RADIO_GROUP)
radio.setTransmitSerialNumber(true)
basic.showString("S")
showCurrentSection()