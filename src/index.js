import * as gestures from "./gestures.js"        // importa os gestos definidos em gestures.js

const canvas = document.querySelector("#pose-canvas");                          // Dom: canvas para desenhar os pontos de cada mão
const video = document.querySelector("#pose-video");                            // Dom: vídeo que será analisado
const rightHandGestureIcon = document.querySelector("#pose-result-right");      // Dom: resultado do lado direito
const leftHandGestureIcon = document.querySelector("#pose-result-left");        // Dom: resultado do lado esquerdo
const canvasContext = canvas.getContext("2d");                                  // contexto do canvas

const videoConfig = {               // configurações do vídeo
    width: 640,                     // largura do vídeo
    height: 480,                    // altura do vídeo
    fps: 60                         // frames por segundo
}

const handDrawPointsColors = {
    thumb: 'red',                   // dedo polegar
    index: 'blue',                  // dedo indicador
    middle: 'yellow',               // dedo médio
    ring: 'green',                  // dedo anelar
    pinky: 'pink',                  // dedo mindinho
    wrist: 'white'                  // punho
}

const gesturesStrings = {            // emojis para reconhecimento dos gestos 
    'thumbs_up': '👍',
    'victory': '✌🏻',
    'rock': '✊🏻',
    'paper': '🖐',
    'scissors': '✌🏻',
    'cancel': '👎'
}

const gesturesList = [               // lista de gestos que serão reconhecidos
    fp.Gestures.VictoryGesture,
    fp.Gestures.ThumbsUpGesture,
    gestures.RockGesture,
    gestures.PaperGesture,
    gestures.ScissorsGesture,
    gestures.CancelGesture
];

const handGestureIcons = {            // Dom: emoji que será exibido para cada gesto reconhecido 
    right: rightHandGestureIcon,
    left: leftHandGestureIcon
};

const directionsBaseString = ['Horizontal ', 'Diagonal Up '];                               // array com as direções possíveis
const curlBaseString = ['No Curl', 'Half Curl', 'Full Curl'];                               // array com os tipos de curvatura possíveis

const twoHandsGestures = {                                                                  // array com os gestos que podem ser feitos com as duas mãos 
    cancel: {                                                                               // gesto cancelar
        left: directionsBaseString.map(direction => direction.concat('Right')),             // array com as direções possíveis para a mão esquerda do gesto cancelar
        right: directionsBaseString.map(direction => direction.concat('Left'))              // array com as direções possíveis para a mão direita do gesto cancelar
    }
}

const hands = new Set();

function checkGestureCombination(chosenHand, poseData, gestureString) {

    // chosendHand: 'left' ou 'right'
    // poseData: array de arrays com os dados de cada dedo (ex: [['THUMB', 'NO_CURL', 'DIAGONAL_UP_RIGHT'], ['INDEX', 'NO_CURL', 'DIAGONAL_UP_RIGHT'], ...])
    // gestureString: string com o nome do gesto (ex: 'cancel')

    addToHandsIfCorrect(chosenHand, poseData, gestureString);
    if (hands.size !== 2) return;                                                                           // se o set não tiver as duas mãos, não exibe o emoji do gesto
    handGestureIcons.left.innerHTML = handGestureIcons.right.innerHTML = gesturesStrings[gestureString];    // se o set tiver as duas mãos, exibe o emoji do gesto
    hands.clear();                                                                                          // limpa o set para que o emoji do gesto não seja exibido novamente
}


function addToHandsIfCorrect(chosenHand, poseData, gestureString) {            // função que verifica se a mão escolhida está fazendo o gesto correto 
    const isATwoHandsGestures = poseData.some(finger => {             
        // const fingerName = finger[0];
        // const fingerCurl = finger[1];
        const fingerDirection = finger[2];
        const gestureName = twoHandsGestures[gestureString];
        return gestureName[chosenHand].includes(fingerDirection);              // verifica se a direção do dedo está entre as direções possíveis do gesto 
    });
    if (!isATwoHandsGestures) return;                                          // se a mão não estiver fazendo o gesto correto, não adiciona a mão ao set
    hands.add(chosenHand);                                                     // adiciona a mão ao set se estiver fazendo o gesto correto
}


function createHandsDetector() {
    return window.handPoseDetection.createDetector(                                             // cria o detector de mãos
        window.handPoseDetection.SupportedModels.MediaPipeHands,                                // modelo de detecção de mãos do mediapipe
        {
            runtime: "mediapipe",                                                               // runtime do mediapipe hands)
            modelType: "full",                                                                  // modelo completo de detecção de mãos (full significa que detecta os 21 pontos de cada mão)
            maxHands: 2,                                                                        // número máximo de mãos detectadas
            solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915`,       // versão do mediapipe hands 
        }
    );
}


async function main() {

    const gestureEstimator = new fp.GestureEstimator(gesturesList);                 // cria o estimador de gestos com os gestos de gesturesList
    const handsDetector = await createHandsDetector();                              // cria o detector de mãos 

    async function estimateHands() {

        canvasContext.clearRect(0, 0, videoConfig.width, videoConfig.height);           // limpa o canvas para desenhar os pontos de cada frame (se não limpar, os pontos ficam acumulados)
        handGestureIcons.right.innerText = handGestureIcons.left.innerText = '';        // limpa os emojis de cada mão 

        const hands = await handsDetector.estimateHands(video, { flipHorizontal: true });        // detecta as mãos no vídeo e retorna um array de mãos, (flipHorizontal: true inverte a imagem para que a detecção seja feita corretamente)

        for (const hand of hands) {                                                              // para cada mão detectada

            for (const point of hand.keypoints) {                                                // para cada ponto de cada mão detectada
                const pointName = point.name.split('_')[0].toString().toLowerCase();             // pega o nome do ponto e transforma em minúsculo (ex: 'WRIST' -> 'wrist')
                const pointColor = handDrawPointsColors[pointName];                              // pega a cor do ponto de acordo com o nome do ponto (ex: 'wrist' -> 'white')
                drawPoint(canvasContext, point.x, point.y, 3, pointColor);                       // desenha o ponto na tela (canvas, x, y, raio, cor)
            }

            const handKeypoints = hand.keypoints3D.map(keypoint => [keypoint.x, keypoint.y, keypoint.z]);       // pega os pontos 3D de cada mão detectada e transforma em um array de arrays (ex: [[x1, y1, z1], [x2, y2, z2], ...])
            const estimatedGestures = gestureEstimator.estimate(handKeypoints, 9);                              // estima os gestos com os pontos 3D de cada mão detectada (9 é o número de frames que o mediapipe hands detecta)

            if (estimatedGestures.gestures.length > 0) {
                const detectedGesture = estimatedGestures.gestures.reduce((p, c) => (p.score > c.score) ? p : c);       // pega o gesto com maior score (maior probabilidade de ser o gesto correto)
                const gestureName = gesturesStrings[detectedGesture.name];                                              // pega o nome do gesto (ex: 'thumbs_up' -> '👍')
                const chosenHand = hand.handedness.toLowerCase();                                                       // pega a mão que está sendo detectada (ex: 'Right' -> 'right')

                updateDebugInfo(estimatedGestures.poseData, chosenHand);                                                // atualiza as informações de debug do lado da mão que está sendo detectada

                if (gestureName !== gesturesStrings.cancel) {
                    handGestureIcons[chosenHand].innerText = gestureName;                                               // mostra o emoji do gesto reconhecido no lado da mão que está sendo detectada
                    continue;
                }

                checkGestureCombination(chosenHand, estimatedGestures.poseData, detectedGesture.name);                  // verifica se a combinação de gestos está correta
            }
        }

        setTimeout(() => { estimateHands() }, 1000 / videoConfig.fps);      // chama a função estimateHands() novamente após 1000 / videoConfig.fps milissegundos (para que a função seja chamada a cada 1 / videoConfig.fps segundos)
    }

    estimateHands(); // chama a função looping estimateHands() pela primeira vez para iniciar a detecção de mãos e gestos 
}


async function initCamera(width, height, fps) {         // função para inicializar a câmera

    const cameraSettings = {                            // configurações da câmera
        audio: false,                                   // desativa o áudio
        video: {                                        // configurações do vídeo
            facingMode: "user",                         // configura a câmera frontal (user) ou traseira (environment)
            width: width,                               // largura do vídeo
            height: height,                             // altura do vídeo
            frameRate: { max: fps }                     // taxa de frames por segundo
        }
    }

    // pega o elemento de vídeo
    video.width = width;                                // configura a largura do vídeo
    video.height = height;                              // configura a altura do vídeo

    const stream = await navigator.mediaDevices.getUserMedia(cameraSettings);       // pega o stream da câmera com as configurações definidas em cameraConfig e aguarda a câmera ser inicializada
    video.srcObject = stream;                                                       // configura o stream da câmera no elemento de vídeo

    return video;
}


function drawPoint(canvasContext, x, y, r, color) {         // função para desenhar um ponto no canvas
    canvasContext.beginPath();                              // inicia o desenho
    canvasContext.arc(x, y, r, 0, 2 * Math.PI);             // desenha um círculo no ponto (x, y) com raio r e ângulo de 0 a 2 * Math.PI
    canvasContext.fillStyle = color;                        // configura a cor do círculo (preenchimento)
    canvasContext.fill();                                   // preenche o círculo com a cor definida em canvasContext.fillStyle
}


function updateDebugInfo(data, hand) {                                                                  // função para atualizar as informações de debug do lado da mão que está sendo detectada
    const summaryTable = `#summary-${hand}`;                                                            // pega a tabela de informações de debug do lado da mão que está sendo detectada
    for (let finger in data) {                                                                          // para cada dedo
        document.querySelector(`${summaryTable} span#curl-${finger}`).innerHTML = data[finger][1];      // atualiza a informação de curvatura do dedo
        document.querySelector(`${summaryTable} span#dir-${finger}`).innerHTML = data[finger][2];       // atualiza a informação de direção do dedo
    }
}


window.addEventListener("DOMContentLoaded", async () => {
    const videoCamera = await initCamera(videoConfig.width, videoConfig.height, videoConfig.fps);   // inicializa a câmera com as configurações definidas em videoConfig
    videoCamera.play();                                                                             // inicia a câmera (se não iniciar, o vídeo não será exibido)
    videoCamera.addEventListener("loadeddata", main());                                             // chama a função main() quando o vídeo for carregado
    canvas.width = videoConfig.width;                                                               // configura a largura do canvas
    canvas.height = videoConfig.height;                                                             // configura a altura do canvas
});