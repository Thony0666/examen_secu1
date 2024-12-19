import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [N, setN] = useState("");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleCaptcha = async () => {
    return new Promise((resolve) => {
      const wafCaptcha = new window.AWSCaptcha({
        containerID: "captcha-container",
        renderStyle: "input",
        successCallback: (token) => {
          setCaptchaToken(token);
          resolve(token);
        },
        errorCallback: (error) => {
          console.error("Captcha error:", error);
          resolve(null);
        },
      });
      wafCaptcha.render();
    });
  };

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
        const response = await axios.get("https://api.prod.jcloudify.com/whoami", {
          headers: captchaToken ? { "x-captcha-token": captchaToken } : {},
        });
        setOutput((prev) => [...prev, `${i}. ${response.data.message || "Forbidden"}`]);
      } catch (error) {
        if (error.response?.status === 403) {
          alert("Captcha détecté, veuillez le résoudre.");
          const token = await handleCaptcha();
          if (!token) {
            alert("Le captcha n'a pas été validé.");
            break;
          }
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
        {/* Conteneur pour le captcha AWS */}
        <div id="captcha-container" style={{ marginTop: "20px" }}></div>
      </header>
    </div>
  );
}

export default App;
