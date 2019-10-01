import React, {Fragment, Component} from 'react';
import {padStart, cloneDeep, isEqual, flatten, random, sample, times, constant, concat, zip, unzip} from 'lodash';
import blessed from 'neo-blessed';
import {createBlessedRenderer} from 'react-blessed';
import chalk from 'chalk';

const get2or4 = () => sample(concat(times(5, constant(2)), times(5, constant(4))));

let score = 0;

const hasAvailableSpaces = rows => flatten(rows).some(c => c === 0);

const rowHasMoves = row => {
  let hasMoves = false;
  let cells = row.filter(c => c);
  if (cells.length < 4) {
    const newCells = Array.from({ length: 4 - cells.length }, () => 0);
    cells = [...newCells, ...cells];
  }
  for (let i = 0; i < cells.length; ++i) {
    if (cells[i] === cells[i+1]) {
      hasMoves = true;
      break;
    }
  }
  return hasMoves;
};

const hasAvailableMoves = rows => {
  let rs = cloneDeep(rows);
  let hasMoves = rs.some(row => rowHasMoves(row));
  if (!hasMoves) {
    rs = zip(...rs);
    hasMoves = rs.some(row => rowHasMoves(row));
  }
  return hasMoves;
};

const resetRows = () => {
  const rows = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  rows[random(3)][random(3)] = get2or4();
  let randRow = random(3);
  let randCol = random(3);
  while (rows[randRow][randCol] === 2) {
    randRow = random(3);
    randCol = random(3);
  }
  rows[randRow][randCol] = get2or4();
  return rows;
};

const colors = {
  0: {
    text: () => {},
    style: () => ({ bg: '' })
  },
  2: {
    text: val => chalk.bgWhite.black(val),
    style: val => ({ bg: 'white'})
  },
  4: {
    text: val => chalk.bgGreen.black(val),
    style: val => ({ bg: 'green'})
  },
  8: {
    text: val => chalk.bgYellow.black(val),
    style: val => ({ bg: 'yellow'})
  },
  16: {
    text: val => chalk.bgBlue.white(val),
    style: val => ({ bg: 'blue'})
  },
  32: {
    text: val => chalk.bgMagenta.white(val),
    style: val => ({ bg: 'magenta'})
  },
  64: {
    text: val => chalk.bgCyan.black(val),
    style: val => ({ bg: 'cyan'})
  },
  128: {
    text: val => chalk.bgRed.white(val),
    style: val => ({ bg: 'red'})
  },
  256: {
    text: val => chalk.bgRed.white(val),
    style: val => ({ bg: 'white'})
  },
  512: {
    text: val => chalk.bgGreen.white(val),
    style: val => ({ bg: 'white'})
  },
  1024: {
    text: val => chalk.bgYellow.white(val),
    style: val => ({ bg: 'white'})
  },
  2048: {
    text: val => chalk.bgBlue.white(val),
    style: val => ({ bg: 'white'})
  }
};

const moveCells = (cells, direction) => {
  cells = cells.filter( c => c );
  if (cells.length < 4) {
    const newCells = Array.from({ length: 4 - cells.length }, () => 0);
    if (direction === "left") {
      cells = [...cells, ...newCells];
    } else if (direction === "right") {
      cells = [...newCells, ...cells];
    }
  }
  return cells;
};

const mergeCells = (cells, direction) => {
  if (direction === "right") {
    for (let i = cells.length - 1; i > 0; --i) {
      if (cells[i] === cells[i-1]) {
        cells[i] = cells[i] + cells[i-1];
        score += cells[i];
        cells[i-1] = 0;
        cells = moveCells(cells, direction);
      }
    }
  } else if (direction === "left") {
    for (let i = 0; i < cells.length - 1; ++i) {
      if (cells[i] === cells[i+1]) {
        cells[i] = cells[i] + cells[i+1];
        score += cells[i];
        cells[i+1] = 0;
        cells = moveCells(cells, direction);
      }
    }
  }

  return cells;
};

const addCell = rows => {
  let randRow = random(3);
  let randCol = random(3);
  while (rows[randRow][randCol] !== 0) {
    randRow = random(3);
    randCol = random(3);
  }
  rows[randRow][randCol] = get2or4();
  return rows;
};

class App extends Component {
  constructor(props) {
    super(props);
    this.handleCommand = this.handleCommand.bind(this);
    this.state = { rows: resetRows(), availableMoves: true };
  }
  componentDidMount() {
    screen.key(['left', 'right', 'up', 'down'], (ch, key) => {
      this.handleCommand(ch, key);
    });
  }
  componentWillUnmount() {
  }
  handleCommand(ch, key) {
    switch (key.name) {
      case 'left': this.goLeft(); break;
      case 'right': this.goRight(); break;
      case 'up': this.goUp(); break;
      case 'down': this.goDown(); break;
      default: break;
    }
  }
  goLeft() {
    let rows = [...this.state.rows];
    rows = rows.map( row => {
      row = moveCells(row, "left");
      row = mergeCells(row, "left");
      return row;
    });
    if (!isEqual(rows, this.state.rows) && hasAvailableSpaces(rows)) {
      rows = addCell(rows);
    }
    this.setState({ rows });
  }
  goRight() {
    let rows = [...this.state.rows];
    rows = rows.map(row => {
      row = moveCells(row, "right");
      row = mergeCells(row, "right");
      return row;
    });
    if (!isEqual(rows, this.state.rows) && hasAvailableSpaces(rows)) {
      rows = addCell(rows);
    }
    this.setState({ rows });
  }
  goUp() {
    let rows = [...this.state.rows];
    rows = zip(...rows);
    rows = rows.map(row => {
      row = moveCells(row, "left");
      row = mergeCells(row, "left");
      return row;
    });
    rows = zip(...rows);
    if (!isEqual(rows, this.state.rows) && hasAvailableSpaces(rows)) {
      rows = addCell(rows);
    }
    this.setState({ rows });
  }
  goDown() {
    let rows = [...this.state.rows];
    rows = zip(...rows);
    rows = rows.map(row => {
      row = moveCells(row, "right");
      row = mergeCells(row, "right");
      return row;
    });
    rows = zip(...rows);
    if (!isEqual(rows, this.state.rows) && hasAvailableSpaces(rows)) {
      rows = addCell(rows);
    }
    this.setState({ rows });
  }
  render() {
    const { screen } = this.props;
    const cellWidth = Math.floor(screen.width / 5);
    const cellHeight = Math.floor(screen.height / 5);
    const { rows } = this.state;
    const isGameOver = !hasAvailableMoves(rows) && !hasAvailableSpaces(rows);
    const highScore = 12345;
    return (
      <Fragment>
        <Grid cellWidth={cellWidth} cellHeight={cellHeight} rows={rows} />
        <box top={cellHeight * 4 + 2} left={0}>Score:</box>
        <box top={cellHeight * 4 + 2} left={10}>{ padStart(score, 5, "0") }</box>
        <box top={cellHeight * 4 + 2} left={cellWidth * 2 - 5}>
          { isGameOver && chalk.red("Game Over") }
        </box>
        <box top={cellHeight * 4 + 2} left={cellWidth * 4 - 18}>High Score:</box>
        <box top={cellHeight * 4 + 2} left={cellWidth * 4 - highScore.toString().length + 2}>
          { padStart(highScore, 5, "0") }
        </box>
      </Fragment>
    );
  }
}

function Grid({ cellWidth, cellHeight, rows }) {
  return (
    <box
      border={{type: 'line'}}
      style={{bg: 'cyan', border: {fg: 'blue'}}}
      top={0}
      width={cellWidth * 4 + 2}
      height={cellHeight * 4 + 2}>
      {flatten(rows.map( (row, rowIndex) => row.map( (cell, cellIndex) => {
        return <box top={rowIndex * cellHeight}
          left={cellIndex * cellWidth}
          width={cellWidth}
          height={cellHeight}
          border={{type: 'line'}}
          align="center"
          valign="middle"
          style={colors[cell].style(cell)}
          key={`${rowIndex}:${cellIndex}`}>
          <box top={cellHeight / 2 - 1}
            left={parseInt((cellWidth / 2) - (cell.toString().length / 2) - 1, 10)}
            height={1}
            width={cell.toString().length}>
             { cell !== 0 ? colors[cell].text(cell) : "" }
           </box>
         </box>
      })))}
    </box>
  );
}

const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'react-blessed hello world'
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

const render = createBlessedRenderer(blessed);
const component = render(<App screen={screen} />, screen);

