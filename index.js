
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
let COURSE_WIDTH = 200;
let COURSE_HEIGHT = 100;
let SCRATCH_WIDTH = 3;
let MINIMUM_YEARS_REQUIRED = 4;
let COURSES_PER_SEM_WITHOUT_OVERLOADING = 4;
let courseArray = [];
let draggingCourse;
let draggingCourseOriginalGridX;
let draggingCourseOriginalGridY;
let draggingCourseOffsetX;
let draggingCourseOffsetY;

let COURSES_PER_SEM = 6;
let YEARS_OF_DEGREE = 5;


// from here: https://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

function getText(url) {
    // read text from URL location
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader('Content-Type');
            if (type.indexOf("text") !== 1) {
                return request.responseText;
            }
        }
    }
}

let text = getText("courses.json");
console.log(text);
let allCourseData = JSON.parse(text);

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

    for (let y = 0; y < 3 * YEARS_OF_DEGREE - 1; ++y) {
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
    let wordsRemaining = text.split(' ');

    while (wordsRemaining.length > 0) {
        let soFar = "";
        while (context.measureText(soFar + wordsRemaining[0]).width < maxWidth && wordsRemaining.length > 0) {
            soFar += wordsRemaining[0] + " ";
            wordsRemaining.splice(0, 1);
        }

        context.fillText(soFar, x, y);
        y += 20;
    }
}

function renderCourseAtPosition(code, x, y) {
    let courseData = getCourseDataFromCode(code);

    let courseColour;
    if (courseData == null) {
        courseColour = "#808080";
    } else if (doesCourseRunThere(code, x, y) || (draggingCourse != null && code == draggingCourse.code)) {
        courseColour = "#20C0FF";
    } else {
        courseColour = "#FF4040";
    }

    drawRectWithOutline(x, y, COURSE_WIDTH, COURSE_HEIGHT,
        courseColour, "#000000", 1);

    context.fillStyle = "#000000";
    context.font = "16px Arial";
    context.fillText(code, x + 5, y + 25);

    context.font = "15px Arial";
    renderWrappedText(courseData == null ? "???" : courseData.name, x + 5, y + 45, COURSE_WIDTH - 10);
}

function renderCourse(course) {
    let x = course.gridx * COURSE_WIDTH;
    let y = course.gridy * COURSE_HEIGHT;

    renderCourseAtPosition(course.code, x, y);
}

function rerender(mouseX, mouseY) {
    clearCanvas();

    for (let i = 0; i < courseArray.length; i++) {
        renderCourse(courseArray[i]);
    }

    if (draggingCourse != null) {
        renderCourseAtPosition(draggingCourse.code, mouseX - draggingCourseOffsetX, mouseY - draggingCourseOffsetY);
    }
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

function getCourseAtPosition(x, y) {
    for (let i = 0; i < courseArray.length; ++i) {
        let course = courseArray[i];

        if (course.gridx == x && course.gridy == y) {
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

    if (course_data == null || gridX > COURSES_PER_SEM + 1) {
        console.log(course_data);
        return true;
    }

    if (gridY % 3 == 0) {
        // semester 1
        return course_data.sem1;
    } else {
        return course_data.sem2;
    }
}

function mouseDownHandler(e) {
    let x = xToGridX(e.offsetX);
    let y = yToGridY(e.offsetY);

    let course = getCourseAtPosition(x, y);

    if (course != null) {
        removeCourse(course);
        draggingCourseOriginalGridX = x;
        draggingCourseOriginalGridY = y;

        draggingCourseOffsetX = e.offsetX - x * COURSE_WIDTH;
        draggingCourseOffsetY = e.offsetY - y * COURSE_HEIGHT;
    }

    draggingCourse = course;
    rerender(e.offsetX, e.offsetY);
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

    if (isGridPositionIllegal(x, y, draggingCourse.long, draggingCourse.tall)) {
        // return to original position, as invalid
        x = draggingCourseOriginalGridX;
        y = draggingCourseOriginalGridY;
    }

    draggingCourse.gridx = x;
    draggingCourse.gridy = y;
    courseArray.push(draggingCourse);

    draggingCourse = null;

    rerender(e.offsetX, e.offsetY);
}

function mouseMoveHandler(e) {
    if (draggingCourse != null) {
        rerender(e.offsetX, e.offsetY);
    }
}

function resizeCanvas(e) {
    context.canvas.width = (COURSES_PER_SEM + SCRATCH_WIDTH + 1) * COURSE_WIDTH;
    context.canvas.height = (YEARS_OF_DEGREE * 3 - 1) * COURSE_HEIGHT;
}

function addBasicCourses() {
    // TODO: clear the scratch

    let scratchInitialPosition = COURSES_PER_SEM + 1;

    let course_list = [
        "COMP1100",
        "COMP1130",
        "COMP1110",
        "COMP1140",
        "COMP1600",
    ]

    for (let i = 0; i < course_list.length; ++i) {
        addCourse(course_list[i], scratchInitialPosition + i % 3, Math.floor(i / 3));
    }
}

setMode(true);
addBasicCourses();
rerender(0, 0);
canvas.onmousedown = mouseDownHandler;
canvas.onmouseup = mouseUpHandler;
canvas.onmousemove = mouseMoveHandler;