const CASA_VAZIA = null;
const MARCADOR_X = "X";
const MARCADOR_O = "O";
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

let jogadasFeitas = 0;
let turnoTime = MARCADOR_X;
let pontosX = 0;
let pontosO = 0;
let jogoConcluido = false;
let quadriculado = {
    elemento: document.getElementById("quadriculado"),
    grid: [
        [], [], []
    ],
    acharCasa: function (x, y) {
        const coluna = this.grid[x]

        if (coluna === undefined) {
            return undefined;
        }

        return coluna[y];
    },
    inserirCasa: function (x, y, casa) {
        const coluna = this.grid[x]

        if (coluna === undefined) {
            console.error("O valor de x deve estar entre 0 e 2");
        }

        if (y > 2) {
            console.error("O valor de y deve estar entre 0 e 2");
        }

        coluna[y] = casa;
    },
    getAllCasas: function () {
        let casas = [];

        for (const col of this.grid) {
            for (const casa of col) {
                casas.push(casa);
            }
        }

        return casas;
    }
}

const limparQuadriculado = () => {
    for (const casa of quadriculado.getAllCasas()) {
        casa.marcarCasa(CASA_VAZIA);
    }
}

const altenarTurno = () => {
    if (turnoTime === MARCADOR_X) {
        turnoTime = MARCADOR_O;
        document.documentElement.style.setProperty("--cor-jogador-atual", "blue")
    } else if (turnoTime === MARCADOR_O) {
        turnoTime = MARCADOR_X;
        document.documentElement.style.setProperty("--cor-jogador-atual", "red")
    }
}

const TEMPLATE_CASA = document.getElementById("casa-quadriculado");

function marcarCasa(marcador){
    if (marcador !== CASA_VAZIA && marcador !== MARCADOR_X && marcador !== MARCADOR_O) {
        console.error(`Erro, o marcador tem um valor inválido de ${marcador}`);
    }

    const elementoCasa = this.elemento
    const marcadoresAtivos = elementoCasa.getElementsByClassName("marcador-active");

    // Remover os marcadores presentes para não evitar a sobreposição
    for (const marcadorAtivo of marcadoresAtivos) {
        marcadorAtivo.classList.remove("marcador-active");
        elementoCasa.classList.remove("casa-ganhadora");
    }

    if (marcador === MARCADOR_X) {
        elementoCasa.querySelector(".marcador-x").classList.add("marcador-active");
    } else if (marcador === MARCADOR_O) {
        elementoCasa.querySelector(".marcador-o").classList.add("marcador-active");
    }

    this.marcador = marcador;
}

const createCasa = () => {
    const cloneCasa = TEMPLATE_CASA.cloneNode(true);
    const casa = cloneCasa.content.querySelector(".casa");
    const marcadores = casa.getElementsByClassName("marcador");
    const quadriculado = document.getElementById("quadriculado");

    quadriculado.appendChild(casa);

    return {
        marcador: CASA_VAZIA,
        elemento: casa,
        marcarCasa: marcarCasa,
    }
}

const casaInNextDirection = ([x, y], direction) => {
    const nextX = x + direction[0];
    const nextY = y + direction[1];

    return quadriculado.acharCasa(nextX, nextY)
}

const formouRisco = ([x, y, marcador]) => {
    let winner = null;
    let casasVencedoras = [];

    for (const directions of SEARCH_DIRECTIONS) {
        let casasAdjacentes = 0;

        for (const direction of directions) {
            let currentX = x;
            let currentY = y;

            let nextCasa = null;

            casasVencedoras.push([currentX, currentY]);

            while (nextCasa !== undefined) {
                nextCasa = casaInNextDirection([currentX, currentY], direction);

                if (nextCasa === undefined) {
                    break;
                }

                const marcadorCasa = nextCasa.marcador

                if (marcadorCasa === CASA_VAZIA || marcadorCasa !== marcador) {
                    break;
                }

                casasAdjacentes += 1;

                // Continuar buscando na mesma direção
                currentX += direction[0];
                currentY += direction[1];
                casasVencedoras.push([currentX, currentY]);
            }
        }

        if (casasAdjacentes === 2) {
            winner = marcador;

            break;
        } else {
            casasVencedoras = [];
        }
    }

    return [winner, casasVencedoras];
}

const updateGameState = (casaMarcada, tipoMarcador) => {
    const [winner, casasVencedoras] = formouRisco(casaMarcada, tipoMarcador);

    if (jogadasFeitas < 9 && winner === null) {
        return;
    }

    if (winner === MARCADOR_X) {
        ++pontosX;

        document.getElementById("pontos-x").textContent = pontosX;
    } else if (winner === MARCADOR_O) {
        ++pontosO;

        document.getElementById("pontos-o").textContent = pontosO;
    } else {
        quadriculado.elemento.classList.add("quadriculado-empatado");
    }

    casasVencedoras.forEach((posicao) => {
        const casa = quadriculado.acharCasa(posicao[0], posicao[1]);

        if (casa === undefined) {
            return;
        }

        casa.elemento.classList.add("casa-ganhadora");
    })

    jogoConcluido = true;

    setTimeout(() => {
        jogadasFeitas = 0;
        limparQuadriculado();
        jogoConcluido = false;

        turnoTime = MARCADOR_X;
        document.documentElement.style.setProperty("--cor-jogador-atual", "red")
        quadriculado.elemento.classList.remove("quadriculado-empatado");
    }, 1500);
}

const onCasaClick = ([casa, x, y]) => {
    if (jogoConcluido) {
        return;
    }

    if (casa.marcador !== CASA_VAZIA) {
        return;
    }
    casa.marcarCasa(turnoTime)

    ++jogadasFeitas;
    updateGameState([x, y, casa.marcador])

    altenarTurno();
}

for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
        const casa = createCasa();

        casa.elemento.addEventListener("click", (e) => {
            onCasaClick([casa, x, y]);
        })

        quadriculado.inserirCasa(x, y, casa);
    }
}