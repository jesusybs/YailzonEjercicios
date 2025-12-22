/**
 * PAINT PRO ULTRA - LÓGICA DE MANIPULACIÓN DE PÍXELES
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimizamos para lecturas frecuentes de píxeles

let isDrawing = false;
let startX, startY;
let currentTool = 'brush';
let snapshot; // Estado previo al dibujo actual

/**
 * 1. CONFIGURACIÓN DEL LIENZO
 */
function init() {
    // Establecemos un tamaño de lienzo estándar HD
    canvas.width = 1000;
    canvas.height = 700;
    
    // Fondo inicial blanco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 2. CARGA DE IMÁGENES EXTERNAS (File API)
 */
document.getElementById('imageLoader').addEventListener('change', function(e) {
    const reader = new FileReader(); // Lector de archivos del sistema
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Dibujamos la imagen centrada y escalada para que quepa
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
        img.src = event.target.result; // El contenido de la imagen en base64
    }
    reader.readAsDataURL(e.target.files[0]); // Leemos el archivo seleccionado
});

/**
 * 3. SISTEMA DE FILTROS (Manipulación de Píxeles RGBA)
 * Un píxel en canvas se representa por 4 valores en un array: [R, G, B, A]
 */
function applyFilter(type) {
    // Obtenemos todos los píxeles del lienzo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // Array unidimensional de píxeles

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];     // Rojo
        const g = data[i + 1]; // Verde
        const b = data[i + 2]; // Azul

        if (type === 'gray') {
            const avg = (r + g + b) / 3;
            data[i] = data[i+1] = data[i+2] = avg; // Gris: R=G=B
        } else if (type === 'invert') {
            data[i] = 255 - r;     // Invertir Rojo
            data[i+1] = 255 - g;   // Invertir Verde
            data[i+2] = 255 - b;   // Invertir Azul
        } else if (type === 'sepia') {
            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[i+1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[i+2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }
    }
    // Volvemos a colocar los píxeles modificados en el lienzo
    ctx.putImageData(imageData, 0, 0);
}

/**
 * 4. LÓGICA DE DIBUJO CON SNAPSHOT
 */
const startDraw = (e) => {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    
    // Guardamos foto del lienzo antes de empezar la nueva figura
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.strokeStyle = document.getElementById('colorPicker').value;
    ctx.lineWidth = document.getElementById('lineWidth').value;
    ctx.lineCap = "round";
};

const drawing = (e) => {
    if (!isDrawing) return;
    
    // RESTAURACIÓN: Borra el "fantasma" del movimiento anterior
    ctx.putImageData(snapshot, 0, 0);

    if (currentTool === 'brush') {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        // Actualizamos el snapshot en el pincel para que el trazo sea continuo
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else if (currentTool === 'rectangle') {
        ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    } else if (currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(startX - e.offsetX, 2) + Math.pow(startY - e.offsetY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = "white";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
};

/**
 * 5. EVENTOS
 */
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
window.addEventListener('mouseup', () => isDrawing = false);

// Herramientas
document.querySelectorAll('.tool').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool.active').classList.remove('active');
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
    });
});

// Filtros
document.getElementById('filterGray').addEventListener('click', () => applyFilter('gray'));
document.getElementById('filterInvert').addEventListener('click', () => applyFilter('invert'));
document.getElementById('filterSepia').addEventListener('click', () => applyFilter('sepia'));

// Feedback Grosor
document.getElementById('lineWidth').addEventListener('input', (e) => {
    document.getElementById('wLabel').innerText = e.target.value;
});

// Guardar
document.getElementById('downloadBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = "mi-diseno-pro.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});

window.onload = init;