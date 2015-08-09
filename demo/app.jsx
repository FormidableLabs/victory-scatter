/*global document:false window:false*/
import React from "react";
import Radium from "radium";
import _ from "lodash";
import {VictoryScatter} from "../src/index";

const getData = function () {
  const colors = ["pink", "lightblue", "gold", "orange", "lightgreen", "lavender", "tan"];
  const symbols = ["circle", "star", "square", "triangleUp", "triangleDown", "diamond", "plus"];

  return _.map(_.range(100), (index) => {
    const scaledIndex = _.round(index / 16);

    return {
      x: _.random(1200),
      y: _.random(600),
      symbol: symbols[scaledIndex],
      color: colors[scaledIndex]
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
    }, 2000);
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
          height={this.state.height}
          width={this.state.width}/>
      </div>
    );
  }
}

App.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.object)
};

const content = document.getElementById("content");
React.render(<App data={getData()}/>, content);
