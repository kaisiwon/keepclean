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
const TEACHER_TOTAL_SECTIONS = 5

let totalCleanedCount = 0
let teacherCleanedSections: number[] = []

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

