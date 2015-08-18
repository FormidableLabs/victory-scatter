/*global document:false window:false*/
import React from "react";
import Radium from "radium";
import _ from "lodash";
import {VictoryScatter} from "../src/index";

const getData = function () {
  const colors =
    ["Violet", "CornflowerBlue", "Gold", "Orange", "Turquoise", "Tomato", "GreenYellow"];
  const symbols = ["circle", "star", "square", "triangleUp", "triangleDown", "diamond", "plus"];

  return _.map(_.range(42), (index) => {
    const scaledIndex = _.floor(index / 6);

    return {
      x: _.random(1200),
      y: _.random(600),
      symbol: symbols[scaledIndex],
      symbolScale: _.random(2, 10),
      color: colors[_.random(0, 6)]
    };
  });
};

@Radium
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      height: 600,
      width: 1200
    };
  }

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        data: getData()
      });
    }, 3000);
  }

  getStyles() {
    return {
      border: "1px solid #ccc",
      height: this.state.height,
      margin: "0 auto",
      width: this.state.width
    };
  }

  render() {
    return (
      <div style={this.getStyles()}>
        <VictoryScatter
          data={this.state.data}
          domain={{ x: [0, this.state.width], y: [0, this.state.height] }}
          height={this.state.height}
          width={this.state.width}
          opacity={0.6}/>
      </div>
    );
  }
}

App.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.object)
};

const content = document.getElementById("content");
React.render(<App data={getData()}/>, content);
