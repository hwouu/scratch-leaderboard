// 임시 토너먼트 데이터
const mockTournamentData = {
  "32강": [
    {
      p1: { name: "Player A", score: 3 },
      p2: { name: "Player B", score: -2 },
      winner: "p1",
    },
    {
      p1: { name: "Player C", score: 1 },
      p2: { name: "Player D", score: 2 },
      winner: "p2",
    },
    // ... (16개의 경기)
  ],
  "16강": [
    {
      p1: { name: "Player A", score: 5 },
      p2: { name: "Player D", score: 1 },
      winner: "p1",
    },
    // ... (8개의 경기)
  ],
  // ... 8강, 4강, 결승 데이터 ...
};

/**
 * 토너먼트 페이지의 전체 구조를 렌더링합니다.
 * @param {string} roundName - "32강", "16강" 등 라운드 이름
 */
export function renderTournamentPage(roundName) {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div class="container">
          <header>
               <div class="title-container">
                  <div class="title-group"><h1>TOURNAMENT</h1></div>
                  <div class="subtitle"><span class="subtitle-text">골목대장 토너먼트 1st - ${roundName}</span></div>
              </div>
          </header>
          <main class="tournament-container">
              ${generateBracketHTML(roundName)}
          </main>
      </div>
  `;
  setupEventListeners();
}

/**
 * 대진표 HTML을 생성합니다.
 * @param {string} roundName - 현재 라운드 이름
 */
function generateBracketHTML(roundName) {
  // 실제 구현에서는 API에서 데이터를 가져와야 합니다.
  const rounds = ["32강", "16강", "8강", "4강", "결승"];
  let html = "";

  rounds.forEach((name) => {
    const matches = mockTournamentData[name] || [];
    html += `<div class="round">`;
    matches.forEach((match) => {
      html += `
              <div class="match">
                  <div class="player ${
                    match.winner === "p1" ? "winner" : "loser"
                  }">
                      <span class="player-name">${match.p1.name}</span>
                      <span class="player-score">${
                        match.p1.score > 0 ? "+" : ""
                      }${match.p1.score}</span>
                  </div>
                  <div class="player ${
                    match.winner === "p2" ? "winner" : "loser"
                  }">
                      <span class="player-name">${match.p2.name}</span>
                      <span class="player-score">${
                        match.p2.score > 0 ? "+" : ""
                      }${match.p2.score}</span>
                  </div>
              </div>
          `;
    });
    html += `</div>`;
  });

  return html;
}

function setupEventListeners() {
  // 토너먼트 페이지에 필요한 이벤트 리스너가 있다면 여기에 추가합니다.
  console.log("Tournament page rendered.");
}
