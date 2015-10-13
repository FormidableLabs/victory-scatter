/*global document:false */
/*global window:false */
import React from "react";
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
      color: colors[_.random(0, 6)],
      opacity: _.random(0.3, 1)
    };
  });
};

@Radium
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
  }

  getStyles() {
    return {
      border: "1px solid #ccc",
      height: 500,
      margin: 20,
      width: 500
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
        <svg style={this.getStyles()}>
          <VictoryScatter
            containerElement="g"
            domain={[0, 600]}
            animate={{velocity: 0.03}}
            data={this.state.data}/>
        </svg>

        <svg style={this.getStyles()}>
          <VictoryScatter
            style={{margin: 50, textAnchor: "end", fontSize: 14}}
            labelPadding={12}
            containerElement="g"
            data={symbolData}/>
        </svg>

        <svg style={this.getStyles()}>
          <VictoryScatter
            containerElement="g"
            style={{color: "blue", opacity: 0.7}}
            bubbleProperty="z"
            maxBubbleSize={20}
            showLabels={false}
            data={bubbleData}/>
        </svg>

        <svg style={this.getStyles()}>
          <VictoryScatter
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
React.render(<App data={getData()}/>, content);
