/*global document:false */
/*global window:false */
import React from "react";
import ReactDOM from "react-dom";
import Radium from "radium";
import _ from "lodash";
import {VictoryScatter} from "../src/index";
import {VictoryLabel} from "victory-label";
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
    margin: 20
  }
};

const symbolStyle = {
  parent: {
    border: "1px solid #ccc",
    margin: 20
  },
  data: {
    fill: "red"
  },
  labels: {
    padding: 25,
    fontSize: 15,
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

  componentWillMount() {
    window.setInterval(() => {
      this.setState({
        data: getData()
      });
    }, 3000);
  }

  render() {
    /* eslint-disable no-alert */
    const handleClick = () => window.alert("WOO!");
    /* eslint-enable no-alert */
    return (
      <div>
        <VictoryScatter
          style={style}
          width={500}
          height={500}
          domain={[0, 600]}
          animate={{velocity: 0.03}}
          data={this.state.data}
        />

        <VictoryScatter
          style={_.merge(
            {},
            style,
            {data: {fill: (data) => data.y > 0 ? "red" : "blue"}}
          )}
          events={{
            data: {onClick: () => handleClick()}
          }}
          width={500}
          height={500}
          symbol={(data) => data.y > 0 ? "triangleUp" : "triangleDown"}
          y={(x) => Math.sin(2 * Math.PI * x)}
          sample={25}
        />

        <VictoryScatter
          width={500}
          height={500}
          padding={50}
          labelComponent={<VictoryLabel style={{fill: "red"}}/>}
          style={symbolStyle}
          data={symbolData}
        />

        <VictoryScatter
          style={_.merge(
            {},
            style,
            {data: {fill: "blue", opacity: 0.7}}
          )}
          width={500}
          height={500}
          bubbleProperty="z"
          maxBubbleSize={20}
          showLabels={false}
          data={bubbleData}
        />

        <svg style={_.merge({width: 500, height: 300}, style.parent)}>
          <VictoryScatter
            width={500}
            height={300}
            style={style}
            containerElement="g"
          />
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
