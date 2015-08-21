/*global document:false */
import React from "react";
import Radium from "radium";
// import _ from "lodash";
import {VictoryScatter} from "../src/index";
import bubbleData from "./bubble-data.js";

// const getData = function () {
//   const colors =
//     ["violet", "cornflowerblue", "gold", "orange", "turquoise", "tomato", "greenyellow"];
//   const symbols = ["circle", "star", "square", "triangleUp", "triangleDown", "diamond", "plus"];

//   return _.map(_.range(200), (index) => {
//     const scaledIndex = _.floor(index / 29);

//     return {
//       x: _.random(1200),
//       y: _.random(600),
//       symbolScale: _.random(1, 6),
//       symbol: symbols[scaledIndex],
//       color: colors[_.random(0, 6)]
//     };
//   });
// };

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

  // componentDidMount() {
  //   window.setInterval(() => {
  //     this.setState({
  //       data: getData()
  //     });
  //   }, 3000);
  // }

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
          bubble={true}
          maxBubbleRadius={this.state.height / 10}
          data={this.state.data}
          height={this.state.height}
          width={this.state.width}
          color="cornflowerblue"/>
      </div>
    );
  }
}

App.propTypes = {
  data: React.PropTypes.arrayOf(React.PropTypes.object)
};

const content = document.getElementById("content");
React.render(<App data={bubbleData}/>, content);
