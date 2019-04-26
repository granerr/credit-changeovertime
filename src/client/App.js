import React, { Component } from "react";
import "./app.css";

export default class App extends Component {
  state = { username: null };

  render() {
    return (
      <div>
        <h3>
          This is my response to the Avant Take Home Challenge related to the
          New Grad Program, 2019. The API sits on http://localhost:8080/api.
        </h3>
        <ul>
          <h3>Some helpful commands:</h3>
          <li>Create database: createdb avant-take-home</li>
          <li>Enter workspace: cd rgraner-avant-take-home</li>
          <li>Install dependencies: npm install</li>
          <li>Seed database: npm run seed</li>
          <li>Start development server: npm start</li>
          <li>Run tests: npm test</li>
        </ul>
        <h3>
          The stack for this project includes webpack, React, express, and node.
        </h3>
      </div>
    );
  }
}
