import { clear, h } from "./dom.js";
import { DIFFICULTIES } from "../engine/game.js";
import { SquareCode, CircleQuestionMark, Moon, Sun } from "lucide";
import { renderIcon } from "./icons.js";

export function renderWelcome({ actions }) {
  const { isDarkMode } = actions.store.getState();

  const root = h(
    "div",
    {
      className: "app-screen app-screen--centered",
    },
    [
      h(
        "div",
        {
          className: "panel panel--welcome",
        },
        [
          h("div", { className: "welcome-title-row" }, [
            h(
              "h1",
              {
                className: "panel__title panel__title--welcome",
              },
              ["Flood It"],
            ),
            h("div", { className: "welcome-header-actions" }, [
              h(
                "button",
                {
                  type: "button",
                  onClick: () => actions.openHelpPage(),
                  className: "btn btn--subtle btn--icon",
                  title: "Open help and rules",
                  "aria-label": "Open help and rules",
                },
                [renderIcon(CircleQuestionMark)],
              ),
              h(
                "button",
                {
                  type: "button",
                  onClick: () => actions.toggleDarkMode(),
                  className: "btn btn--subtle btn--icon",
                  title: "Toggle dark mode",
                  "aria-label": "Toggle dark mode",
                },
                [isDarkMode ? renderIcon(Sun) : renderIcon(Moon)],
              ),
              h(
                "a",
                {
                  href: "https://github.com/ekremkaraca/floodit-js",
                  target: "_blank",
                  rel: "noopener,noreferrer",
                  className: "btn btn--subtle btn--icon",
                  title: "View source code on GitHub",
                  "aria-label": "View source code on GitHub",
                },
                [renderIcon(SquareCode)],
              ),
            ]),
          ]),

          h("div", { className: "welcome-tabs" }, [
            h(
              "div",
              {
                className: "welcome-tabs__list",
                role: "tablist",
                "aria-label": "Game mode tabs",
              },
              [
                h(
                  "button",
                  {
                    type: "button",
                    className: "welcome-tabs__button",
                    role: "tab",
                    "data-mode-tab": "classic",
                    "aria-selected": "true",
                    onClick: () => setActiveMode("classic"),
                  },
                  ["Classic"],
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "welcome-tabs__button",
                    role: "tab",
                    "data-mode-tab": "maze",
                    "aria-selected": "false",
                    onClick: () => setActiveMode("maze"),
                  },
                  ["Maze"],
                ),
              ],
            ),
            h(
              "p",
              {
                className: "welcome-tabs__note",
              },
              ["Classic: fill all cells. Maze: reach the goal tile."],
            ),
          ]),
          h("p", { className: "panel__intro" }, [
            "Choose your difficulty level to begin!",
          ]),
          h("div", {
            className: "difficulty-list",
            "data-mode-panel": "difficulty-list",
          }),
        ],
      ),
    ],
  );

  const difficultyList = root.querySelector(
    '[data-mode-panel="difficulty-list"]',
  );
  const tabButtons = Array.from(root.querySelectorAll("[data-mode-tab]"));
  let activeMode = "classic";

  function getVisibleDifficulties() {
    return DIFFICULTIES.filter((difficulty) => {
      if (difficulty.name === "Custom") {
        return true;
      }
      return activeMode === "maze"
        ? difficulty.mode === "maze"
        : difficulty.mode !== "maze";
    });
  }

  function startDifficulty(difficulty) {
    if (difficulty.name === "Custom") {
      const { customSettings } = actions.store.getState();
      actions.setCustomSettings({
        ...customSettings,
        gameMode: activeMode,
      });
      actions.openCustomMode();
      return;
    }

    const { board } = actions.store.getState();
    const start = () => actions.startNewGame(difficulty);
    if (!board) {
      start();
      return;
    }

    actions.openConfirmDialog({
      title: "Start New Game?",
      message: "Starting a new game will end your current game. Continue?",
      pendingAction: start,
    });
  }

  function renderDifficultyButtons() {
    if (!(difficultyList instanceof HTMLElement)) return;
    clear(difficultyList);

    for (const difficulty of getVisibleDifficulties()) {
      difficultyList.appendChild(
        h(
          "button",
          {
            type: "button",
            className: "btn btn--primary btn--block difficulty-list__button",
            onClick: () => startDifficulty(difficulty),
          },
          [
            difficulty.name === "Custom"
              ? activeMode === "maze"
                ? "Custom Maze"
                : "Custom Classic"
              : `${difficulty.name} (${difficulty.rows}×${difficulty.columns})`,
          ],
        ),
      );
    }
  }

  function updateTabUI() {
    for (const button of tabButtons) {
      if (!(button instanceof HTMLElement)) continue;
      const isActive = button.dataset.modeTab === activeMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    }
  }

  function setActiveMode(mode) {
    if (mode !== "classic" && mode !== "maze") return;
    if (activeMode === mode) return;
    activeMode = mode;
    updateTabUI();
    renderDifficultyButtons();
  }

  updateTabUI();
  renderDifficultyButtons();

  return root;
}
