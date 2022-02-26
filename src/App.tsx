import logo from "./logo.svg";
import tauriCircles from "./tauri.svg";
import tauriWord from "./wordmark.svg";
import "./App.css";
import { checkUpdate } from "@tauri-apps/api/updater";
import { useState } from "react";

function App() {
  const [isUpdateAvailable, setUpdateAvailable] = useState(false);

  async function checkForUpdates() {
    const res = await checkUpdate();
    setUpdateAvailable(res.shouldUpdate);
    console.log(res);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="inline-logo">
          <img src={tauriCircles} className="App-logo rotate" alt="logo" />
          <img src={tauriWord} className="App-logo smaller" alt="logo" />
        </div>
        <a
          className="App-link"
          href="https://tauri.studio"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Tauri
        </a>
        <img src={logo} className="App-logo rotate" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={checkForUpdates}>Check For Updates</button>
        {isUpdateAvailable ? <button>Update App</button> : null}
      </header>
    </div>
  );
}
export default App;
