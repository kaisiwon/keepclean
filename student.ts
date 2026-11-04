/**
 * KeepClean - Classroom Cleaning Organiser (Student & Teacher in one file)
 * Platform: BBC micro:bit (MakeCode TypeScript / JavaScript)
 *
 * ================= HOW TO USE =================
 * 1. CHOOSE YOUR ROLE AT STARTUP:
 *    - Press Button A -> STUDENT Micro:bit ("S")
 *    - Press Button B -> TEACHER Micro:bit ("T")
 *
 * 2. STUDENT CONTROLS (Role = "student"):
 *    - Button A   : Check & clean current section, increment counter (+1), and send to Teacher.
 *    - Button B   : Switch to the next cleaning section (1 to TOTAL_SECTIONS).
 *    - Button A+B : Show how many sections you have checked & cleaned ("C:").
 *    - Shake      : Send a quick "Clean" alert to the Teacher.
 *
 * 3. TEACHER CONTROLS (Role = "teacher"):
 *    - Button A   : Show total number of sections checked & cleaned across the class.
 *    - Button B   : Show remaining uncleaned sections ("R:"), or a Happy face if all are clean!
 *    - Button A+B : Reset all counters back to 0 on Teacher and all Student Micro:bits.
 * ==============================================
 */

// ---------------- 1. CONFIGURATION & STATE ----------------
const RADIO_GROUP = 1
const TOTAL_SECTIONS = 5

// Role can be "none", "student", or "teacher"
let role = "none"

// Student state
let currentSection = 1
let sectionsCleanedCount = 0
let studentCleanedSections: number[] = []

// Teacher state
let totalCleanedCount = 0
let teacherCleanedSections: number[] = []


// ---------------- 2. HELPER FUNCTIONS ----------------

// Check if the student already cleaned a specific section
function isStudentSectionCleaned(section: number): boolean {
    return studentCleanedSections.indexOf(section) !== -1
}

// Check if the teacher already recorded a specific section
function isTeacherSectionRecorded(section: number): boolean {
    return teacherCleanedSections.indexOf(section) !== -1
}

// Display the student's currently selected section number on the LED screen
function showStudentScreen(): void {
    basic.showNumber(currentSection)
}

// Display the teacher's total cleaned counter on the LED screen
function showTeacherScreen(): void {
    basic.showNumber(totalCleanedCount)
}


// ---------------- 3. BUTTON A HANDLER ----------------
input.onButtonPressed(Button.A, function () {
    led.stopAnimation()

    // Step 1: Role Selection at startup
    if (role == "none") {
        role = "student"
        basic.showIcon(IconNames.Yes)
        basic.pause(300)
        basic.showString("S")
        showStudentScreen()
        return
    }

    // Step 2: Student Button A -> Mark current section as checked & cleaned
    if (role == "student") {
        if (!isStudentSectionCleaned(currentSection)) {
            // Record cleaned section and increment the counter
            studentCleanedSections.push(currentSection)
            sectionsCleanedCount += 1

            // Send section number and updated counter to Teacher via radio
            radio.sendValue("clean", currentSection)
            radio.sendValue("count", sectionsCleanedCount)

            // Visible & audible confirmation for the student
            basic.showIcon(IconNames.Yes)
            music.play(music.stringPlayable("C5 E5 G5 C6", 240), music.PlaybackMode.UntilDone)
            basic.pause(300)

            // Show updated count of sections checked and cleaned
            basic.showString("C:")
            basic.showNumber(sectionsCleanedCount)
            basic.pause(400)

            // Celebrate if this student has cleaned all sections
            if (studentCleanedSections.length >= TOTAL_SECTIONS) {
                basic.showIcon(IconNames.Happy)
                basic.pause(600)
                basic.showString("DONE!")
            }

            showStudentScreen()
        } else {
            // Section was already cleaned earlier; show checkmark and current count
            basic.showIcon(IconNames.SmallDiamond)
            basic.pause(400)
            basic.showNumber(sectionsCleanedCount)
            basic.pause(400)
            showStudentScreen()
        }
        return
    }

    // Step 3: Teacher Button A -> View total sections checked & cleaned
    if (role == "teacher") {
        basic.showString("T:")
        showTeacherScreen()
    }
})


// ---------------- 4. BUTTON B HANDLER ----------------
input.onButtonPressed(Button.B, function () {
    led.stopAnimation()

    // Step 1: Role Selection at startup
    if (role == "none") {
        role = "teacher"
        basic.showIcon(IconNames.Yes)
        basic.pause(300)
        basic.showString("T")
        showTeacherScreen()
        return
    }

    // Step 2: Student Button B -> Cycle to the next cleaning section (1..TOTAL_SECTIONS)
    if (role == "student") {
        currentSection += 1
        if (currentSection > TOTAL_SECTIONS) {
            currentSection = 1
        }
        showStudentScreen()
        return
    }

    // Step 3: Teacher Button B -> Check which sections still need cleaning
    if (role == "teacher") {
        if (teacherCleanedSections.length >= TOTAL_SECTIONS) {
            basic.showIcon(IconNames.Happy)
            basic.pause(600)
            basic.showString("ALL CLEAN!")
            showTeacherScreen()
        } else {
            basic.showString("R:")
            for (let section = 1; section <= TOTAL_SECTIONS; section++) {
                if (!isTeacherSectionRecorded(section)) {
                    basic.showNumber(section)
                    basic.pause(400)
                }
            }
            showTeacherScreen()
        }
    }
})


// ---------------- 5. BUTTON A+B HANDLER ----------------
input.onButtonPressed(Button.AB, function () {
    led.stopAnimation()

    // Student Button A+B -> Show student's cleaned counter
    if (role == "student") {
        basic.showString("C:")
        basic.showNumber(sectionsCleanedCount)
        basic.pause(500)
        showStudentScreen()
        return
    }

    // Teacher Button A+B -> Reset all counters on Teacher and Student Micro:bits
    if (role == "teacher") {
        totalCleanedCount = 0
        teacherCleanedSections = []
        radio.sendValue("reset", 1)

        basic.showIcon(IconNames.No)
        basic.pause(500)
        showTeacherScreen()
    }
})


// ---------------- 6. SHAKE GESTURE ----------------
input.onGesture(Gesture.Shake, function () {
    if (role == "student") {
        radio.sendString("Clean")
        basic.showIcon(IconNames.Yes)
        basic.pause(400)
        showStudentScreen()
    }
})


// ---------------- 7. RADIO COMMUNICATION ----------------

// Handle string messages (e.g. Shake alert)
radio.onReceivedString(function (receivedString: string) {
    if (role == "teacher" && receivedString == "Clean") {
        basic.showIcon(IconNames.EighthNote)
        basic.pause(500)
        showTeacherScreen()
    }
})

// Handle key-value messages ("clean", "ack", "reset")
radio.onReceivedValue(function (name: string, value: number) {
    led.stopAnimation()

    // STUDENT receives messages from Teacher
    if (role == "student") {
        if (name == "reset" && value == 1) {
            // Reset student counter and cleaned sections list
            sectionsCleanedCount = 0
            studentCleanedSections = []
            currentSection = 1

            basic.showIcon(IconNames.No)
            basic.pause(500)
            showStudentScreen()
        } else if (name == "ack" && value == currentSection) {
            // Teacher confirmed receiving the cleaned section
            basic.showIcon(IconNames.Heart)
            basic.pause(400)
            showStudentScreen()
        }
        return
    }

    // TEACHER receives messages from Students
    if (role == "teacher") {
        if (name == "clean") {
            let sectionNumber = value

            // Increment total counter of sections checked and cleaned
            totalCleanedCount += 1

            // Track unique section number
            if (!isTeacherSectionRecorded(sectionNumber)) {
                teacherCleanedSections.push(sectionNumber)
            }

            // Send confirmation back to the Student Micro:bit
            radio.sendValue("ack", sectionNumber)

            // Play chime and display which section was cleaned + new total count
            basic.showIcon(IconNames.Yes)
            music.play(music.stringPlayable("E5 G5", 240), music.PlaybackMode.UntilDone)
            basic.showString("S" + sectionNumber)
            basic.pause(300)

            // If all sections are now clean, show a Happy face celebration
            if (teacherCleanedSections.length >= TOTAL_SECTIONS) {
                basic.showIcon(IconNames.Happy)
                basic.pause(600)
            }

            // Keep the updated total counter visible on the Teacher's screen
            showTeacherScreen()
        }
    }
})


// ---------------- 8. STARTUP ----------------
radio.setGroup(RADIO_GROUP)
radio.setTransmitSerialNumber(true)
basic.showString("A=S B=T")
if (role == "none") {
    basic.showString("?")
}

