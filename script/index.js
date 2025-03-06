const CASA_VAZIA = null;
const MARCADOR_X = false;
const MARCADOR_O = true;

let jogadasFeitas = 0;
let turnoTime = false;
let pontosX = 0;
let pontosO = 0.
let casasMarcadas = [
    [CASA_VAZIA, CASA_VAZIA, CASA_VAZIA],
    [CASA_VAZIA, CASA_VAZIA, CASA_VAZIA],
    [CASA_VAZIA, CASA_VAZIA, CASA_VAZIA],
]

const SEARCH_DIRECTIONS = [
    [
        [0, 1],
        [0, -1]
    ],
    [
        [1, 0],
        [-1, 0]
    ],
    [
        [1, 1],
        [-1, -1]
    ],
    [
        [-1, 1],
        [1, -1]
    ],
]

const limparQuadriculado = () => {
    casasMarcadas = [
        [CASA_VAZIA, CASA_VAZIA, CASA_VAZIA],
        [CASA_VAZIA, CASA_VAZIA, CASA_VAZIA],
        [CASA_VAZIA, CASA_VAZIA, CASA_VAZIA],
    ];
}

const getCasaCoords = (casa) => {
    return [parseInt(casa.dataset.x), parseInt(casa.dataset.y)]
}

const casaInNextDirection = ([x, y], direction) => {
    const nextX = x + direction[0];
    const nextY = y + direction[1];

    const row = casasMarcadas[nextX];

    if (row === undefined) {
        return undefined;
    }

    return row[nextY];
}

const formouRisco = (casaMarcada, tipoMarcador) => {
    const [x, y] = getCasaCoords(casaMarcada);

    let winner = null;
    let casasDoRisco = [
        [x, y],
    ];

    for (const directions of SEARCH_DIRECTIONS) {
        let casasAdjacentes = 0;

        for (const direction of directions) {
            let currentX = x;
            let currentY = y;

            let nextCasa = null;

            while (nextCasa !== undefined) {
                nextCasa = casaInNextDirection([currentX, currentY], direction);

                if (nextCasa === CASA_VAZIA || nextCasa === undefined || nextCasa !== tipoMarcador) {
                    break;
                }

                casasDoRisco.push(nextCasa);
                casasAdjacentes += 1;

                // Continuar buscando na mesma direção
                currentX += direction[0];
                currentY += direction[1];
            }
        }

        if (casasAdjacentes === 2) {
            winner = tipoMarcador;

            break;
        }
    }

    return [winner, casasDoRisco];
}

const updateGameState = (casaMarcada, tipoMarcador) => {
    const [winner, posicoesMarcadas] = formouRisco(casaMarcada, tipoMarcador);

    if (jogadasFeitas < 9 && winner === null) {
        return;
    }

    console.log(winner)

    if (winner === MARCADOR_X) {
        ++pontosX;

        document.getElementById("pontos-x").textContent = pontosX;
    } else if (winner === MARCADOR_O) {
        ++pontosO;

        document.getElementById("pontos-o").textContent = pontosO;
    }

    turnoTime = true;
    jogadasFeitas = 0;
    limparQuadriculado();
    updateQuadriculado();
}

const updateQuadriculado = () => {
    for (let casa of casas) {
        const [x, y] = getCasaCoords(casa)
        const casaMarcada = casasMarcadas[x][y];
        const spanMarcador = casa.querySelector('span');

        let marcador = ""

        if (casaMarcada === MARCADOR_X) {
            marcador = "X";
        } else if (casaMarcada === MARCADOR_O) {
            marcador = "O";
        }

        spanMarcador.textContent = marcador;
    }
}

const casas = document.getElementsByClassName("casa");

const onCasaClick = (casa) => {
    const [x, y] = getCasaCoords(casa)
    const casaMarcada = casasMarcadas[x][y];

    if (casaMarcada !== CASA_VAZIA) {
        return;
    }

    casasMarcadas[x][y] = turnoTime;
    ++jogadasFeitas;

    updateGameState(casa, turnoTime)
    updateQuadriculado()

    turnoTime = !turnoTime
}

for (let casa of casas) {
    casa.addEventListener("click", (e) => {
        onCasaClick(casa);
    })
}