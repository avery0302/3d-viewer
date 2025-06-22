import { useState } from "react";
import "./App.css";
import HomePage from "./components/HomePage.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <HomePage />
    </div>
  );
}

export default App;
