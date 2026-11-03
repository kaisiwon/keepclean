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
// Line 1 should start right here
let role = ""

radio.setGroup(1)
role = "none"
basic.showString("A=S B=T")

input.onButtonPressed(Button.A, function () {
    role = "student"
    basic.showString("S")
})

input.onButtonPressed(Button.B, function () {
    role = "teacher"
    basic.showString("T")
})

// STUDENT LOGIC
input.onGesture(Gesture.Shake, function () {
    if (role == "student") {
        radio.sendString("Clean")
    }
})

// TEACHER LOGIC
radio.onReceivedString(function (receivedString) {
    if (role == "teacher") {
        if (receivedString == "Clean") {
            basic.showIcon(IconNames.Angry)
        }
    }
})
function waitUntilButtonPressed() {
    // Loop runs while BOTH buttons are untouched
    while (!input.buttonIsPressed(Button.A) && !input.buttonIsPressed(Button.B)) {
        basic.pause(10) // Small pause prevents the micro:bit from freezing
    }
}

if (role == "student") {
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
}
if (role == "teacher") {

/**
 * Teacher Micro:bit - Classroom Cleaning Organiser
 * Platform: BBC micro:bit (MakeCode JavaScript / Static TypeScript)
 *
 * Controls:
 * - Button A: Display the total number of sections checked and cleaned.
 * - Button B: Check remaining uncleaned sections (or show celebration if all are done).
 * - Button A+B: Reset the cleaned counter on the Teacher and all Student Micro:bits.
 */

const TEACHER_RADIO_GROUP = 1
const TEACHER_TOTAL_SECTIONS = 1

let totalCleanedCount = 0
let teacherCleanedSections: number[] = []

basic.showString("Teacher")

// Helper to check if a specific section is already in the cleaned list
function isSectionRecorded(section: number): boolean {
    return teacherCleanedSections.indexOf(section) !== -1
}

// Button A: Show total number of sections checked and cleaned
input.onButtonPressed(Button.A, function () {
    basic.showNumber(totalCleanedCount)
})

// Button B: Show remaining uncleaned section numbers (or Happy icon if all sections are clean)
input.onButtonPressed(Button.B, function () {
    if (teacherCleanedSections.length >= TEACHER_TOTAL_SECTIONS) {
        basic.showIcon(IconNames.Happy)
        basic.pause(600)
        basic.showNumber(totalCleanedCount)
    } else {
        basic.showString("R:")
        for (let section = 1; section <= TEACHER_TOTAL_SECTIONS; section++) {
            if (!isSectionRecorded(section)) {
                basic.showNumber(section)
                basic.pause(300)
            }
        }
        basic.showNumber(totalCleanedCount)
    }
})

// Button A+B: Reset all counters locally and broadcast reset to all Student Micro:bits
input.onButtonPressed(Button.AB, function () {
    totalCleanedCount = 0
    teacherCleanedSections = []
    radio.sendValue("reset", 1)

    basic.showIcon(IconNames.No)
    basic.pause(500)
    basic.showNumber(totalCleanedCount)
})

// Receive cleaning updates from Student Micro:bits via radio
radio.onReceivedValue(function (name: string, value: number) {
    if (name === "clean") {
        let sectionNumber = value

        // Increment counter tracking total sections checked and cleaned
        totalCleanedCount += 1

        // Record the section number if not already recorded
        if (!isSectionRecorded(sectionNumber)) {
            teacherCleanedSections.push(sectionNumber)
        }

        // Send acknowledgment back to the Student Micro:bit
        radio.sendValue("ack", sectionNumber)

        // Display checkmark, the cleaned section number, and updated total counter
        basic.showIcon(IconNames.Yes)
        basic.pause(400)
        basic.showString("S" + sectionNumber)
        basic.pause(300)

        if (teacherCleanedSections.length >= TEACHER_TOTAL_SECTIONS) {
            basic.showIcon(IconNames.Happy)
            basic.pause(600)
        }

        basic.showNumber(totalCleanedCount)
    }
})

// Initialise Teacher Micro:bit
radio.setGroup(TEACHER_RADIO_GROUP)
radio.setTransmitSerialNumber(true)
basic.showString("T")
basic.showNumber(totalCleanedCount)
}

