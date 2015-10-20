/*global document:false */
/*global window:false */
import React from "react";
import ReactDOM from "react-dom";
import Radium from "radium";
import _ from "lodash";
import {VictoryScatter} from "../src/index";
import bubbleData from "./bubble-data.js";
import symbolData from "./symbol-data.js";

const getData = function () {
  const colors =
    ["violet", "cornflowerblue", "gold", "orange", "turquoise", "tomato", "greenyellow"];
  const symbols = ["circle", "star", "square", "triangleUp", "triangleDown", "diamond", "plus"];
  // symbol: symbols[scaledIndex],
  return _.map(_.range(100), (index) => {
    const scaledIndex = _.floor(index % 7);
    return {
      x: _.random(600),
      y: _.random(600),
      size: _.random(15) + 3,
      symbol: symbols[scaledIndex],
      fill: colors[_.random(0, 6)],
      opacity: _.random(0.3, 1)
    };
  });
};

const style = {
  parent: {
    border: "1px solid #ccc",
    height: 500,
    margin: 20,
    width: 500
  }
};

const symbolStyle = {
  parent: {
    border: "1px solid #ccc",
    height: 500,
    margin: 50,
    width: 500
  },
  data: {
    fill: "red"
  },
  labels: {
    fontSize: 15,
    padding: 20,
    fill: "grey"
  }
};

@Radium
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
  }

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        data: getData()
      });
    }, 3000);
  }

  render() {
    return (
      <div>
        <VictoryScatter
          style={style}
          domain={[0, 600]}
          animate={{velocity: 0.03}}
          data={this.state.data}/>

        <VictoryScatter
          style={symbolStyle}
          data={symbolData}/>

        <VictoryScatter
          style={_.merge(
            {},
            style,
            {data: {fill: "blue", opacity: 0.7}}
          )}
          bubbleProperty="z"
          maxBubbleSize={20}
          showLabels={false}
          data={bubbleData}/>

        <svg style={style.parent}>
          <VictoryScatter
            style={style}
            containerElement="g"/>
        </svg>
      </div>
    );
  }
}

App.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.object)
};

const content = document.getElementById("content");
ReactDOM.render(<App data={getData()}/>, content);
