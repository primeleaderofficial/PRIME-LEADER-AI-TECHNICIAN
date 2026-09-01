function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function hasAny(text, words) {
    return words.some(word => text.includes(word));
}

function profileValue(pc, key) {
    return pc?.[key] || "Not provided";
}

function diagnose(message, pc = {}) {

    const text = normalize(message);

    if (!text) return null;

    const cpu = profileValue(pc, "cpu");
    const gpu = profileValue(pc, "gpu");
    const ram = profileValue(pc, "ram");
    const windows = profileValue(pc, "windows");

    // CPU 100%
    if (
        hasAny(text, [
            "cpu 100",
            "cpu usage 100",
            "cpu usage high",
            "cpu high",
            "processor 100",
            "processor usage",
            "cpu full"
        ])
    ) {
        return {
            title: "HIGH CPU USAGE DIAGNOSIS",

            summary:
                "CPU usage එක 100% ළඟට යනවා නම් background process එකක්, heavy application එකක්, Windows service එකක්, malware, overheating හෝ CPU bottleneck එකක් හේතුව වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Task Manager → Processes open කරන්න.",
                "CPU column එක click කරලා වැඩිම CPU usage තියෙන process එක හඳුනාගන්න.",
                "Game/app එක close කරලා CPU usage අඩු වෙනවාද බලන්න.",
                "Startup Apps වල unnecessary applications disable කරන්න.",
                "CPU temperature එක check කරන්න.",
                "Windows Security → Virus & threat protection → Quick scan එකක් run කරන්න."
            ],

            checks: [
                "වැඩිම CPU usage තියෙන process එක මොකක්ද?",
                "CPU usage එක idle වෙලාවේත් 100% ද?",
                "CPU temperature එක කීයද?",
                "RAM usage එක කීයද?"
            ],

            warning:
                "Unknown processes delete කරන්න හෝ random registry cleaners භාවිතා කරන්න එපා."
        };
    }

    // FPS DROP
    if (
        hasAny(text, [
            "fps drop",
            "fps drops",
            "fps low",
            "fps down",
            "frame drop",
            "frames drop",
            "stutter",
            "stuttering",
            "lagging game"
        ])
    ) {
        return {
            title: "FPS DROP DIAGNOSIS",

            summary:
                "FPS drop එක GPU/CPU bottleneck, overheating, RAM usage, background applications, driver issues, power settings හෝ game graphics settings නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Game එක run කරද්දී CPU usage සහ GPU usage check කරන්න.",
                "CPU සහ GPU temperature check කරන්න.",
                "Background applications close කරලා test කරන්න.",
                "Graphics driver update/reinstall කරන්න.",
                "Windows Power Mode එක Best performance වෙත set කරලා test කරන්න.",
                "Game graphics settings අඩු කරලා FPS වෙනස බලන්න.",
                "V-Sync / frame limiter settings check කරන්න."
            ],

            checks: [
                "Game එක මොකක්ද?",
                "Average FPS එක කීයද?",
                "Drop වෙද්දී CPU usage කීයද?",
                "GPU usage කීයද?",
                "CPU/GPU temperature කීයද?"
            ],

            warning:
                "GPU overclock/voltage settings වෙනස් කරන්න කලින් temperatures සහ hardware limits confirm කරන්න."
        };
    }

    // RAM
    if (
        hasAny(text, [
            "ram full",
            "ram 100",
            "memory 100",
            "memory usage high",
            "ram usage high",
            "not enough memory",
            "out of memory"
        ])
    ) {
        return {
            title: "HIGH RAM USAGE DIAGNOSIS",

            summary:
                "RAM usage වැඩි නම් applications ගොඩක් open වීම, browser tabs, background processes හෝ insufficient physical RAM හේතුව වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Task Manager → Processes → Memory column එක බලන්න.",
                "වැඩිම RAM භාවිතා කරන application එක identify කරන්න.",
                "අවශ්‍ය නැති applications close කරන්න.",
                "Browser tabs/extensions reduce කරන්න.",
                "Startup Apps check කරන්න.",
                "PC එක restart කරලා usage එක නැවත check කරන්න."
            ],

            checks: [
                "Installed RAM කීයද?",
                "Idle RAM usage කීයද?",
                "Game එක run කරද්දී RAM usage කීයද?",
                "වැඩිම RAM භාවිතා කරන process එක මොකක්ද?"
            ]
        };
    }

    // DISK 100%
    if (
        hasAny(text, [
            "disk 100",
            "disk usage 100",
            "disk usage high",
            "hdd 100",
            "ssd 100",
            "disk full"
        ])
    ) {
        return {
            title: "HIGH DISK USAGE DIAGNOSIS",

            summary:
                "Disk usage 100% වීම Windows services, updates, indexing, antivirus scanning, heavy applications හෝ slow HDD එකක් නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Task Manager → Processes → Disk column එක බලන්න.",
                "වැඩිම disk usage තියෙන process එක identify කරන්න.",
                "Windows drive එකේ free space check කරන්න.",
                "Windows Update status එක check කරන්න.",
                "Antivirus scan එකක් running ද බලන්න.",
                "HDD එකක් නම් disk health එක check කරන්න."
            ],

            checks: [
                "Disk usage එක 100% වෙන්නේ idle වෙලාවේද?",
                "Windows drive එකේ free space කීයද?",
                "SSD ද HDD ද?",
                "වැඩිම disk usage තියෙන process එක මොකක්ද?"
            ],

            warning:
                "Disk එකේ system files manually delete කරන්න එපා."
        };
    }

    // OVERHEATING
    if (
        hasAny(text, [
            "overheat",
            "overheating",
            "temperature high",
            "temp high",
            "cpu hot",
            "gpu hot",
            "pc hot",
            "laptop hot"
        ])
    ) {
        return {
            title: "OVERHEATING DIAGNOSIS",

            summary:
                "High temperature එක dust buildup, poor airflow, old thermal paste, high workload, fan problems හෝ cooling limitations නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "CPU සහ GPU temperature monitor කරන්න.",
                "Fans properly rotate වෙනවාද බලන්න.",
                "PC case airflow සහ dust buildup check කරන්න.",
                "Heavy background processes close කරන්න.",
                "Laptop එකක් නම් ventilation openings block නොකරන්න.",
                "Desktop එකක් නම් CPU cooler contact සහ thermal paste condition check කරන්න."
            ],

            checks: [
                "Idle temperature කීයද?",
                "Gaming temperature කීයද?",
                "CPU temperature කීයද?",
                "GPU temperature කීයද?"
            ],

            warning:
                "PC එක power off කරලා hardware clean/repair කරන විට power cable disconnect කරන්න."
        };
    }

    // BSOD
    if (
        hasAny(text, [
            "bsod",
            "blue screen",
            "blue screen of death",
            "stop code",
            "stopcode"
        ])
    ) {
        return {
            title: "BSOD DIAGNOSIS",

            summary:
                "BSOD එක driver, RAM, storage, Windows corruption, hardware instability හෝ incompatible software නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Blue Screen එකේ STOP CODE එක note කරගන්න.",
                "Recently installed drivers/software check කරන්න.",
                "Windows Update complete කරන්න.",
                "Windows Memory Diagnostic run කරන්න.",
                "Command Prompt as Administrator එකෙන් DISM/SFC checks run කරන්න.",
                "Recently changed hardware තිබේ නම් ඒකත් check කරන්න."
            ],

            checks: [
                "STOP CODE එක මොකක්ද?",
                "BSOD වෙන්නේ game එකේදීද idle වෙලාවේද?",
                "Recently driver/software install කළාද?",
                "RAM sticks කීයක් තියෙනවාද?"
            ],

            warning:
                "Random driver cleaner tools හෝ unknown BSOD fix tools භාවිතා කරන්න එපා."
        };
    }

    // INTERNET
    if (
        hasAny(text, [
            "internet slow",
            "wifi slow",
            "wifi lag",
            "internet lag",
            "ping high",
            "high ping",
            "network slow",
            "connection problem",
            "internet disconnect"
        ])
    ) {
        return {
            title: "NETWORK DIAGNOSIS",

            summary:
                "Internet performance issue එක local Wi-Fi signal, router, DNS, ISP connection, background downloads හෝ network adapter issue එකක් නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Task Manager → Performance → Network usage check කරන්න.",
                "Background downloads සහ cloud sync applications check කරන්න.",
                "Router restart කරලා test කරන්න.",
                "Wi-Fi signal strength check කරන්න.",
                "Ethernet connection එකකින් test කරන්න පුළුවන් නම් test කරන්න.",
                "Gaming සඳහා ping සහ packet loss check කරන්න."
            ],

            checks: [
                "Download speed කීයද?",
                "Upload speed කීයද?",
                "Ping කීයද?",
                "Wi-Fi ද Ethernet ද?",
                "සියලු devices වලටම මේ problem එක තියෙනවාද?"
            ]
        };
    }

    // GAME CRASH
    if (
        hasAny(text, [
            "game crash",
            "game crashes",
            "game close",
            "game closes",
            "game not opening",
            "game won't start",
            "game wont start",
            "game error"
        ])
    ) {
        return {
            title: "GAME CRASH DIAGNOSIS",

            summary:
                "Game crash එක corrupted files, graphics driver, DirectX/Visual C++ runtime, insufficient resources, mods හෝ incompatible settings නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Game launcher එකෙන් Verify/Repair game files run කරන්න.",
                "GPU driver update කරන්න.",
                "DirectX සහ Visual C++ Redistributable requirements check කරන්න.",
                "Mods තිබේ නම් temporarily disable කරන්න.",
                "Game settings reset කරලා test කරන්න.",
                "Windows Event Viewer එකේ crash information check කරන්න."
            ],

            checks: [
                "Game name එක මොකක්ද?",
                "Crash වෙද්දී error message එකක් තියෙනවාද?",
                "Game එක open වෙනවද නැත්නම් loading අතරතුර crash වෙනවාද?",
                "GPU එක මොකක්ද?"
            ]
        };
    }

    // NO DISPLAY / BLACK SCREEN
    if (
        hasAny(text, [
            "no display",
            "no signal",
            "black screen",
            "screen black",
            "monitor no signal",
            "display not working"
        ])
    ) {
        return {
            title: "NO DISPLAY DIAGNOSIS",

            summary:
                "No display issue එක cable/input selection, GPU, RAM, monitor, PSU හෝ motherboard connection එකක් නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Monitor power සහ correct input source check කරන්න.",
                "Display cable එක reconnect කරන්න.",
                "වෙන cable/port එකක් තිබේ නම් test කරන්න.",
                "Dedicated GPU එකක් තිබේ නම් GPU connection check කරන්න.",
                "PC power off කරලා RAM sticks properly seated ද බලන්න.",
                "Motherboard diagnostic LEDs/beeps තිබේ නම් ඒවා note කරන්න."
            ],

            checks: [
                "PC fans spin වෙනවාද?",
                "Monitor එකේ No Signal ද?",
                "GPU එක මොකක්ද?",
                "Recently hardware change කළාද?"
            ],

            warning:
                "Hardware reseating කිරීමට පෙර PC power off කර power cable disconnect කරන්න."
        };
    }

    // STORAGE
    if (
        hasAny(text, [
            "ssd slow",
            "hdd slow",
            "hard disk slow",
            "storage slow",
            "disk slow",
            "drive slow"
        ])
    ) {
        return {
            title: "STORAGE PERFORMANCE DIAGNOSIS",

            summary:
                "Storage slowdowns drive health, free space, background disk activity, thermal throttling හෝ HDD aging නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Windows drive එකේ free space check කරන්න.",
                "Task Manager → Disk activity check කරන්න.",
                "Drive health/SMART status check කරන්න.",
                "HDD එකක් නම් unusual clicking/noise තියෙනවාද බලන්න.",
                "Unnecessary large files safely clean කරන්න."
            ],

            checks: [
                "SSD ද HDD ද?",
                "Drive එකේ free space කීයද?",
                "Disk usage idle වෙලාවේ කීයද?",
                "Drive එක කොච්චර පරණද?"
            ]
        };
    }

    // WINDOWS
    if (
        hasAny(text, [
            "windows error",
            "windows problem",
            "windows slow",
            "windows update",
            "windows not working",
            "windows issue"
        ])
    ) {
        return {
            title: "WINDOWS DIAGNOSIS",

            summary:
                "Windows issue එක corrupted system files, updates, drivers, startup applications හෝ software conflicts නිසා වෙන්න පුළුවන්.",

            pcProfile: {
                cpu,
                gpu,
                ram,
                windows
            },

            steps: [
                "Windows version සහ build number check කරන්න.",
                "Windows Update status check කරන්න.",
                "Recently installed software/drivers review කරන්න.",
                "Task Manager → Startup Apps check කරන්න.",
                "System file integrity checks consider කරන්න."
            ],

            checks: [
                "Windows version එක මොකක්ද?",
                "Error code එකක් තියෙනවාද?",
                "Problem එක පටන් ගත්තේ කවදාද?"
            ]
        };
    }

    // Nothing recognized
    return null;
}

module.exports = {
    diagnose
};
