# KeepClean
Latest project: [(https://makecode.microbit.org/S50444-09307-72435-24010/)](https://makecode.microbit.org/S50444-09307-72435-24010)
**KeepClean** is a BBC micro:bit project and MakeCode extension designed to help keep your classroom nice, clean, and tidy. 

You can view the project page online at: [https://kaisiwon.github.io/keepclean/](https://kaisiwon.github.io/keepclean/)

## Use as Extension

This repository can be added as an **extension** in MakeCode:

1. Open [https://microbit.org](https://microbit.org)
2. Click on **New Project**
3. Click on **Extensions** under the gearwheel menu (top right)
4. Search for `https://github.com` and click import

## Edit this Project

To edit this repository directly within the MakeCode editor:

1. Open [https://microbit.org](https://microbit.org)
2. Click on **Import**, then click on **Import URL**
3. Paste `https://github.com` and click **Import**


## Metadata

* **Target:** PXT/microbit
* **Maintainer:** [kaisiwon](https://github.com)

Published with GitHub Pages.

# KeepClean — Micro:bit Classroom Cleaning Organiser

**KeepClean** is a BBC micro:bit classroom cleaning organiser written in MakeCode TypeScript/JavaScript (`main.ts`). Both the **Student** and **Teacher** Micro:bits run the exact same code and communicate wirelessly over **Radio**.

---

## Quick Start (MakeCode Simulator or Physical Micro:bits)

1. Open [MakeCode for micro:bit](https://makecode.microbit.org/) and create a **New Project**.
2. Click the **JavaScript** tab at the top and paste the code from `main.ts`.
3. Download/flash the program onto your **Student** and **Teacher** Micro:bits (or test directly in the MakeCode simulator).

---

## Step 1: Choose Your Role at Startup

When the Micro:bit turns on, it scrolls **`A=S B=T`** and shows **`?`** while waiting for you to choose its role:

| Button | Role Selected | What Shows on Screen |
| :--- | :--- | :--- |
| **Press Button A** | **Student (`S`)** | Checkmark (`✓`) → **`S`** → **`1`** (Current cleaning section) |
| **Press Button B** | **Teacher (`T`)** | Checkmark (`✓`) → **`T`** → **`0`** (Total sections cleaned so far) |

> **Tip for the MakeCode Simulator:** Press **A** on the first Micro:bit (Student) and then press any button to spawn the second simulated Micro:bit, where you can press **B** (Teacher).

---

## Step 2: How Students Use KeepClean

Once a Micro:bit is in **Student** mode, its screen always shows the **currently selected section number** (`1` to `5`).

| Action | What It Does | What You See / Hear |
| :--- | :--- | :--- |
| **Button B** | **Select Next Section** — Cycles through cleaning sections (`1` → `2` → `3` → `4` → `5` → `1`). | Shows the selected section number (`1`–`5`). |
| **Button A** | **Section Checked & Cleaned** — Marks the current section as cleaned, increments the counter (`+1`), and sends the update to the Teacher via radio. | Plays a melody, shows `✓`, scrolls **`C:<count>`**, flashes a Heart (`♥`) when the Teacher confirms, and shows **`DONE!`** once all sections are cleaned. |
| **Button A+B** | **Check My Counter** — Shows how many sections this student has checked and cleaned. | Scrolls **`C:<count>`**, then returns to the current section number. |
| **Shake** | **Quick Clean Alert** — Sends a quick `"Clean"` ping to the Teacher Micro:bit. | Shows `✓` on Student and a Musical Note (`♪`) on Teacher. |

> **Preventing Double-Counting:** If a student presses **Button A** on a section they already cleaned in this session, it shows a small diamond (`◆`) and their current count without incrementing the counter twice.

---

## Step 3: How the Teacher Uses KeepClean

Once a Micro:bit is in **Teacher** mode, its screen always shows the **total number of sections checked and cleaned**.

| Action | What It Does | What You See / Hear |
| :--- | :--- | :--- |
| **Automatic (Radio)** | **Receives Student Updates** — Automatically updates whenever a student presses Button A to clean a section. | Plays a two-note chime, shows `✓`, scrolls which section was cleaned (e.g. **`S1`**), and updates the total counter. Shows a Happy face (`☺`) when all sections are complete! |
| **Button A** | **View Total Cleaned Counter** — Displays the total number of sections checked and cleaned across the class. | Scrolls **`T:<total>`**. |
| **Button B** | **Check Remaining Sections** — Lists every section number that still needs to be cleaned. | Scrolls **`R:`** followed by each uncleaned section number (or **`ALL CLEAN!`** + `☺` if every section is done). |
| **Button A+B** | **Reset All Counters** — Resets the Teacher's counter to `0` and broadcasts a radio reset to all Student Micro:bits. | Shows `✕` (`IconNames.No`) and resets all Teacher and Student counters back to `0`. |

---

## Customising Sections or Radio Group

At the top of `main.ts` (lines 24–25), you can change the radio group or the total number of classroom cleaning sections:

```ts
const RADIO_GROUP = 1
const TOTAL_SECTIONS = 5
```

