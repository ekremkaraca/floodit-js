import { clear, h } from "./dom.js";
import { DIFFICULTIES } from "../engine/game.js";
import { ChevronRight, SquareCode } from "lucide";
import { renderIcon } from "./icons.js";

export function renderWelcome({ actions }) {
  const HOW_TO_BY_MODE = {
    classic: [
      "Start from the top-left corner.",
      "Pick a color to expand your area.",
      "Fill the whole board before moves run out.",
    ],
    maze: [
      "Start from the top-left corner.",
      "Walls block flood expansion.",
      "Reach the goal tile (G) before moves run out.",
    ],
  };

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
          h(
            "h1",
            {
              className: "panel__title",
            },
            ["Flood It"],
          ),

          h("p", { className: "panel__intro" }, [
            "Choose a mode, then pick difficulty.",
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
            h("div", {
              className: "difficulty-list",
              "data-mode-panel": "difficulty-list",
            }),
          ]),
          h("div", { className: "welcome-info-grid" }, [
            h(
              "div",
              {
                className: "panel__section",
              },
              [
                h(
                  "h2",
                  {
                    className: "panel__section-title",
                  },
                  ["How to Play"],
                ),
                h(
                  "p",
                  {
                    className: "welcome-mode-help",
                    "data-howto-mode": "label",
                  },
                  [],
                ),
                h(
                  "ul",
                  {
                    className: "help-list",
                    "data-howto-list": "items",
                  },
                  [],
                ),
              ],
            ),

            h("div", { className: "panel__section" }, [
              h(
                "h2",
                {
                  className: "panel__section-title",
                },
                ["Keyboard Shortcuts"],
              ),
              h(
                "ul",
                {
                  className: "shortcut-list",
                },
                [
                  h("li", { className: "shortcut-list__item" }, [
                    h("span", {}, ["Reset current game"]),
                    h("kbd", { className: "kbd" }, ["Alt+Shift+R"]),
                  ]),
                  h("li", { className: "shortcut-list__item" }, [
                    h("span", {}, ["New game (current settings)"]),
                    h("kbd", { className: "kbd" }, ["Alt+Shift+N"]),
                  ]),
                  h("li", { className: "shortcut-list__item" }, [
                    h("span", {}, ["Quit to welcome screen"]),
                    h("kbd", { className: "kbd" }, ["Alt+Shift+Q"]),
                  ]),
                ],
              ),
            ]),
          ]),

          h("div", { className: "panel__footer" }, [
            h(
              "a",
              {
                href: "https://github.com/ekremkaraca/floodit-js",
                target: "_blank",
                className: "link-button",
                rel: "noopener,noreferrer",
              },
              [
                renderIcon(SquareCode, { className: "ui-icon ui-icon--sm" }),
                " View Source Code",
              ],
            ),
          ]),
        ],
      ),
    ],
  );

  const difficultyList = root.querySelector(
    '[data-mode-panel="difficulty-list"]',
  );
  const howToList = root.querySelector('[data-howto-list="items"]');
  const howToModeLabel = root.querySelector('[data-howto-mode="label"]');
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
                ? "Custom Maze (choose size and move limit)"
                : "Custom (choose size and move limit)"
              : difficulty.mode === "maze"
                ? `${difficulty.name} (${difficulty.rows}×${difficulty.columns}) - reach goal`
                : `${difficulty.name} (${difficulty.rows}×${difficulty.columns})`,
          ],
        ),
      );
    }
  }

  function renderHowTo() {
    if (!(howToList instanceof HTMLElement)) return;
    if (howToModeLabel instanceof HTMLElement) {
      howToModeLabel.textContent =
        activeMode === "maze" ? "Maze Mode" : "Classic Mode";
    }

    clear(howToList);
    for (const item of HOW_TO_BY_MODE[activeMode]) {
      howToList.appendChild(
        h("li", { className: "help-list__item" }, [
          h("span", { className: "help-list__marker" }, [
            renderIcon(ChevronRight, { className: "ui-icon ui-icon--sm" }),
          ]),
          item,
        ]),
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
    renderHowTo();
    renderDifficultyButtons();
  }

  updateTabUI();
  renderHowTo();
  renderDifficultyButtons();

  return root;
}
