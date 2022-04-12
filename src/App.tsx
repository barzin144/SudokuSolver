import React from "react";
import "./styles.scss";

const emptySudoku = () => {
  const sudoku: number[][] = [];
  for (let row = 0; row < 9; row++) {
    let row: number[] = [];
    for (let col = 0; col < 9; col++) {
      row.push(0);
    }
    sudoku.push(row);
    row = [];
  }
  return sudoku;
};

const App = () => {
  const [sudoku, setSudoku] = React.useState(emptySudoku());
  const [unSolvedSudoku, setUnSolvedSudoku] = React.useState(null);
  const [startSolve, setStartSolve] = React.useState({ start: false, solved: false });
  const [unSolveable, setUnSolveable] = React.useState(false);

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    let value = e.target.value;
    let asciiCode = value.charCodeAt(0);
    let newSudoku = [...sudoku];
    const form = e.target.form;
    if (asciiCode >= 48 && asciiCode <= 57) {
      let intValue = parseInt(value);
      if (intValue === 0) {
        (form.elements[row * 9 + col + 1] as HTMLElement).focus();
      } else if (changeCellValue(newSudoku, intValue, row, col)) {
        (form.elements[row * 9 + col + 1] as HTMLElement).focus();
      }
    } else {
      changeCellValue(newSudoku, 0, row, col);
    }
  };

  const changeCellValue = (newSudoku: number[][], value: number, row: number, col: number) => {
    if (value === 0) {
      newSudoku[row][col] = value;
      setSudoku(newSudoku);
      return true;
    } else if (isValidValue(value, row, col)) {
      newSudoku[row][col] = value;
      setSudoku(newSudoku);
      return true;
    } else {
      newSudoku[row][col] = 0;
      setSudoku(newSudoku);
      return false;
    }
  };

  const isValidValue = (newValue: number, row: number, col: number) => {
    for (let i = 0; i < 9; i++) {
      if (sudoku[i][col] === newValue || sudoku[row][i] === newValue) {
        return false;
      }
    }
    let squerRowStartIndex = Math.floor(row / 3) * 3;
    let squerColtartIndex = Math.floor(col / 3) * 3;

    for (let rowIndex = squerRowStartIndex; rowIndex < squerRowStartIndex + 3; rowIndex++) {
      for (let colIndex = squerColtartIndex; colIndex < squerColtartIndex + 3; colIndex++) {
        if (sudoku[rowIndex][colIndex] === newValue) {
          return false;
        }
      }
    }
    return true;
  };

  const solveIt = () => {
    const unSolved = sudoku.map((row, rowIndex) => {
      const cols = row.map((col, colIndex) => {
        return (
          <div
            className={`sudokuCellDiv ${colIndex % 3 == 2 ? "mr-1" : ""}`}
            key={`row${rowIndex + 1}-col${colIndex + 1}`}
          >
            {sudoku[rowIndex][colIndex] != 0 ? sudoku[rowIndex][colIndex] : ""}
          </div>
        );
      });

      return (
        <div className={`sudokuRow ${rowIndex % 3 == 2 ? "mb-1" : ""}`} key={`row${rowIndex + 1}`}>
          {cols}
        </div>
      );
    });

    setUnSolvedSudoku(unSolved);
    setStartSolve({ start: true, solved: false });

    if (solve() === true) {
      setStartSolve({ start: true, solved: true });
    } else {
      setUnSolveable(true);
    }
  };

  const solve = () => {
    const { row, col } = findFree().next().value;
    if (row === -1 && col === -1) {
      return true;
    }

    let newSudoku = [...sudoku];
    for (let guessNumber = 1; guessNumber < 10; guessNumber++) {
      if (changeCellValue(newSudoku, guessNumber, row, col) === false) {
        continue;
      }
      if (solve() === false) {
        changeCellValue(newSudoku, 0, row, col);
        continue;
      } else {
        return true;
      }
    }

    return false;
  };

  function* findFree() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (sudoku[row][col] === 0) {
          yield { row, col };
        }
      }
    }
    return { row: -1, col: -1 };
  }

  const clear = () => {
    setStartSolve({ start: false, solved: false });
    setUnSolveable(false);
    setSudoku(emptySudoku());
  };

  const puzzle = sudoku.map((row, rowIndex) => {
    const cols = row.map((col, colIndex) => {
      return (
        <input
          type={"text"}
          className={`sudokuCell ${colIndex % 3 == 2 ? "mr-1" : ""}`}
          maxLength={1}
          autoComplete={"off"}
          key={`row${rowIndex + 1}-col${colIndex + 1}`}
          onChange={(e) => inputChange(e, rowIndex, colIndex)}
          value={sudoku[rowIndex][colIndex] != 0 ? sudoku[rowIndex][colIndex] : ""}
        />
      );
    });

    return (
      <div className={`sudokuRow ${rowIndex % 3 == 2 ? "mb-1" : ""}`} key={`row${rowIndex + 1}`}>
        {cols}
      </div>
    );
  });

  return (
    <div className="mt-5 d-flex flex-column align-items-center">
      <div>
        <form>{startSolve.start ? unSolvedSudoku : puzzle}</form>
      </div>
      {startSolve.solved && (
        <div className="alert alert-success text-center mt-2" role="alert">
          Solved
        </div>
      )}
      {startSolve.solved && <div>{puzzle}</div>}
      <div className="mt-2 text-center">
        {unSolveable && (
          <div className="alert alert-danger text-center" role="alert">
            This puzzle is unSolvable
          </div>
        )}
        <div className="btn-group" role="group" aria-label="Control buttons">
          <button
            className="btn btn-outline-info"
            onClick={solveIt}
            disabled={(startSolve.start && startSolve.solved) || unSolveable}
          >
            Solve
          </button>
          <button className="btn btn-outline-info" onClick={clear}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
