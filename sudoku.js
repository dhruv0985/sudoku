const N = 9; // Size of the grid
const EASY = 46;   // Number of cells to remove for easy level
const MEDIUM = 51; // Number of cells to remove for medium level
const HARD = 56;   // Number of cells to remove for hard level

let board = Array(N).fill().map(() => Array(N).fill(0)); // Initial puzzle grid
let solution = Array(N).fill().map(() => Array(N).fill(0)); // To store the solution
let domains = Array(N).fill().map(() => Array(N).fill().map(() => [])); // Domains for each cell

// Helper Functions
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Sudoku Generator Class
class SudokuGenerator {
    constructor() {
        this.randomizeGrid(); // Randomize the first row
        this.solveSudoku();    // Solve the puzzle fully
        solution = this.copyBoard(board); // Store solution after solving
    }

    randomizeGrid() {
        let values = [...Array(N).keys()].map(x => x + 1); // Fill values 1-9
        shuffle(values);
        for (let i = 0; i < N; i++) {
            board[0][i] = values[i];
        }
        this.solveSudoku(); // Solve the board after initializing the first row
    }

    isSafe(row, col, num) {
        // Check row and column for the number
        for (let i = 0; i < N; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }

        // Check 3x3 sub-grid for the number
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        return true;
    }

    solveSudoku() {
        for (let row = 0; row < N; row++) {
            for (let col = 0; col < N; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= N; num++) {
                        if (this.isSafe(row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku()) return true;
                            board[row][col] = 0; // Backtrack
                        }
                    }
                    return false;
                }
            }
        }
        return true; // Puzzle solved
    }

    removeNumbers(numRemove) {
        let count = 0;
        while (count < numRemove) {
            const row = Math.floor(Math.random() * N);
            const col = Math.floor(Math.random() * N);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                count++;
            }
        }
    }

    copyBoard(board) {
        return board.map(row => row.slice());
    }
}

// AC-3 Algorithm to enforce arc consistency
function ac3() {
    let queue = [];

    // Initialize the queue with all arcs (row-column pairs for each unassigned cell)
    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            if (board[row][col] === 0) {
                // Add all possible numbers for the cell
                domains[row][col] = [...Array(N).keys()].map(x => x + 1);
                queue.push([row, col]);
            }
        }
    }

    while (queue.length > 0) {
        const [row, col] = queue.shift();

        // For each neighbor (row/column/box), reduce the domain of the current cell
        for (let num of domains[row][col]) {
            if (!isValidMove(row, col, num)) {
                domains[row][col] = domains[row][col].filter(n => n !== num);
                if (domains[row][col].length === 1) {
                    queue.push([row, col]);
                }
            }
        }
    }
}

// Check if the input is a valid Sudoku move
function isValidMove(row, col, value) {
    // Check row and column for duplicates
    for (let i = 0; i < N; i++) {
        if (board[row][i] === value || board[i][col] === value) return false;
    }

    // Check 3x3 box for duplicates
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === value) return false;
        }
    }
    return true;
}

// Function to print the Sudoku grid on the webpage
function setupGrid() {
    const sudokuGrid = document.getElementById('sudokuGrid');
    sudokuGrid.innerHTML = ''; // Clear any existing grid

    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = 1;
            cell.value = board[row][col] === 0 ? '' : board[row][col];
            cell.readOnly = board[row][col] !== 0; // Pre-filled cells are read-only

            cell.addEventListener('input', (e) => handleInput(e, row, col));
            sudokuGrid.appendChild(cell);
        }
    }
}

// Handle input and check for validity
function handleInput(event, row, col) {
    const input = event.target;
    const value = parseInt(input.value);

    // If input is empty, remove the red background
    if (!input.value) {
        input.classList.remove('invalid');
        board[row][col] = 0;
        return;
    }

    // Check for validity and add/remove the 'invalid' class
    if (!isNaN(value) && value >= 1 && value <= 9 && isValidMove(row, col, value)) {
        input.classList.remove('invalid');
        board[row][col] = value;

        // After a move, enforce arc consistency
        ac3();
    } else {
        input.classList.add('invalid');
    }
}

// Display the solution when the stop button is clicked
document.getElementById('stopButton').addEventListener('click', () => {
    const solutionGrid = document.getElementById('solutionGrid');
    solutionGrid.innerHTML = ''; // Clear any previous solution

    for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.value = solution[row][col];
            cell.readOnly = true;
            solutionGrid.appendChild(cell);
        }
    }
});

// Set up the puzzle based on the selected difficulty level
function startNewGame() {
    // Reset board to empty before starting a new game
    board = Array(N).fill().map(() => Array(N).fill(0));

    const level = parseInt(document.getElementById('difficultyLevel').value);
    const puzzle = new SudokuGenerator();

    if (level === 1) {
        puzzle.removeNumbers(EASY);
    } else if (level === 2) {
        puzzle.removeNumbers(MEDIUM);
    } else if (level === 3) {
        puzzle.removeNumbers(HARD);
    }

    // Refresh the board after setting up the puzzle
    setupGrid(); // Create the puzzle grid
}

// Event listener to reset grid on difficulty change
document.getElementById('difficultyLevel').addEventListener('change', startNewGame);

// Start a new game on page load
window.addEventListener('load', startNewGame);
