const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const uploadInput = document.getElementById('upload');
const uploadedImage = document.getElementById('uploadedImage');
const extractedTextArea = document.getElementById('extractedText');
const sendButton = document.getElementById('sendToChatGPT');
const responseDiv = document.getElementById('response');

// Acceder a la cámara
// navigator.mediaDevices.getUserMedia({ video: true })
//     .then(stream => {
//         video.srcObject = stream;
//     })
//     .catch(err => {
//         console.error("Error accessing the camera: ", err);
//     });

// Cargar la imagen y renderizar en el canvas para ver si se ve correctamente
captureButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Mostrar el canvas en la pantalla para verificar la imagen
    document.body.appendChild(canvas);

    processImage(canvas);
});


// Cargar y procesar imagen subida
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            uploadedImage.onload = () => {
                const context = canvas.getContext('2d');
                canvas.width = uploadedImage.width;
                canvas.height = uploadedImage.height;
                context.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

                processImage(canvas);
            };
        };
        reader.readAsDataURL(file);
    }
});

// Procesar imagen (tanto capturada como subida)
function processImage(canvas) {
    // Asegúrate de limpiar el canvas antes de cada uso
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    Tesseract.recognize(canvas, 'spa', { // Cambia 'eng' por 'spa'
        logger: m => console.log(m)
    }).then(({ data: { text } }) => {
        console.log("Recognized text: ", text);
        extractedTextArea.value = text;
    }).catch(err => {
        console.error("Error during OCR processing: ", err);
        extractedTextArea.value = "Error processing image. Please try again.";
    });
}


// Enviar texto a ChatGPT al hacer clic en el botón
sendButton.addEventListener('click', () => {
    const text = extractedTextArea.value;
    sendToChatGPT(text);
});

function sendToChatGPT(text) {
    const apiKey = 'YOUR_OPENAI_API_KEY';  // Reemplaza con tu clave de API de OpenAI
    const url = 'https://api.openai.com/v1/completions';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "text-davinci-003",  // O cualquier otro modelo que prefieras
            prompt: text,
            max_tokens: 150
        })
    })
    .then(response => response.json())
    .then(data => {
        const chatGPTText = data.choices[0].text.trim();
        responseDiv.textContent = chatGPTText;
    })
    .catch(err => {
        console.error("Error with ChatGPT request: ", err);
    });
}
