/*global document:false*/
import React from "react";
import {VictoryScatter} from "../src/index";

class App extends React.Component {
  render() {
    return (
      <div className="demo">
        <p>
          < VictoryScatter/>
        </p>
        <p>
          < VictoryScatter color={"red"}/>
        </p>
      </div>
    );
  }
}

const content = document.getElementById("content");

React.render(<App/>, content);
