class Line {
    constructor(x1, y1, x2, y2) {
        this.dragging = false;
        this.connectedLeft = null;
        this.connectedRight = null;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    middlePoint() {
        return {
            x: (this.x1 + this.x2) / 2,
            y: (this.y1 + this.y2) / 2
        };
    }

    draw() {
        context.lineWidth = 2;
        context.strokeStyle = "#FFFFFF"; 
        // Draw the line
        context.beginPath();
        context.moveTo(this.x1, this.y1);
        context.lineTo(this.x2, this.y2);
        context.stroke();

        // Draw left circle
        context.beginPath();
        context.arc(this.x1, this.y1, 8, 0, 2 * Math.PI);
        context.fillStyle = "#6666FF"; // purple
        context.fill();
        context.stroke();

        // Draw middle circle
        context.beginPath();
        context.arc(this.middlePoint().x, this.middlePoint().y, 5, 0, 2 * Math.PI);
        context.fillStyle = "#82B66B"; // green
        context.fill();
        context.stroke();

        // Draw right circle
        context.beginPath();
        context.arc(this.x2, this.y2, 8, 0, 2 * Math.PI);
        context.fillStyle = "#6666FF"; // purple
        context.fill();
        context.stroke();
    }
}

const canvas = document.getElementById('idCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('2d');

canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('contextmenu', handleRightClick);

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateCanvas();
};

const tolerance = 8;
let lines = [];
let numLines = 0;
let isDragging = false;
let selectedIndex = null;
let selectedPoint = null;
let previousX = 0;
let previousY = 0;

function switchToLine() {
    console.log('Switching to line mode');

    // Empty the array of lines
    lines = [];
    // Create a new line and adds it to the array
    lines.push(new Line(canvas.width/4, canvas.height/2-100, canvas.width/2 * 3/2, canvas.height/2-100));
    numLines = 1

    updateCanvas();
}

function switchToPolygon(n) {
    console.log('Switching to polygon mode');

    lines = [];
    numLines = 0;
    // Convert the number of sides to an integer
    numSides = +n;

    const radius = 200;
    let x1, y1, x2, y2;

    // Draw regular polygon from center point
    for (let i = 0; i < numSides; i++) {
        x1 = radius * Math.cos(2 * Math.PI * i / numSides) + canvas.width/2;
        y1 = radius * Math.sin(2 * Math.PI * i / numSides) + canvas.height/2 - 100;
        x2 = radius * Math.cos(2 * Math.PI * (i + 1) / numSides) + canvas.width/2;
        y2 = radius * Math.sin(2 * Math.PI * (i + 1) / numSides) + canvas.height/2 - 100;
        lines.push(new Line(x1, y1, x2, y2));
        numLines++;
    }
    // Connect the lines
    for (let i = 0; i < numSides; i++) {
        lines[i].connectedLeft = lines[((i - 1 + numSides) % numSides)];
        lines[i].connectedRight = lines[(i + 1) % numSides];
    }

    updateCanvas();
}

function updateCanvas() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Draw all the lines
    for (let i = 0; i < numLines; i++) {
        lines[i].draw();
    }
}

function handleMouseDown(event) {
    const mousePos = getMousePos(event);
    for (let i = 0; i < numLines; i++) {
        // Check if the mouse is close enough to the left corner
        if (distanceToPoint(mousePos.x, mousePos.y, lines[i].x1, lines[i].y1) < tolerance) {
            console.log('Dragging left corner');
            selectedIndex = i;
            selectedPoint= 'x1y1';
            isDragging = true;
            break;
        // Check if the mouse is close enough to the right corner
        } else if (distanceToPoint(mousePos.x, mousePos.y, lines[i].x2, lines[i].y2) < tolerance) {
            console.log('Dragging right corner');
            selectedIndex = i;
            selectedPoint = 'x2y2';
            isDragging = true;
            break;
        // Check if the mouse is close enough to the middle point
        } else if (distanceToPoint(mousePos.x, mousePos.y, lines[i].middlePoint().x, lines[i].middlePoint().y) < tolerance) {
            console.log('Dragging middle point');
            selectedIndex = i;
            selectedPoint = 'middle';
            isDragging = true;
            // Save the mouse position
            previousX = mousePos.x;
            previousY = mousePos.y;
            break;
        }
    }       
}

function handleMouseMove(event) {
    if (isDragging) {
        const mousePos = getMousePos(event);
        // Get current line being dragged and its connected lines
        const selectedLine = lines[selectedIndex];
        const connectedLeft = selectedLine.connectedLeft;
        const connectedRight = selectedLine.connectedRight;
        if (selectedPoint == 'x1y1') {
            selectedLine.x1 = mousePos.x;
            selectedLine.y1 = mousePos.y;
            // If the left corner is connected to another line, update the other line's right corner
            if (connectedLeft != null) {
                connectedLeft.x2 = mousePos.x;
                connectedLeft.y2 = mousePos.y;
            }
        } else if (selectedPoint == 'x2y2') {
            selectedLine.x2 = mousePos.x;
            selectedLine.y2 = mousePos.y;
            // If the right corner is connected to another line, update the other line's left corner
            if (connectedRight != null) {
                connectedRight.x1 = mousePos.x;
                connectedRight.y1 = mousePos.y;
            }
        } else if (selectedPoint == 'middle') {
            const dx = mousePos.x - previousX;
            const dy = mousePos.y - previousY;
            // Update the selected line's coordinates
            selectedLine.x1 += dx;
            selectedLine.y1 += dy;
            selectedLine.x2 += dx;
            selectedLine.y2 += dy;
            // If the left corner is connected to another line, update the other line's right corner
            if (connectedLeft != null) {
                connectedLeft.x2 += dx;
                connectedLeft.y2 += dy;
            }
            // If the right corner is connected to another line, update the other line's left corner
            if (connectedRight != null) {
                connectedRight.x1 += dx;
                connectedRight.y1 += dy;
            }
            previousX = mousePos.x;
            previousY = mousePos.y;
        }
        updateCanvas();
    }
}

function handleMouseUp(event) {
    if (isDragging) {
        console.log('Stopped dragging');
        isDragging = false;
    }
}

function handleRightClick(event) {
    // Stops context menu from appearing
    event.preventDefault();
    const mousePos = getMousePos(event);
    for (let i = 0; i < numLines; i++) {
        // If mouse position is over a line, split the line in two with extreme points in the mouse position
        // and add a new line with the same extreme points as the original line
        if (distanceToLineSegment(mousePos.x, mousePos.y, lines[i].x1, lines[i].y1, lines[i].x2, lines[i].y2) < tolerance) {
            lines.push(new Line(mousePos.x, mousePos.y, lines[i].x2, lines[i].y2));
            console.log('Splitting line');
            lines[i].x2 = mousePos.x;
            lines[i].y2 = mousePos.y;
            // If the line that was split had another line connected to its right, connect the new line to that line
            if (lines[i].connectedRight != null) {
                lines[numLines].connectedRight = lines[i].connectedRight;
                lines[i].connectedRight.connectedLeft = lines[numLines];
            }
            // Connect the new line to the line that was split
            lines[i].connectedRight = lines[numLines];
            lines[numLines].connectedLeft = lines[i];
            numLines++;
            break;
        }
    }
    updateCanvas();
}

// Returns the mouse position relative to the canvas
function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Returns euclidean distance between two points
function distanceToPoint(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx*dx + dy*dy);
}

// Returns the distance between a point and a line segment
function distanceToLineSegment(x, y, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dotProduct = (x - x1) * dx + (y - y1) * dy;
    const squaredLength = dx * dx + dy * dy;
    
    let distance;
    
    if (dotProduct <= 0) {
        distance = distanceToPoint(x, y, x1, y1);
    } else if (dotProduct >= squaredLength) {
        distance = distanceToPoint(x, y, x2, y2);
    } else {
        const projection = dotProduct / squaredLength;
        const projectedPointX = x1 + dx * projection;
        const projectedPointY = y1 + dy * projection;
        distance = Math.sqrt((x - projectedPointX) * (x - projectedPointX) + (y - projectedPointY) * (y - projectedPointY));
    }
    return distance;
}

// Starts in line mode
switchToLine();

let input = document.getElementById('sides');

input.addEventListener('keyup', function(event) {
    if (event.key == "Enter") {
        const numSides = input.value;
        switchToPolygon(numSides);
    }
});