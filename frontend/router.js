// frontend/router.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 대회 일정 설정 ---
  // 이 부분의 날짜만 수정하면 전체 리디렉션 로직이 관리됩니다.
  const schedule = {
    qualifying: {
      start: new Date("2025-09-01T00:00:00"),
      end: new Date("2025-09-14T23:59:59"),
      path: "/qualifying/",
    },
    tournament: {
      start: new Date("2025-09-15T00:00:00"),
      end: new Date("2025-10-04T23:59:59"),
      path: "/tournament/",
    },
  };

  const now = new Date();

  // --- 페이지 경로 결정 ---
  let redirectTo = schedule.qualifying.path; // 기본 페이지는 예선전으로 설정

  if (now >= schedule.qualifying.start && now <= schedule.qualifying.end) {
    // 1. 예선 기간일 경우
    console.log("현재는 예선 기간입니다. 예선 페이지로 이동합니다.");
    redirectTo = schedule.qualifying.path;
  } else if (
    now >= schedule.tournament.start &&
    now <= schedule.tournament.end
  ) {
    // 2. 토너먼트 기간일 경우
    console.log("현재는 토너먼트 기간입니다. 대진표 페이지로 이동합니다.");
    redirectTo = schedule.tournament.path;
  } else if (now > schedule.tournament.end) {
    // 3. 모든 대회가 종료되었을 경우 (결승 페이지나 지난 대회 페이지로 보낼 수 있음)
    console.log("대회가 모두 종료되었습니다. 토너먼트 페이지를 표시합니다.");
    redirectTo = schedule.tournament.path; // 종료 후에는 최종 대진표를 보여줌
  } else {
    // 4. 대회 시작 전일 경우 (기본값인 예선 페이지 유지)
    console.log("대회가 아직 시작되지 않았습니다. 예선 페이지로 이동합니다.");
  }

  // --- 리디렉션 실행 ---
  // 현재 페이지가 이미 목적지 페이지가 아닌 경우에만 이동시켜 불필요한 새로고침을 방지합니다.
  if (!window.location.pathname.startsWith(redirectTo)) {
    window.location.replace(redirectTo);
  }
});
