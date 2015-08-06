/*global document:false*/
import React from "react";
import Radium from "radium";
import _ from "lodash";
import {VictoryScatter} from "../src/index";

const getData = function () {
  let seriesNumber = "Three";

  return _.map(_.range(100), () => {
    switch (seriesNumber) {
      case "One":
        seriesNumber = "Two";
        break;
      case "Two":
        seriesNumber = "Three";
        break;
      case "Three":
        seriesNumber = "One";
        break;
      // no default
    }

    return { x: _.random(1200), y: _.random(600), z: "series" + seriesNumber };
  });
};

@Radium
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      height: 600,
      dotColors: ["pink", "lightblue", "gold"],
      width: 1200
    };
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
          dotColors={this.state.dotColors}
          height={this.state.height}
          width={this.state.width}/>
      </div>
    );
  }
}

App.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.shape({
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    z: React.PropTypes.string
  }))
};

const content = document.getElementById("content");
React.render(<App data={getData()}/>, content);
