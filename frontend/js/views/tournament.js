import { createHTMLElement } from "../../utils/ui.js";
import * as api from "../services/api.js";
import { renderLeaderboard } from "./leaderboard.js";

let currentView = "total"; // 'total', 'courseA', 'courseB'

// --- 렌더링 함수 ---

export async function renderTournamentPage(stage, data) {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = ""; // 이전 내용 지우기

  const tournamentContainer = createHTMLElement("div", {
    id: "tournament-container",
  });
  const leaderboardContainer = createHTMLElement("div", {
    id: "leaderboard-container",
  });
  const bracketContainer = createHTMLElement("div", {
    id: "bracket-container",
  });

  tournamentContainer.append(leaderboardContainer, bracketContainer);
  mainContent.appendChild(tournamentContainer);

  renderTournamentHeader(leaderboardContainer, stage, data);
  renderLeaderboard(leaderboardContainer, data.total.items, "total"); // 초기 뷰
  renderBracket(bracketContainer, stage, data);
  setupEventListeners(leaderboardContainer, bracketContainer, stage, data);
}

function renderTournamentHeader(container, stage, data) {
  const header = createHTMLElement("div", { className: "leaderboard-header" });
  const title = createHTMLElement("h2", {}, `토너먼트 ${stage}강`);
  const viewButtons = createHTMLElement("div", { className: "view-buttons" });

  const buttons = [
    { id: "total-rank-btn", text: "합산", view: "total" },
    { id: "a-course-rank-btn", text: "A코스", view: "courseA" },
    { id: "b-course-rank-btn", text: "B코스", view: "courseB" },
  ];

  buttons.forEach((btnInfo) => {
    const button = createHTMLElement(
      "button",
      { id: btnInfo.id, className: "view-button" },
      btnInfo.text
    );
    if (btnInfo.view === currentView) {
      button.classList.add("active");
    }
    viewButtons.appendChild(button);
  });

  header.append(title, viewButtons);
  container.appendChild(header);
}

function renderBracket(container, stage, data) {
  container.innerHTML = ""; // 초기화

  const bracketWrapper = createHTMLElement("div", {
    className: "bracket-wrapper",
  });
  const bracketHeader = createHTMLElement("div", {
    className: "bracket-header",
  });
  const title = createHTMLElement("h3", {}, "대진표");
  const fullBracketButton = createHTMLElement(
    "button",
    { id: "full-bracket-btn", className: "full-bracket-button" },
    "전체 대진표 보기"
  );

  bracketHeader.append(title, fullBracketButton);

  const bracketContent = createHTMLElement("div", {
    className: "bracket-content",
  });
  const leftColumn = createHTMLElement("div", { className: "bracket-column" });
  const rightColumn = createHTMLElement("div", { className: "bracket-column" });

  if (data.brackets && data.brackets.items) {
    const players = data.brackets.items.sort((a, b) => a.slotNo - b.slotNo);
    const half = Math.ceil(players.length / 2);
    const leftPlayers = players.slice(0, half);
    const rightPlayers = players.slice(half);

    populateColumn(leftColumn, leftPlayers);
    populateColumn(rightColumn, rightPlayers);
  } else {
    bracketContent.textContent = "대진표 정보가 없습니다.";
  }

  bracketContent.append(leftColumn, rightColumn);
  bracketWrapper.append(bracketHeader, bracketContent);
  container.appendChild(bracketWrapper);
}

function populateColumn(column, players) {
  for (let i = 0; i < players.length; i += 2) {
    const player1 = players[i];
    const player2 = players[i + 1];
    const matchup = createMatchupElement(player1, player2);
    column.appendChild(matchup);
  }
}

// --- 이벤트 리스너 ---

function setupEventListeners(
  leaderboardContainer,
  bracketContainer,
  stage,
  data
) {
  const totalBtn = leaderboardContainer.querySelector("#total-rank-btn");
  const courseABtn = leaderboardContainer.querySelector("#a-course-rank-btn");
  const courseBBtn = leaderboardContainer.querySelector("#b-course-rank-btn");

  const switchView = (view, rankData) => {
    currentView = view;
    leaderboardContainer
      .querySelector(".leaderboard-table-container")
      ?.remove();
    renderLeaderboard(leaderboardContainer, rankData, view);
    // 버튼 활성화 상태 업데이트
    leaderboardContainer
      .querySelectorAll(".view-button")
      .forEach((btn) => btn.classList.remove("active"));
    leaderboardContainer
      .querySelector(
        `#${view === "total" ? "total" : `course${view.charAt(6)}`}-rank-btn`
      )
      .classList.add("active");
  };

  totalBtn.addEventListener("click", () =>
    switchView("total", data.total.items)
  );
  courseABtn.addEventListener("click", () =>
    switchView("courseA", data.courseA.items)
  );
  courseBBtn.addEventListener("click", () =>
    switchView("courseB", data.courseB.items)
  );

  const fullBracketBtn = bracketContainer.querySelector("#full-bracket-btn");
  fullBracketBtn.addEventListener("click", () => renderFullBracketModal(stage));
}

// --- 전체 대진표 모달 ---

/**
 * =================================================================
 * 수정된 부분 1: renderFullBracketModal
 * - 32강과 16강 데이터를 각각 비동기적으로 불러옵니다.
 * - 각 라운드에 맞는 데이터를 populateRound 함수로 전달합니다.
 * =================================================================
 */
async function renderFullBracketModal(stage) {
  const modal = createHTMLElement("div", {
    id: "full-bracket-modal",
    className: "modal",
  });
  const modalContent = createHTMLElement("div", { className: "modal-content" });
  const closeButton = createHTMLElement(
    "span",
    { className: "close-button" },
    "×"
  );
  const modalTitle = createHTMLElement("h2", {}, "전체 대진표");
  const bracketContainer = createHTMLElement("div", {
    className: "full-bracket-container",
  });

  const rounds = [
    { name: "32강", class: "round-of-32" },
    { name: "16강", class: "round-of-16" },
    { name: "8강", class: "round-of-8" },
    { name: "4강", class: "round-of-4" },
    { name: "결승", class: "final" },
  ];

  rounds.forEach((roundInfo) => {
    const roundDiv = createHTMLElement("div", {
      className: `bracket-round ${roundInfo.class}`,
    });
    const roundTitle = createHTMLElement("h3", {}, roundInfo.name);
    const roundColumns = createHTMLElement("div", {
      className: "bracket-columns",
    });
    const leftColumn = createHTMLElement("div", {
      className: "bracket-column",
    });
    const rightColumn = createHTMLElement("div", {
      className: "bracket-column",
    });

    roundColumns.append(leftColumn, rightColumn);
    roundDiv.append(roundTitle, roundColumns);
    bracketContainer.appendChild(roundDiv);
  });

  modalContent.append(closeButton, modalTitle, bracketContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  closeButton.onclick = () => modal.remove();
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  };

  // 데이터 로딩 시작
  try {
    // 32강과 16강 데이터를 병렬로 가져옵니다.
    const [data32, data16] = await Promise.all([
      api.fetchData("32"),
      api.fetchData("16"),
    ]);

    // 32강 데이터 채우기
    if (data32 && data32.brackets && data32.brackets.items) {
      populateRound(
        modal.querySelector(".round-of-32"),
        data32.brackets.items,
        32
      );
    }

    // 16강 데이터 채우기
    if (data16 && data16.brackets && data16.brackets.items) {
      populateRound(
        modal.querySelector(".round-of-16"),
        data16.brackets.items,
        16
      );
    }

    // TODO: 8강, 4강, 결승 데이터 로직 추가
    // populateRound(modal.querySelector('.round-of-8'), players8, 8);
    // populateRound(modal.querySelector('.round-of-4'), players4, 4);
    // populateRound(modal.querySelector('.final'), finalPlayers, 2);
  } catch (error) {
    console.error("전체 대진표 데이터를 가져오는 데 실패했습니다.", error);
    bracketContainer.textContent = "대진표를 불러오는 중 오류가 발생했습니다.";
  }
}

/**
 * =================================================================
 * 수정된 부분 2: populateRound
 * - slotNo를 기준으로 선수 목록을 정렬합니다.
 * - roundNumber(32, 16)에 따라 slotNo 범위에 맞게 선수를 좌/우로 분배합니다.
 * =================================================================
 */
function populateRound(roundElement, players, roundNumber) {
  const leftColumn = roundElement.querySelector(".bracket-column:first-child");
  const rightColumn = roundElement.querySelector(".bracket-column:last-child");
  leftColumn.innerHTML = "";
  rightColumn.innerHTML = "";

  // slotNo 기준으로 선수들을 정렬합니다.
  const sortedPlayers = players.sort((a, b) => a.slotNo - b.slotNo);

  let leftPlayers, rightPlayers;

  if (roundNumber === 32) {
    // 32강: 좌측 1-16, 우측 17-32
    leftPlayers = sortedPlayers.filter((p) => p.slotNo >= 1 && p.slotNo <= 16);
    rightPlayers = sortedPlayers.filter(
      (p) => p.slotNo >= 17 && p.slotNo <= 32
    );
  } else if (roundNumber === 16) {
    // 16강: 좌측 1-8, 우측 9-16
    leftPlayers = sortedPlayers.filter((p) => p.slotNo >= 1 && p.slotNo <= 8);
    rightPlayers = sortedPlayers.filter((p) => p.slotNo >= 9 && p.slotNo <= 16);
  } else {
    // 기타 라운드 (8강 이상)는 기존처럼 절반으로 나눕니다.
    const half = Math.ceil(sortedPlayers.length / 2);
    leftPlayers = sortedPlayers.slice(0, half);
    rightPlayers = sortedPlayers.slice(half);
  }

  // 좌측 컬럼 채우기
  for (let i = 0; i < leftPlayers.length; i += 2) {
    const matchup = createMatchupElement(leftPlayers[i], leftPlayers[i + 1]);
    leftColumn.appendChild(matchup);
  }

  // 우측 컬럼 채우기
  for (let i = 0; i < rightPlayers.length; i += 2) {
    const matchup = createMatchupElement(rightPlayers[i], rightPlayers[i + 1]);
    rightColumn.appendChild(matchup);
  }
}

// --- 유틸리티 및 헬퍼 함수 ---

function createMatchupElement(player1, player2) {
  const matchupDiv = createHTMLElement("div", { className: "matchup" });
  matchupDiv.appendChild(createPlayerElement(player1));
  matchupDiv.appendChild(createPlayerElement(player2));
  return matchupDiv;
}

function createPlayerElement(player) {
  const playerDiv = createHTMLElement("div", { className: "player" });

  if (!player) {
    playerDiv.textContent = "부전승";
    playerDiv.classList.add("bye");
    return playerDiv;
  }

  const isWinner = player.winLose === "WIN";
  if (isWinner) {
    playerDiv.classList.add("winner");
  }

  const rank = createHTMLElement(
    "span",
    { className: "player-rank" },
    `${player.rank || "-"}`
  );
  const nickname = createHTMLElement(
    "span",
    { className: "player-nickname" },
    player.memberNickname
  );
  const score = createHTMLElement(
    "span",
    { className: "player-score" },
    `${
      player.score === 0
        ? "E"
        : player.score > 0
        ? `+${player.score}`
        : player.score
    }`
  );

  playerDiv.append(rank, nickname, score);
  return playerDiv;
}
