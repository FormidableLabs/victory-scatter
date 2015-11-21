import Ecology from "ecology";
import _ from "lodash";
import Radium, { Style } from "radium";
import React from "react";
import ReactDOM from "react-dom";
import symbolData from "./symbol-data"
import theme from "./theme";

@Radium
class Docs extends React.Component {
  render() {
    return (
      <div className="Container">
        <div className="Copy">
          <Ecology
            overview={require("!!raw!./ecology.md")}
            source={require("json!./victory-scatter.json")}
            scope={{
              _,
              React,
              ReactDOM,
              symbolData,
              VictoryScatter: require("../src/components/victory-scatter")
            }}
            playgroundtheme="elegant" />
          <Style rules={theme}/>
        </div>
      </div>
    )
  }
}

export default Docs;
