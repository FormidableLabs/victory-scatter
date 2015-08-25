/*global document:false */
/*global window:false */
import React from "react";
import Radium from "radium";
import _ from "lodash";
import {VictoryScatter} from "../src/index";

const getData = function () {
  const colors =
    ["violet", "cornflowerblue", "gold", "orange", "turquoise", "tomato", "greenyellow"];
  const symbols = ["circle", "star", "square", "triangleUp", "triangleDown", "diamond", "plus"];

  return _.map(_.range(100), (index) => {
    const scaledIndex = _.floor(index % 7);
    return {
      x: _.random(1200),
      y: _.random(600),
      size: _.random(3, 8),
      symbol: symbols[scaledIndex],
      color: colors[_.random(0, 6)],
      opacity: _.random(0.5, 1)
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

  componentDidMount() {
    window.setInterval(() => {
      this.setState({
        data: getData()
      });
    }, 4000);
  }

  getStyles() {
    return {
      height: 500,
      margin: 20,
      width: 500
    };
  }

  render() {
    return (
      <svg style={{height: 500, width: 500, margin: 20, border: "1px solid #ccc"}}>
        <VictoryScatter
          style={this.getStyles()}
          domain={{
            x: [0, 1200],
            y: [600, 0]
          }}
          animate={true}
          data={this.state.data}/>
      </svg>
    );
  }
}

App.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.object)
};

const content = document.getElementById("content");
React.render(<App data={getData()}/>, content);
