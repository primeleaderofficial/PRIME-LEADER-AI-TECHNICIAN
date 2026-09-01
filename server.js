require("dotenv").config();

const express = require("express");
const path = require("path");
const { diagnose } = require("./src/diagnostics");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(express.json({ limit: "1mb" }));

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* =========================================================
   PRIME LEADER AI TECHNICIAN
   SYSTEM PROMPT
   ========================================================= */

const SYSTEM_PROMPT = `
You are PRIME LEADER AI TECHNICIAN.

You are a professional AI PC technician and technical assistant.

==================================================
LANGUAGE RULE — EXTREMELY IMPORTANT
==================================================

Always answer in the SAME LANGUAGE STYLE used by the user.

You understand:

1. Sinhala
2. English
3. Singlish / Romanized Sinhala
4. Sinhala + English mixed language

--------------------------------------------------
SINHALA USER
--------------------------------------------------

If the user writes Sinhala script, answer mainly in Sinhala.

Example:

User:
"මගේ PC එක slow වෙනවා"

Answer:
"ඔයාගේ PC එක slow වෙනවා නම්, මුලින්ම Task Manager එකෙන් CPU, RAM සහ Disk usage check කරමු."

--------------------------------------------------
ENGLISH USER
--------------------------------------------------

If the user writes English, answer in English.

Example:

User:
"My PC is running slow."

Answer:
"Let's first check your CPU, RAM and Disk usage in Task Manager."

--------------------------------------------------
SINGLISH USER
--------------------------------------------------

If the user writes Singlish / Romanized Sinhala,
answer in Singlish / Romanized Sinhala.

Example:

User:
"mage pc eka slow wenawa"

Answer:

"PC eka slow wenawa nam, mulinma Task Manager eka open karala CPU, RAM saha Disk usage balamu."

Another example:

User:
"cpu eka 100% yanawa"

Answer:

"CPU usage eka 100% yanawa nam, mulinma Task Manager eke CPU column eka balala highest usage thiyena process eka hoyamu."

--------------------------------------------------
MIXED USER
--------------------------------------------------

If the user mixes Sinhala and English,
reply naturally using the same mixed style.

Example:

User:
"mage game eka FPS drop wenawa Windows update ekata passe"

Answer:

"Windows update ekata passe FPS drop wenawa nam, mulinma GPU driver version eka saha game graphics settings check karamu."

--------------------------------------------------
VERY IMPORTANT
--------------------------------------------------

DO NOT automatically answer everything in English.

DO NOT translate Singlish into formal English.

DO NOT translate Sinhala into English unless the user asks for translation.

Match the user's communication style.

Technical words can remain in English because they are easier to understand.

Examples:

CPU
GPU
RAM
SSD
HDD
FPS
Task Manager
Windows
Driver
GPU Driver
BIOS
DirectX
Power Plan
Device Manager

==================================================
YOUR MAIN JOB
==================================================

You are a PC troubleshooting technician.

You help users diagnose:

- Slow PC
- High CPU usage
- High RAM usage
- High Disk usage
- FPS drops
- Game crashes
- Game stuttering
- BSOD
- Windows errors
- Driver problems
- GPU problems
- CPU problems
- RAM problems
- SSD/HDD problems
- Overheating
- Internet problems
- Wi-Fi problems
- High ping
- Network problems
- Audio problems
- USB problems
- Keyboard problems
- Mouse problems
- Startup problems
- Windows Update problems
- Software problems
- Emulator problems
- BlueStacks
- MSI App Player
- Gaming optimization
- General PC technical problems

==================================================
DIAGNOSIS METHOD
==================================================

For every problem:

1. Understand the symptoms.
2. Identify the most likely causes.
3. Tell the user what to check.
4. Give safe step-by-step instructions.
5. Explain what the user should expect.
6. If the fix fails, give the next diagnostic step.

Do not immediately give 20 complicated fixes.

Start with the most useful and easiest check.

Guide the user step-by-step.

If the user provides a result from a check,
use that result to decide the NEXT step.

Example:

User:
"Task Manager eke Chrome 80% CPU"

You should explain that Chrome is currently the main CPU consumer
and tell the user what to check next.

Do not repeat generic troubleshooting steps unnecessarily.

==================================================
PC PROFILE
==================================================

If PC information is provided, use it.

Possible information:

CPU
GPU
RAM
Windows
Storage
Motherboard

Never invent missing specifications.

If information is not provided, say:

"Not provided"

or ask the user for the specific information that is actually needed.

==================================================
WINDOWS SAFETY
==================================================

Never tell users to:

- Delete Windows system files.
- Delete random registry keys.
- Permanently disable Windows Defender.
- Permanently disable Windows security.
- Download unknown cracked tools.
- Run unknown commands.
- Use destructive commands without warning.

For commands that modify Windows:

1. Explain what the command does.
2. Warn if administrator privileges are required.
3. Prefer safe and reversible actions.

==================================================
COMMANDS
==================================================

If you give a Windows command,
put it inside a code block.

Example:

sfc /scannow

Explain:

"This checks Windows system files and attempts to repair corrupted files."

==================================================
RESPONSE STYLE
==================================================

Be:

- Friendly
- Professional
- Practical
- Easy to understand
- Concise
- Step-by-step

Do not use unnecessarily complicated technical language.

For Sinhala/Singlish users,
explain technical concepts simply.

==================================================
RECOMMENDED RESPONSE FORMAT
==================================================

Use these sections when useful:

## DIAGNOSIS

Explain what the symptom most likely means.

## LIKELY CAUSES

List the most likely causes.

## CHECK THESE

Give the most important checks.

## FIX

Give safe step-by-step fixes.

## IF IT STILL HAPPENS

Explain what information/result the user should provide next.

Do not force all sections if they are unnecessary.

==================================================
IMPORTANT
==================================================

Never pretend that you physically inspected the user's PC.

Never claim certainty when there is insufficient information.

Use phrases such as:

"likely"
"could be"
"most common cause"
"let's check"

when appropriate.

Your goal is to behave like a real PRIME LEADER PC technician
who diagnoses the problem step-by-step rather than giving random fixes.

==================================================
BRAND
==================================================

Your identity is:

PRIME LEADER AI TECHNICIAN

You may refer to yourself as:

"PRIME LEADER AI TECHNICIAN"

when appropriate.
`;

/* =========================================================
   GROQ AI FUNCTION
   ========================================================= */

async function askAI(message, pc = {}) {

    const url =
        process.env.AI_API_URL;

    const key =
        process.env.AI_API_KEY;

    const model =
        process.env.AI_MODEL ||
        "openai/gpt-oss-120b";

    if (!url || !key) {

        console.log(
            "[AI] API configuration missing."
        );

        return null;
    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            30000
        );

    try {

        console.log(
            "[AI] Sending request..."
        );

        const response =
            await fetch(
                url,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + key
                    },

                    body:
                        JSON.stringify({

                            model: model,

                            temperature: 0.2,

                            messages: [

                                {
                                    role: "system",

                                    content:
                                        SYSTEM_PROMPT
                                },

                                {
                                    role: "user",

                                    content:
                                        `
PC PROFILE:
${JSON.stringify(
    pc,
    null,
    2
)}

USER MESSAGE:
${message}
`
                                }

                            ]

                        }),

                    signal:
                        controller.signal
                }
            );

        const raw =
            await response.text();

        if (!response.ok) {

            console.log(
                "[AI] HTTP ERROR:",
                response.status
            );

            console.log(
                raw
            );

            return null;
        }

        let data;

        try {

            data =
                JSON.parse(raw);

        } catch (error) {

            console.log(
                "[AI] Invalid JSON response."
            );

            return null;
        }

        const content =
            data
                ?.choices
                ?.[0]
                ?.message
                ?.content;

        if (!content) {

            console.log(
                "[AI] Empty AI response."
            );

            return null;
        }

        console.log(
            "[AI] Response received."
        );

        return {

            title:
                "PRIME LEADER AI TECHNICIAN",

            markdown:
                content

        };

    } catch (error) {

        console.log(
            "[AI] Request failed:",
            error.message
        );

        return null;

    } finally {

        clearTimeout(
            timeout
        );

    }
}

/* =========================================================
   DIAGNOSE API
   ========================================================= */

app.post(
    "/api/diagnose",
    async (req, res) => {

        try {

            const message =
                String(
                    req.body?.message || ""
                ).trim();

            const pc =
                req.body?.pc || {};

            if (!message) {

                return res
                    .status(400)
                    .json({

                        error:
                            "Please enter a problem."

                    });
            }

            console.log("");
            console.log(
                "----------------------------------------"
            );

            console.log(
                "[USER]",
                message
            );

            /*
             * STEP 1
             * LOCAL DIAGNOSTIC ENGINE
             */

            let local = null;

            try {

                local =
                    diagnose(
                        message,
                        pc
                    );

            } catch (error) {

                console.log(
                    "[LOCAL] Error:",
                    error.message
                );

            }

            /*
             * IMPORTANT:
             *
             * If local engine returns a generic /
             * incomplete result, AI should still be
             * allowed to answer.
             */

            if (
                local &&
                local.summary &&
                local.steps &&
                local.steps.length > 0
            ) {

                console.log(
                    "[LOCAL] Diagnosis matched."
                );

                /*
                 * For known PC problems we can return
                 * local diagnosis immediately.
                 */

                return res.json(
                    local
                );
            }

            /*
             * STEP 2
             * GROQ AI
             */

            console.log(
                "[AI] Using AI technician..."
            );

            const ai =
                await askAI(
                    message,
                    pc
                );

            if (ai) {

                return res.json(
                    ai
                );
            }

            /*
             * STEP 3
             * LOCAL FALLBACK
             */

            if (local) {

                console.log(
                    "[FALLBACK] Returning local diagnosis."
                );

                return res.json(
                    local
                );
            }

            /*
             * STEP 4
             * SERVICE UNAVAILABLE
             */

            return res
                .status(503)
                .json({

                    title:
                        "PRIME LEADER AI TECHNICIAN",

                    summary:
                        "AI technician service is temporarily unavailable.",

                    steps: [
                        "Please try again in a moment.",
                        "Make sure the AI API configuration is correct."
                    ],

                    warning:
                        "AI service did not return a response."

                });

        } catch (error) {

            console.error(
                "[SERVER ERROR]",
                error
            );

            return res
                .status(500)
                .json({

                    title:
                        "PRIME LEADER AI TECHNICIAN",

                    summary:
                        "Technician service error occurred.",

                    warning:
                        error.message

                });
        }
    }
);

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            status:
                "online",

            service:
                "PRIME LEADER AI TECHNICIAN",

            aiConfigured:
                Boolean(
                    process.env.AI_API_KEY &&
                    process.env.AI_API_URL &&
                    process.env.AI_MODEL
                ),

            model:
                process.env.AI_MODEL ||
                "openai/gpt-oss-120b"

        });

    }
);

/* =========================================================
   WEBSITE
   ========================================================= */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );

    }
);

/* =========================================================
   SERVER START
   ========================================================= */

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "        PRIME LEADER AI TECHNICIAN"
        );

        console.log(
            "        AI PC DIAGNOSTICS"
        );

        console.log(
            "=================================================="
        );

        console.log(
            "URL   : http://localhost:" +
            PORT
        );

        console.log(
            "MODEL : " +
            (
                process.env.AI_MODEL ||
                "openai/gpt-oss-120b"
            )
        );

        console.log(
            "AI    : " +
            (
                process.env.AI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            )
        );

        console.log(
            "STATUS: ONLINE"
        );

        console.log(
            "=================================================="
        );

        console.log("");

    }
);