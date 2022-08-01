
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let COURSE_WIDTH = 190;
let COURSE_HEIGHT = 90;
let SCRATCH_WIDTH = 3;
let MINIMUM_YEARS_REQUIRED = 4;
let COURSES_PER_SEM_WITHOUT_OVERLOADING = 4;
let courseArray = [];
let draggingCourse;
let draggingCourseOriginalGridX;
let draggingCourseOriginalGridY;
let draggingCourseOffsetX;
let draggingCourseOffsetY;

let ERROR_MESSAGE_WIDTH = 450;
let ERROR_MESSAGE_HEIGHT = 150;

let COURSES_PER_SEM = 6;
let YEARS_OF_DEGREE = 5;

/*
* TODO:
*   fuzzy searching with Fuse.js
*   showing blue but (!) if prerequisite is in red
*   README, submission form
*   more courses, specialisations
*   UI improvements
*   save/load (via JSON)
*
*
*/

/*
* CURRENTLY HARDCODED:
*
*   COMP2120 - to allow it to be concurrently taken with COMP2100
*   MATH2222 - is a real mess
*
*/

let allCourseData = [
    {
        code: "COMP1100",
        name: "Programming as Problem Solving",
        sem1: true,
        sem2: true,
        prereq: [],
        areaprereq: [],
		incompat: ["COMP1130"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP1130",
        name: "Programming as Problem Solving (Advanced)",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: ["COMP1100"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP1110",
        name: "Structured Programming",
        sem1: false,
        sem2: true,
        prereq: ["COMP1100/COMP1130"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP1140",
        name: "Structured Programming (Advanced)",
        sem1: false,
        sem2: true,
        prereq: ["COMP1130"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP1600",
        name: "Foundations of Computing",
        sem1: false,
        sem2: true,
        prereq: ["COMP1100/COMP1130", "MATH"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "MATH1013",
        name: "Mathematics and Applications 1",
        sem1: true,
        sem2: true,
        prereq: [],
        areaprereq: [],
		incompat: ["MATH1115"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "MATH1115",
        name: "Advanced Mathematics and Applications 1",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "MATH1014",
        name: "Mathematics and Applications 2",
        sem1: false,
        sem2: true,
        prereq: ["MATH1013/MATH1115"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "MATH1116",
        name: "Advanced Mathematics and Applications 2",
        sem1: false,
        sem2: true,
        prereq: ["MATH1115"],
        areaprereq: [],
		incompat: ["MATH1014"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP2100",
        name: "Software Design Methodologies",
        sem1: true,
        sem2: true,
        prereq: ["COMP1100/COMP1130", "COMP1110/COMP1140", "MATH"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP2120",
        name: "Software Engineering",
        sem1: false,
        sem2: true,
        prereq: ["COMP2100"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP2300",
        name: "Computer Organisation and Program Execution",
        sem1: true,
        sem2: false,
        prereq: ["COMP1100/COMP1130/COMP1730", "MATH"],
        areaprereq: [],
		incompat: ["ENGN2219"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP2310",
        name: "Systems, Networks, and Concurrency",
        sem1: false,
        sem2: true,
        prereq: ["COMP1110/COMP1140", "COMP2300"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP2420",
        name: "Introduction to Data Management, Analysis and Security",
        sem1: true,
        sem2: false,
        prereq: ["COMP1100/COMP1130"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP3600",
        name: "Algorithms",
        sem1: false,
        sem2: true,
        prereq: ["COMP1110/COMP1140", "COMP2", "COMP1600/MATH2"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "MATH1005",
        name: "Discrete Mathematical Models",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "MATH2222",
        name: "Introduction to Mathematical Thinking: Problem-Solving and Proofs",
        sem1: true,
        sem2: false,
        prereq: ["MATH1116/MATH1113/MATH1013/MATH1014"],  /* also has some hardcoded weirdness */
        areaprereq: [],
		incompat: ["MATH2322", "MATH3104", "MATH2320", "MATH3116"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP4450",
        name: "Advanced Computing Research Methods",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: [],
        warning: "Permission code required.",
        wide: false,
        tall: false,
    },
    {
        code: "COMP2550",
        name: "Advanced Computing R&D Methods",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: [],
        warning: "Must be enrolled in the Bachelor of Advanced Computing (Research & Development).",
        wide: false,
        tall: false,
    },
    {
        code: "COMP2560",
        name: "Studies in Advanced Computing R&D ",
        sem1: false,
        sem2: true,
        prereq: ["COMP2550"],
        areaprereq: [],
		incompat: [],
        warning: "Must be enrolled in the Bachelor of Advanced Computing (Research & Development).",
        wide: false,
        tall: false,
    },
    {
        code: "STAT1003",
        name: "Statistical Techniques",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: ["STAT1008"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "STAT1008",
        name: "Quantitative Research Methods",
        sem1: true,
        sem2: true,
        prereq: [],
        areaprereq: [],
		incompat: ["STAT1003"],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP3820",
        name: "Computing Internship",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: [],
        warning: "Permission code required.",
        wide: true,
        tall: false,
    },
    {
        code: "COMP4550",
        name: "Advanced Computing Research Project",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: [],
        warning: "Permission code, and a lot of other things, required.",
        wide: true,
        tall: true,
    },
    {
        code: "COMP4560",
        name: "Advanced Computing Project",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: [],
		incompat: ["COMP4500", "COMP4550"],
        warning: "Must be enrolled in a Bachelor of Advanced Computing, or a Bachelor of Advanced Computing / Science.",
        wide: false,
        tall: true,
    },
    {
        code: "COMP4500",
        name: "Software Engineering Practice",
        sem1: true,
        sem2: false,
        prereq: ["COMP2120", "COMP3120", "COMP3500"],
        areaprereq: [],
		incompat: ["COMP4540"],
        warning: null,
        wide: false,
        tall: true,
    },
    {
        code: "COMP3500",
        name: "Software Engineering Project",
        sem1: true,
        sem2: false,
        prereq: ["COMP2100", "COMP2120"],
        areaprereq: ["12 COMP2"],
		incompat: [],
        warning: null,
        wide: false,
        tall: true,
    },
    {
        code: "COMP3120",
        name: "Managing Software Development",
        sem1: true,
        sem2: false,
        prereq: ["COMP2120/INFS2024"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP2620",
        name: "Logic",
        sem1: true,
        sem2: false,
        prereq: [],
        areaprereq: ["12 COMP/MATH"],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP3620",
        name: "Artificial Intelligence",
        sem1: true,
        sem2: false,
        prereq: ["COMP1110/COMP1140", "COMP2620"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP4620",
        name: "Advanced Topics in Artificial Intelligence",
        sem1: false,
        sem2: true,
        prereq: ["COMP3620"],
        areaprereq: [],
		incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP4691",
        name: "Optimisation",
        sem1: false,
        sem2: true,
        prereq: ["COMP3620", "MATH1013/MATH1115"],
        areaprereq: [],
        incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP3670",
        name: "Intro to Machine Learning",
        sem1: false,
        sem2: true,
        prereq: ["COMP1110/COMP1140"],
        areaprereq: [],
        incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "COMP4650",
        name: "Document Analysis",
        sem1: false,
        sem2: true,
        prereq: ["COMP1100/COMP1130/COMP1110/COMP1140/COMP1730/COMP2100", "COMP1600/MATH/STAT"],
        areaprereq: ["12 COMP3/INFS"],
        incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "*AACOM",
        name: "Bachelor of Advanced Computing (Honours)",
        sem1: true,
        sem2: false,
        prereq: [
            "COMP1600",
            "COMP2100",
            "COMP2120",
            "COMP2300",
            "COMP2310",
            "COMP2420",
            "COMP3600",
            "COMP4450",
            "MATH1005/MATH2222",
            "COMP1100/COMP1130",
            "COMP1110/COMP1140",
            "MATH1013/MATH1014/MATH1115/MATH1116/MATH2301/ENGN1211/STAT1008/STAT1003/COMP",
        ],
        areaprereq: ["6 COMP3/COMP4", "6 COMP", "48 !"],
        incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
    {
        code: "*AACRD",
        name: "Bachelor of Advanced Computing (Research & Development) (Honours)",
        sem1: true,
        sem2: false,
        prereq: [
            "COMP1130",
            "COMP1140",
            "COMP1600",
            "COMP2100",
            "COMP2120",
            "COMP2300",
            "COMP2310",
            "COMP2420",
            "COMP2550",
            "COMP2560",
            "COMP3600",
            "COMP3770",
            "COMP4550",
            "MATH1005/MATH2222",
            "MATH1013/MATH1115",
            "MATH1014/MATH1116/STAT1003/STAT1008"
        ],
        areaprereq: ["48 !"],
        incompat: [],
        warning: null,
        wide: false,
        tall: false,
    },
];

function getCoursesRunningBeforeAndConcurrently(gridY, codeToIgnore) {
    let output = [];

    for (let i = 0; i < courseArray.length; ++i) {
        if (courseArray[i].gridy <= gridY &&
            courseArray[i].gridx < COURSES_PER_SEM &&
            courseArray[i].code != codeToIgnore) {

            output.push(courseArray[i]);
        }
    }

    return output;
}

function getCoursesRunningBefore(gridY) {
    let output = [];

    for (let i = 0; i < courseArray.length; ++i) {
        if (courseArray[i].gridy < gridY && courseArray[i].gridx < COURSES_PER_SEM) {
            output.push(courseArray[i]);
        }
    }

    return output;
}

function containsCourse(array, targetCode) {
    /*
    * Only checks to the length of the targetCode string
    *
    * This means things like COMP3 will match all COMP3xxx courses,
    * and MATH will match all MATHxxxx courses.
    */

    for (let i = 0; i < array.length; ++i) {
        if (array[i].code.substr(0, targetCode.length) == targetCode || targetCode == "!") {
            return i;
        }
    }
    return -1;
}

function checkIncompatibilities(gridX, gridY) {
    let course = getCourseAtPosition(gridX, gridY);
    if (course == null) {
        return null;
    }
    let code = course.code;
    let courseData = getCourseDataFromCode(code);

    let priorAndConcurrentCourses = getCoursesRunningBeforeAndConcurrently(gridY, code);

    for (let i = 0; i < courseData.incompat.length; ++i) {
        if (containsCourse(priorAndConcurrentCourses, courseData.incompat[i]) != -1) {
            return courseData.incompat[i];
        }
    }

    return null;
}

function calculateAreaPrerequisites(courseData, needs, remaining, additional= []) {
    for (let j = 0; j < remaining.length; ++j) {
        console.log("REMAINING [" + j + "] " + remaining[j].code);
    }

    let reinsert = [];

    let pres = []
    for (let i = 0; i < courseData.areaprereq.length; ++i) {
        pres.push(courseData.areaprereq[i]);
    }
    while (additional.length) {
        pres.push(additional[0]);
        additional.splice(0, 1);
    }

    for (let i = 0; i < pres.length; ++i) {
        let amount = parseInt(pres[i].split(' ')[0]);
        let ors = pres[i].split(' ')[1].split('/');

        // 6 units per regular course
        amount = Math.floor(amount / 6);

        let amountFound = 0;

        for (let j = 0; j < ors.length && remaining.length > 0; ++j) {
            let index = 0;
            console.log("REMAINING (" + courseData.code + "): " + remaining);
            while (index != -1 && remaining.length > 0) {
                console.log("R: " + ors[j]);
                index = containsCourse(remaining, ors[j]);
                if (index != -1) {
                    let countsFor = 1;

                    let courseData = getCourseDataFromCode(remaining[index].code);

                    if (courseData != null && courseData.wide) countsFor *= 2;
                    if (courseData != null && courseData.tall) countsFor *= 2;
                    console.log(courseData.code + " Counts for: " + countsFor);

                    // TODO: if amountFound >= amount, remove it - but then add
                    // it back in afterwards so other courses may use it
                    if (amountFound >= amount) {
                        reinsert.push(remaining[index]);
                    }
                    remaining.splice(index, 1);

                    console.log("REMAINING LENGTH = ", remaining.length);
                    amountFound += countsFor;
                }
            }
        }

        if (amountFound < amount) {
            needs.push("*" + ((amount - amountFound) * 6) + " " + pres[i].split(' ')[1]);
        }

        while (reinsert.length) {
            remaining.push(reinsert[0]);
            reinsert.splice(0, 1);
        }
    }

    return needs;
}

function getCourseIndexByCode(courses, code) {
    for (let i = 0; i < courses.length; ++i) {
        if (courses[i].code == code && courses[i].gridx < COURSES_PER_SEM) {
            return i;
        }
    }
    return -1;
}

function checkPrerequisites(gridX, gridY) {
    let course = getCourseAtPosition(gridX, gridY);
    if (course == null) {
        return null;
    }
    let code = course.code;
    console.log("\n\n\nCHECKING PREREQ FOR " + code);
    let courseData = getCourseDataFromCode(code);

    let needs = [];

    if (code == "COMP2120") {
        /*
        * Ugly hack to allow for COMP2120 to be taken at the
        * same time as COMP2100 (the only prerequisite for
        * 2120 is 2100)
        */
        gridY++;
    }

    /* MATH2222 is weird */
    if (code == "MATH2222" && gridY == 0) {
        for (let i = 0; i < courseArray.length; ++i) {
            if (gridY == 0 && courseArray[i].code == "MATH1115" && courseArray[i].gridx < COURSES_PER_SEM) {
                return [];
            }
        }
    }

    let additional = [];

    let priorCourses = getCoursesRunningBefore(gridY);
    let otherCourses = getCoursesRunningBefore(gridY);

    if (code == "*AACOM") {
        let index = getCourseIndexByCode(priorCourses, "COMP4550");
        if (index == -1) {
            let index = getCourseIndexByCode(priorCourses, "COMP4560");
            if (index == -1) {
                needs.push("COMP4560/COMP4550");
                additional.push("12 COMP3/COMP4");
            } else {
                priorCourses.splice(index, 1);
                otherCourses.splice(index, 1);
                additional.push("12 COMP3/COMP4");
            }
        } else {
            priorCourses.splice(index, 1);
            otherCourses.splice(index, 1);
        }

        let indexA = getCourseIndexByCode(priorCourses, "ENGN3230");
        let indexB = getCourseIndexByCode(priorCourses, "VCUG3001");

        if (indexA == -1 && indexB == -1) {
            additional.push("12 COMP3/COMP4");
        } else if (indexA != -1 && indexB != -1) {
            // all good
        } else {
            priorCourses.splice(indexA, 1);
            otherCourses.splice(indexA, 1);
            additional.push("12 COMP3/COMP4");
        }
    }

    for (let i = 0; i < courseData.prereq.length; ++i) {
        let found = false;
        let ors = courseData.prereq[i].split("/");

        for (let j = 0; j < ors.length; ++j) {
            let index = containsCourse(otherCourses, ors[j]);
            if (index != -1) {
                otherCourses.splice(index, 1);
                found = true;
                break;
            }
        }

        if (!found) {
            needs.push(courseData.prereq[i]);
        }
    }

    if (code == "*AACOM" || code == "*AACRD") {
        needs.push("@");
        needs = calculateAreaPrerequisites(courseData, needs, otherCourses, additional);
        return needs;
    }

    return calculateAreaPrerequisites(courseData, needs, otherCourses);
}

function setMode(simple) {
    if (simple) {
        COURSES_PER_SEM = 5;
        YEARS_OF_DEGREE = 5;
    } else {
        COURSES_PER_SEM = 6;
        YEARS_OF_DEGREE = 6;
    }

    resizeCanvas();
}

function drawRect(x, y, w, h, colour) {
    context.fillStyle = colour;
    context.beginPath();
    context.rect(x, y, w, h);
    context.closePath();
    context.fill();
}

function drawRectWithOutline(x, y, w, h, colour, outlineColour, outlineWidth) {
    drawRect(x, y, w, h, colour);

    context.lineWidth = outlineWidth;
    context.strokeStyle = outlineColour;
    context.strokeRect(x, y, w, h);
}

function clearCanvas() {
    drawRect(0, 0, canvas.clientWidth, canvas.clientHeight, "#FFFFFF");

    for (let y = 0; y < 3 * YEARS_OF_DEGREE - 3; ++y) {
        for (let x = 0; x < COURSES_PER_SEM + SCRATCH_WIDTH + 1; ++x) {
            if (isGridPositionIllegal(x, y)) continue;

            let overload = x >= COURSES_PER_SEM_WITHOUT_OVERLOADING && x < COURSES_PER_SEM;
            let extendedDegree = y >= MINIMUM_YEARS_REQUIRED * 3 && x < COURSES_PER_SEM;
            let colour = (overload || extendedDegree) ? "#FFEEEE" : '#EEEEEE';
            drawRect(x * COURSE_WIDTH, y * COURSE_HEIGHT, COURSE_WIDTH, COURSE_HEIGHT, colour);
        }
    }
}

function renderWrappedText(text, x, y, maxWidth) {
    let wordsRemaining = text.replaceAll("\n", " \n ").split(" ");

    console.log("WORDS: " + wordsRemaining);

    while (wordsRemaining.length > 0) {
        let soFar = "";
        while (context.measureText(soFar + wordsRemaining[0]).width < maxWidth && wordsRemaining.length > 0) {
            if (wordsRemaining[0] == "\n") {
                wordsRemaining.splice(0, 1);
                break;
            }
            soFar += wordsRemaining[0] + " ";
            wordsRemaining.splice(0, 1);
        }

        context.fillText(soFar, x, y);
        y += 20;
    }
}

function renderDegreeErrorMessage(message, x, y) {
    let multiplier = 3;
    drawRectWithOutline(x, y - ERROR_MESSAGE_HEIGHT * 3, ERROR_MESSAGE_WIDTH, ERROR_MESSAGE_HEIGHT * 3, "#E0E0E0", "#000000", 1);

    context.fillStyle = "#000000";
    context.font = "14px Arial";
    renderWrappedText(message, x + 20, y - ERROR_MESSAGE_HEIGHT * 3 + 20, ERROR_MESSAGE_WIDTH - 30);
}

function renderErrorMessage(message, x, y) {
    drawRectWithOutline(x, y, ERROR_MESSAGE_WIDTH, ERROR_MESSAGE_HEIGHT, "#E0E0E0", "#000000", 1);

    context.fillStyle = "#000000";
    context.font = "14px Arial";
    renderWrappedText(message, x + 20, y + 20, ERROR_MESSAGE_WIDTH - 30);
}

function formatCodes(code) {
    if (code == "@") {
        return "24 units of a specialisation";
    }
    if (code[0] == '*') {
        let amount = parseInt(code.substring(1).split(" ")[0]);
        let codes = code.split(" ")[1].split("/");

        let output = amount + "+ units of any ";

        for (let i = 0; i < codes.length; ++i) {
            let last = i == codes.length - 1;

            if (codes[i].length == 4) {
                output += codes[i] + (last ? " courses" : " or ");
            } else if (codes[i] == "!") {
                output += "ANU courses" + (last ? "" : ", or ");
            } else {
                output += codes[i] + "xxx" + (last ? " courses" : " or ");
            }
        }

        return output;
    }

    let codes = code.split("/");
    let output = "";

    for (let i = 0; i < codes.length; ++i) {
        let last = i == codes.length - 1;
        if (codes[i].length == 4) {
            output += "any " + codes[i] + " course" + (last ? "" : ", or ");
        } else if (codes[i].length == 5) {
            output += "any " + codes[i] + "xxx-level course" + (last ? "" : ", or ");
        } else {
            output += codes[i] + (last ? "" : " or ");
        }
    }

    return output;
}

function renderCourseAtPosition(code, x, y) {
    let courseData = getCourseDataFromCode(code);

    let errorMessage = "";

    let courseColour = "#20C0FF";
    if (courseData == null) {
        // doesn't exist
        courseColour = "#808080";

    } else if ((draggingCourse != null && code == draggingCourse.code) || xToGridX(x) > COURSES_PER_SEM) {
        // dragging, or in the scratch area
        courseColour = "#20C0FF";

    } else {
        // normal course
        let prereq = checkPrerequisites(xToGridX(x), yToGridY(y));
        console.log("X2GX " + xToGridX(x));
        let incompat = checkIncompatibilities(xToGridX(x), yToGridY(y));

        if (prereq == null) {
            alert("ERROR");

        }
        if (incompat != null) {
            // incompatible courses
            courseColour = "#FF4040";
            errorMessage += "- Incompatible with " + incompat + "\n"
        }
        if (!doesCourseRunThere(code, x, y)) {
            // doesn't run in that semester
            courseColour = "#FF4040";
            errorMessage += (yToGridY(y) % 3 == 0)
                ? "- Does not run in semester 1\n"
                : "- Does not run in semester 2\n";

        }
        if (prereq.length) {
            // missing prerequisite

            let prereqStr = "       ";
            for (let i = 0; i < prereq.length; ++i) {
                let formatted = formatCodes(prereq[i]);

                if (formatted.indexOf(" or") == -1 || prereq.length == 1) {
                    prereqStr += formatted;
                } else {
                    prereqStr += "(" + formatted + ")";
                }

                if (i != prereq.length - 1) {
                    prereqStr += " AND\n       ";
                }
            }

            courseColour = "#FF4040";
            errorMessage += "- Missing prerequisite(s):\n" + prereqStr;
            if (code == "MATH2222") {
                errorMessage += "\n       (May be done alongside MATH1115 in first year instead)";
            }
            errorMessage += "\n";
        }
        if (courseData.warning != null) {
            if (courseData.warning == "Must be enrolled in the Bachelor of Advanced Computing (Research & Development)." &&
                getDegreeName() == "AACRD") {

            } else {
                if (errorMessage == "") courseColour = "#EEEE22";
                errorMessage += "- " + courseData.warning;
            }
        }
    }

    let width = COURSE_WIDTH;
    let height = COURSE_HEIGHT;
    if (courseData != null) {
        if (courseData.tall) height *= 2;
        if (courseData.wide) width *= 2;
    }
    if (courseData.code[0] == '*') {
        width = COURSE_WIDTH * COURSES_PER_SEM;
    }
    drawRectWithOutline(x, y, width, height,
        courseColour, "#000000", 1);

    if (code[0] != '*') {
        context.fillStyle = "#000000";
        context.font = "15px Arial";
        context.fillText(code, x + 5, y + 25);

        context.font = "14px Arial";
        renderWrappedText(courseData == null ? "???" : courseData.name, x + 5, y + 45, width - 10);
    } else {
        context.fillStyle = "#000000";
        context.font = "18px Arial";
        context.fillText(courseData.name, x + 5, y + 25);
    }

    if (errorMessage.length != 0) {
        let warningIcon = new Image();
        warningIcon.src = "warning.png";
        context.drawImage(warningIcon, x + width - 40, y + height - 40, 32, 32);
    }

    return errorMessage;
}

function renderCourse(course) {
    let x = course.gridx * COURSE_WIDTH;
    let y = course.gridy * COURSE_HEIGHT;

    return renderCourseAtPosition(course.code, x, y);
}

function renderDegreeChecker(mouseX, mouseY) {

}

function rerender(mouseX, mouseY) {
    clearCanvas();

    let mouseGridX = xToGridX(mouseX);
    let mouseGridY = yToGridY(mouseY);

    let errorMessage = null;
    let errorCourse = null;
    for (let i = 0; i < courseArray.length; i++) {
        let message = renderCourse(courseArray[i]);
        let courseData = getCourseDataFromCode(courseArray[i].code);

        /* It's called a HACKathon for a reason */
        if (message != "" &&
            ((mouseGridX == courseArray[i].gridx && mouseGridY == courseArray[i].gridy) ||
                (mouseGridX == courseArray[i].gridx + 1 && mouseGridY == courseArray[i].gridy && courseData && courseData.wide) ||
                (mouseGridX == courseArray[i].gridx && mouseGridY == courseArray[i].gridy + 1 && courseData && courseData.tall) ||
                (mouseGridX == courseArray[i].gridx + 1 && mouseGridY == courseArray[i].gridy + 1 && courseData && courseData.tall && courseData.wide) ||
                    mouseGridY == courseArray[i].gridy && courseData && courseData.code[0] == '*' && mouseGridX < COURSES_PER_SEM
            )) {
            errorMessage = message;
            errorCourse = courseArray[i];
        }
    }

    if (draggingCourse != null) {
        renderCourseAtPosition(draggingCourse.code, mouseX - draggingCourseOffsetX, mouseY - draggingCourseOffsetY);

    } else if (errorMessage != null) {
        let errorCourseData = getCourseDataFromCode(errorCourse.code);

        let width = COURSE_WIDTH;
        let height = COURSE_HEIGHT;
        if (errorCourseData != null) {
            if (errorCourseData.tall) height *= 2;
            if (errorCourseData.wide) width *= 2;
        }
        if (errorCourseData.code[0] == '*') {
            width = COURSE_WIDTH * COURSES_PER_SEM;
        }

        let baseX = errorCourse.gridx * COURSE_WIDTH;
        let baseY = errorCourse.gridy * COURSE_HEIGHT;
        if (mouseX - baseX >= width - 40 && mouseY - baseY >= height - 40) {
            if (errorCourseData.code[0] == '*') {
                renderDegreeErrorMessage(errorMessage, mouseX, mouseY);
            } else {
                renderErrorMessage(errorMessage, mouseX, mouseY);
            }
        }
    }

    renderDegreeChecker(mouseX, mouseY);
}

function getDegreeName() {
    if (document.getElementById("bac").checked) return "AACOM";
    if (document.getElementById("bacrd").checked) return "AACRD";

    return "OTHER";
}

function addCourse(code, gridx, gridy) {
    courseArray.push({
        gridx: gridx,
        gridy: gridy,
        code: code,
    });
}

function getCourseDataFromCode(code) {
    for (let i = 0; i < allCourseData.length; ++i) {
        if (allCourseData[i].code == code) {
            return allCourseData[i];
        }
    }

    return null;
}

function getCourseAtPositionViaMouse(gridX, gridY) {
    let course = getCourseAtPosition(gridX, gridY);
    if (course != null) return course;

    if (gridX > 0) {
        let otherCourse = getCourseAtPosition(gridX - 1, gridY);
        if (otherCourse) {
            let otherData = getCourseDataFromCode(otherCourse.code);
            if (otherData && otherData.wide) {
                return otherCourse;
            }
        }
    }

    if (gridY > 0) {
        let otherCourse = getCourseAtPosition(gridX, gridY - 1);
        if (otherCourse) {
            let otherData = getCourseDataFromCode(otherCourse.code);
            if (otherData && otherData.tall) {
                return otherCourse;
            }
        }
    }

    if (gridX > 0 && gridY > 0) {
        let otherCourse = getCourseAtPosition(gridX - 1, gridY - 1);
        if (otherCourse) {
            let otherData = getCourseDataFromCode(otherCourse.code);
            if (otherData && otherData.wide && otherData.tall) {
                return otherCourse;
            }
        }
    }

    return null;
}

function getCourseAtPosition(gridX, gridY) {
    for (let i = 0; i < courseArray.length; ++i) {
        let course = courseArray[i];

        if (course.gridx == gridX && course.gridy == gridY) {
            return course;
        }
    }

    return null;
}

function removeCourse(course) {
    // from here: https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value

    let index = courseArray.indexOf(course);
    if (index != -1) {
        courseArray.splice(index, 1);
    }
}

function xToGridX(x) {
    return Math.round((x - COURSE_WIDTH / 2) / COURSE_WIDTH);
}

function yToGridY(y) {
    return Math.round((y - COURSE_HEIGHT / 2) / COURSE_HEIGHT);
}

function doesCourseRunThere(code, x, y) {
    let gridX = xToGridX(x);
    let gridY = yToGridY(y);

    let course_data = getCourseDataFromCode(code);

    if (course_data == null || gridX >= COURSES_PER_SEM + 1) {
        return true;
    }

    if (gridY % 3 == 0) {
        // semester 1
        return course_data.sem1;

    } else {
        // semester 2
        return course_data.sem2;
    }
}

function mouseDownHandler(e) {
    let x = xToGridX(e.offsetX);
    let y = yToGridY(e.offsetY);

    let course = getCourseAtPositionViaMouse(x, y);

    if (course.code[0] == '*') {
        return;
    }

    if (course != null) {
        removeCourse(course);
        draggingCourseOriginalGridX = course.gridx;
        draggingCourseOriginalGridY = course.gridy;

        draggingCourseOffsetX = e.offsetX - course.gridx * COURSE_WIDTH;
        draggingCourseOffsetY = e.offsetY - course.gridy * COURSE_HEIGHT;
    }

    draggingCourse = course;
    updateFilter(e.offsetX, e.offsetY);
}

function isGridPositionIllegal(x, y, long, tall) {
    if (long) {
        return isGridPositionIllegal(x, y, false, tall) || isGridPositionIllegal(x + 1, y, false, tall);
    }
    if (tall) {
        return isGridPositionIllegal(x, y, long, false) || isGridPositionIllegal(x, y + 1, long, false);
    }

    // scratch area
    if (x == COURSES_PER_SEM) return true;

    // two semesters, with a gap in between
    if (y % 3 == 2 && x < COURSES_PER_SEM) return true;

    // final row is a gap, so don't put scratch area there
    if (y == YEARS_OF_DEGREE * 3 - 1) return true;

    // first year can't overload
    if (y < 3 && x >= COURSES_PER_SEM_WITHOUT_OVERLOADING && x < COURSES_PER_SEM) return true;

    // second year can't double overload
    if (y < 6 && x >= COURSES_PER_SEM_WITHOUT_OVERLOADING + 1 && x < COURSES_PER_SEM) return true;

    return x == -1 || y == -1 || getCourseAtPosition(x, y) != null;
}

function mouseUpHandler(e) {
    if (draggingCourse == null) {
        return;
    }

    let x = xToGridX(e.offsetX- draggingCourseOffsetX + COURSE_WIDTH / 2);
    let y = yToGridY(e.offsetY- draggingCourseOffsetY + COURSE_HEIGHT / 2);

    let courseData = getCourseDataFromCode(draggingCourse.code);

    if (isGridPositionIllegal(x, y, courseData != null && courseData.wide, courseData != null && courseData.tall) ||
        getCourseAtPositionViaMouse(x, y) != null) {
        /*
        * second conditional ensures we don't drag a course to the back end of a wide/tall course
        */

        // return to original position, as invalid
        // but allow dragging anywhere to scratch
        if (x < COURSES_PER_SEM) {
            x = draggingCourseOriginalGridX;
            y = draggingCourseOriginalGridY;
        }

    }

    draggingCourse.gridx = x;
    draggingCourse.gridy = y;
    courseArray.push(draggingCourse);

    draggingCourse = null;
    updateFilter(e.offsetX, e.offsetY);
}

function mouseMoveHandler(e) {
    console.log(getDegreeName());
    rerender(e.offsetX, e.offsetY);
}

function resizeCanvas(e) {
    context.canvas.width = (COURSES_PER_SEM + SCRATCH_WIDTH + 1) * COURSE_WIDTH;
    context.canvas.height = (YEARS_OF_DEGREE * 3 - 1) * COURSE_HEIGHT;
}

function addCoursesToScratch(filter) {
    let scratchInitialPosition = COURSES_PER_SEM + 1;

    let j = 0;
    for (let i = 0; i < allCourseData.length; ++i) {
        let matchesFilter = allCourseData[i].code.substring(0, filter.length) == filter;

        if ((filter.length == 0 || matchesFilter) && allCourseData[i].code[0] != '*') {
            if (containsCourse(courseArray, allCourseData[i].code) == -1 && (draggingCourse == null || draggingCourse.code != allCourseData[i].code)) {
                addCourse(allCourseData[i].code, scratchInitialPosition + j % SCRATCH_WIDTH, Math.floor(j / SCRATCH_WIDTH));
                ++j;
            }
        }
    }
}

function updateFilter(mouseX = 0, mouseY = 0) {
    for (let i = 0; i < courseArray.length; ++i) {
        if (courseArray[i].gridx > COURSES_PER_SEM || courseArray[i].gridy == YEARS_OF_DEGREE * 3 - 3) {
            courseArray.splice(i, 1);
            --i;
        }
    }

    if (getDegreeName() == "AACOM") addCourse("*AACOM", 0, YEARS_OF_DEGREE * 3 - 3);
    if (getDegreeName() == "AACRD") addCourse("*AACRD", 0, YEARS_OF_DEGREE * 3 - 3);

    addCoursesToScratch(document.getElementById("filterbox").value);
    rerender(mouseX, mouseY);
}

function resetAll() {
    courseArray = [];
    updateFilter(0, 0);
}

function addCommon() {
    addCourse("COMP1600", 2, 1);
    addCourse("COMP2100", 0, 3);
    addCourse("COMP2120", 0, 4);
    addCourse("COMP2300", 1, 3);
    addCourse("COMP2310", 1, 4);
    addCourse("COMP2420", 2, 3);
    addCourse("COMP3600", 0, 7);
}

function resetToCore() {
    courseArray = [];

    addCourse("COMP1100", 0, 0);
    addCourse("COMP1110", 0, 1);
    addCourse("MATH1013", 1, 0);
    addCourse("MATH1014", 1, 1);
    addCourse("MATH1005", 2, 0);

    addCommon();
    updateFilter();
}

function resetToCoreAdv() {
    courseArray = [];

    addCourse("COMP1130", 0, 0);
    addCourse("COMP1140", 0, 1);
    addCourse("MATH1115", 1, 0);
    addCourse("MATH1116", 1, 1);
    addCourse("MATH2222", 2, 0);

    addCourse("COMP2550", 3, 3);
    addCourse("COMP2560", 3, 4);

    addCommon();
    updateFilter();
}

setMode(true);
updateFilter();
canvas.onmousedown = mouseDownHandler;
canvas.onmouseup = mouseUpHandler;
canvas.onmousemove = mouseMoveHandler;