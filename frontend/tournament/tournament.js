// frontend/tournament/tournament.js

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const themeToggleButton = document.getElementById("theme-toggle");
  const bracketContainer = document.getElementById(
    "tournament-bracket-container"
  );

  // --- Mock Data (임시 데이터) ---
  // 추후 이 부분은 API 호출로 대체되어야 합니다.
  const mockTournamentData = {
    roundOf16: [
      {
        matchId: 1,
        player1: { name: "Tiger Woods", score: -5 },
        player2: { name: "Rory McIlroy", score: -3 },
        winner: "player1",
      },
      {
        matchId: 2,
        player1: { name: "Dustin Johnson", score: -4 },
        player2: { name: "Jon Rahm", score: -4 },
        winner: "player2",
      },
      {
        matchId: 3,
        player1: { name: "Player 5", score: -2 },
        player2: { name: "Player 6", score: -3 },
        winner: "player2",
      },
      {
        matchId: 4,
        player1: { name: "Player 7", score: -1 },
        player2: { name: "Player 8", score: 0 },
        winner: "player1",
      },
      {
        matchId: 5,
        player1: { name: "Player 9", score: -5 },
        player2: { name: "Player 10", score: -4 },
        winner: "player1",
      },
      {
        matchId: 6,
        player1: { name: "Player 11", score: -3 },
        player2: { name: "Player 12", score: -3 },
        winner: "player1",
      },
      {
        matchId: 7,
        player1: { name: "Player 13", score: -2 },
        player2: { name: "Player 14", score: -1 },
        winner: "player1",
      },
      {
        matchId: 8,
        player1: { name: "Player 15", score: -1 },
        player2: { name: "Player 16", score: -2 },
        winner: "player2",
      },
    ],
    quarterfinals: [
      {
        matchId: 9,
        player1: { name: "Tiger Woods", score: -6 },
        player2: { name: "Jon Rahm", score: -5 },
        winner: "player1",
      },
      {
        matchId: 10,
        player1: { name: "Player 6", score: -4 },
        player2: { name: "Player 7", score: -2 },
        winner: "player1",
      },
      {
        matchId: 11,
        player1: { name: "Player 9", score: -6 },
        player2: { name: "Player 11", score: -5 },
        winner: "player1",
      },
      {
        matchId: 12,
        player1: { name: "Player 13", score: -3 },
        player2: { name: "Player 16", score: -4 },
        winner: "player2",
      },
    ],
    semifinals: [
      {
        matchId: 13,
        player1: { name: "Tiger Woods", score: -7 },
        player2: { name: "Player 6", score: -5 },
        winner: "player1",
      },
      {
        matchId: 14,
        player1: { name: "Player 9", score: -6 },
        player2: { name: "Player 16", score: -6 },
        winner: "player1",
      },
    ],
    final: [
      {
        matchId: 15,
        player1: { name: "Tiger Woods", score: -9 },
        player2: { name: "Player 9", score: -7 },
        winner: "player1",
      },
    ],
  };

  // --- UI Functions ---
  const applyTheme = (theme) => {
    document.body.classList.toggle("light-mode", theme === "light");
    if (themeToggleButton) {
      themeToggleButton.innerHTML =
        theme === "light"
          ? '<i class="fas fa-moon"></i>'
          : '<i class="fa-regular fa-sun"></i>';
    }
  };

  const createPlayerElement = (player, isWinner) => {
    if (!player) {
      return `<div class="player"><span class="player-name">TBD</span></div>`;
    }
    const score =
      player.score !== undefined
        ? `${player.score > 0 ? "+" : ""}${player.score}`
        : "-";
    return `
      <div class="player ${isWinner ? "winner" : ""}">
        <span class="player-name">${player.name}</span>
        <span class="player-score">${score}</span>
      </div>
    `;
  };

  const createMatchElement = (match) => {
    const player1Won = match.winner === "player1";
    const player2Won = match.winner === "player2";

    return `
      <div class="match" data-match-id="${match.matchId}">
        ${createPlayerElement(match.player1, player1Won)}
        ${createPlayerElement(match.player2, player2Won)}
        <div class="connector right"></div>
      </div>
    `;
  };

  const createRoundElement = (title, matches) => {
    const roundEl = document.createElement("div");
    roundEl.className = "round";
    let matchesHTML = matches.map(createMatchElement).join("");
    roundEl.innerHTML = `<h2 class="round-title">${title}</h2>` + matchesHTML;
    return roundEl;
  };

  const createFinalElement = (match) => {
    const winner = match.winner === "player1" ? match.player1 : match.player2;
    const finalEl = document.createElement("div");
    finalEl.className = "round final-match";
    finalEl.innerHTML = `
        <h2 class="round-title">CHAMPION</h2>
        <div class="champion">
            <div class="trophy"><i class="fas fa-trophy"></i></div>
            ${createPlayerElement(winner, true)}
        </div>
    `;
    return finalEl;
  };

  const renderBracket = (data) => {
    bracketContainer.innerHTML = "";

    if (data.roundOf16 && data.roundOf16.length > 0) {
      bracketContainer.appendChild(createRoundElement("16강", data.roundOf16));
    }
    if (data.quarterfinals && data.quarterfinals.length > 0) {
      bracketContainer.appendChild(
        createRoundElement("8강", data.quarterfinals)
      );
    }
    if (data.semifinals && data.semifinals.length > 0) {
      bracketContainer.appendChild(createRoundElement("4강", data.semifinals));
    }
    if (data.final && data.final.length > 0) {
      bracketContainer.appendChild(createFinalElement(data.final[0]));
    }
  };

  // --- Event Listeners ---
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const newTheme = document.body.classList.contains("light-mode")
        ? "dark"
        : "light";
      localStorage.setItem("theme", newTheme);
      applyTheme(newTheme);
    });
  }

  // --- Initialization ---
  const init = () => {
    applyTheme(localStorage.getItem("theme") || "dark");
    renderBracket(mockTournamentData);
  };

  init();
});
