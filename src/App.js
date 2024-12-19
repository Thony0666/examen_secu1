import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [N, setN] = useState("");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (N < 1 || N > 1000) {
      alert("Veuillez entrer un nombre entre 1 et 1 000");
      return;
    }
    setIsRunning(true);
    setOutput([]);
    for (let i = 1; i <= N; i++) {
      try {
        const response = await axios.get("https://api.prod.jcloudify.com/whoami");
        setOutput((prev) => [...prev, `${i}. ${response.data.message || "Forbidden"}`]);
      } catch (error) {
        if (error.response?.status === 403) {
          // Gérer le captcha ici
          alert("Captcha détecté, veuillez résoudre pour continuer.");
          // Implémentez la logique du captcha
        } else {
          setOutput((prev) => [...prev, `${i}. Forbidden`]);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause de 1 seconde
    }
    setIsRunning(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isRunning && (
          <form onSubmit={handleSubmit}>
            <input
              type="number"
              value={N}
              onChange={(e) => setN(e.target.value)}
              placeholder="Entrez un nombre (1-1000)"
              required
            />
            <button type="submit">Lancer</button>
          </form>
        )}
        {isRunning && <div>Exécution en cours...</div>}
        <ul>
          {output.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
