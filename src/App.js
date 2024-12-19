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
        const response = await axios.get(
          "https://api.prod.jcloudify.com/whoami",
          {
            headers: captchaToken
              ? {
                  "Mu68y04CwMH7rQ6lDj0DOdHrRAVv2ZXX/FaLmKAEBRaqQOx16wBSfwr10r1iWN3AyG8wyfPXoxaSUJ1xjVylG8C+KzSNCkAIVBvsSTJkfC5H76F0YvbFTElFzRW97RT8KOHL62TEWorVJJyEwOQWyqt02zzAuUW577lcdci3fvk6UpTvieiuQE2rP9J2bvugxMR0tZybjButx9ZB6f+YD0MaqcnEc9Jk3nfJKqm/gaOGCiLKM2T29kGXrdMNg4fgq/AOkwNj6ldZETxGBGQtc+LuJoB3jFe6Idz/HbpXaJ2LPNMlnQd1PS77vFuC6s1ctr4XwcQs8OLXXUpNvRE8FJ8FaF8ih7szCtY9RTtldnayMeXRiTZ3bqS2nqnQLNARZywOWhRD4XwTXepe2InBaAlO3LbENygZ3nI2pcnbscJCl+tJ4w/jAPY1a8NQCnTul7bksDtuJYWE5H+g96V5IMtjWFomqxC8YbQOYJMGrskfA/MMjs30TCPCxmzJ2Ry/39Ls72745UB/BdV4I4UrVYmCeUpo2MfjWWscxh0tZyC7rX9e4Tu2fB3171FWlU8I/DhDNLTtoBap5caywKWNXWSgQ+287lZzdFJ5S7EgQA94ncUiYS1Xlf+97+48tmKO2Iy1u1Qctk9kg2N/gO/ghcv9Z8+nYB/NSZqfF4o1uTA=_0_1":
                    captchaToken,
                }
              : {},
          }
        );
        setOutput((prev) => [
          ...prev,
          `${i}. ${response.data.message || "Forbidden"}`,
        ]);
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
