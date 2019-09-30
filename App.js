import React, {Fragment, Component} from 'react';
import {flatten, random, sample, times, constant, concat} from 'lodash';
import blessed from 'neo-blessed';
import {createBlessedRenderer} from 'react-blessed';

const get2or4 = () => sample(concat(times(5, constant(2)), times(5, constant(4))));

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
}

const choices = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];

class App extends Component {
  constructor(props) {
    super(props);
    this.handleCommand = this.handleCommand.bind(this);
    this.state = { rows: resetRows() };
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
      case 'down': this.goDOwn(); break;
      default: break;
    }
  }
  goLeft() {
    console.log("goLeft");
  }
  goRight() {
    // const rows = [
    //   [0, 0, 0, 0],
    //   [0, 2, 0, 2],
    //   [0, 0, 4, 0],
    //   [0, 0, 0, 0]
    // ];
    // let rows = this.state.rows;
    // rows = rows.map( row => {
    //   let changed = true;
    //   while (changed === true) {
    //     changed = false;
    //     for (let i = row.length - 1; i >= 0; --i) {
    //       if (row[i] === 0 && row[i-1] !== 0) {
    //         row[i] = row[i-1];
    //         row[i-1] = 0;
    //         changed = true;
    //       }
    //     }
    //   }
    //   return row;
    // } );
    // this.setState({ rows });
    /*
     */
    let rows = this.state.rows;
    rows = rows.map( row => {
      row = row.filter( c => c );
      if (row.length < 4) {
        row = Array.from({ length: 4 - row.length }, () => 0 ).concat(row);
      }
      return row;
    } );
    this.setState({ rows });
  }
  goUp() {
    console.log('goUp');
  }
  goDown() {
    console.log('goDown');
  }
  render() {
    const { screen } = this.props;
    const cellWidth = Math.floor(screen.width / 5);
    const cellHeight = Math.floor(screen.height / 5);
    const { rows } = this.state;
    return <Grid cellWidth={cellWidth} cellHeight={cellHeight} rows={rows} />;
  }
}

function Grid({ cellWidth, cellHeight, rows }) {
  return flatten(rows.map( (row, rowIndex) => row.map( (cell, cellIndex) =>
    <box top={ rowIndex * cellHeight }
       left={ cellIndex * cellWidth }
       width={ cellWidth }
       height={ cellHeight }
       border={{type: 'line'}}
       align="center"
       valign="middle"
       style={{border: {fg: 'blue'}}}>
       { cell !== 0 ? cell : "" }
    </box>
  ) ) );
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

