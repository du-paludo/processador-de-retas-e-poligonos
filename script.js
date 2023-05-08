const canvas = document.getElementById('idCanvas');
const context = canvas.getContext('2d');

let isDragging = false;
let selectedCorner = null;
let startX = 0;
let startY = 0;

let lineCoords = {
    x1: 200,
    y1: 300,
    x2: 600,
    y2: 300
}

function drawLine(lineCoords) {
    // Define as coordenadas iniciais e finais da linha
    const xInicial = lineCoords.x1;
    const yInicial = lineCoords.y1;
    const xFinal = lineCoords.x2;
    const yFinal = lineCoords.y2;
  
    // Configura a espessura e a cor da linha
    context.lineWidth = 4;
    context.strokeStyle = "#000000";
  
    // Desenha a linha
    context.beginPath();
    context.moveTo(xInicial, yInicial);
    context.lineTo(xFinal, yFinal);
    context.stroke();
}

function getMousePos(event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
}

function isPointOnLine(line, point) {
    // Calcula a distância entre o ponto e cada extremidade da linha
    const distToStart = Math.sqrt((point.x - line[0].x) ** 2 + (point.y - line[0].y) ** 2);
    const distToEnd = Math.sqrt((point.x - line[1].x) ** 2 + (point.y - line[1].y) ** 2);
  
    // Calcula a distância entre as extremidades da linha
    const lineLength = Math.sqrt((line[1].x - line[0].x) ** 2 + (line[1].y - line[0].y) ** 2);
  
    // Calcula a tolerância em relação à linha para considerar o ponto como pertencente à linha
    const tolerance = 5;
  
    // Verifica se a distância do ponto para cada extremidade da linha
    // é menor ou igual à distância entre as extremidades da linha
    return Math.abs(distToStart + distToEnd - lineLength) <= tolerance;
  }

function distance(x1, y1, x2, y2) {
    // Retorna a distância euclidiana entre dois pontos
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx*dx + dy*dy);
}

function updateLine() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawLine(lineCoords);
}
  
document.addEventListener('mousedown', function(event) {
    const cornerRadius = 10;
    const mousePos = getMousePos(event);

    if (distance(mousePos.x, mousePos.y, lineCoords.x1, lineCoords.x2) < cornerRadius) {
        selectedCorner = 'x1y1';
        isDragging = true;
        startX = mousePos.x;
        startY = mousePos.y;
    } else if (distance(mousePos.x, mousePos.y, lineCoords.x2, lineCoords.y2) < cornerRadius) {
        selectedCorner = 'x2y2';
        isDragging = true;
        startX = mousePos.x;
        startY = mousePos.y;
    } else if (isPointOnLine([{x: lineCoords.x1, y: lineCoords.y1}, {x: lineCoords.x2, y: lineCoords.y2}], mousePos)) {
        isDragging = true;
        startX = mousePos.x;
        startY = mousePos.y;
    }
    context.moveTo(mouseX, mouseY);
    console.log('Mouse position:', mouseX, mouseY);
  });

document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        const mousePos = getMousePos(event);
        if (selectedCorner === 'x1y1') {
            lineCoords.x1 = mousePos.x;
            lineCoords.y1 = mousePos.y;
        } else if (selectedCorner === 'x2y2') {
            lineCoords.x2 = mousePos.x;
            lineCoords.y2 = mousePos.y;
        }
        updateLine()
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    selectedCorner = null;
});

drawLine(lineCoords);