import { h } from "./dom.js";
import { DIFFICULTIES } from "../engine/game.js";

export function renderWelcome({ actions }) {
  return h(
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

          h("div", { className: "panel__section" }, [
            h(
              "h2",
              {
                className: "panel__section-title",
              },
              ["How to Play"],
            ),
            h(
              "ul",
              {
                className: "help-list",
              },
              [
                h("li", { className: "help-list__item" }, [
                  h("span", { className: "help-list__marker" }, ["▸"]),
                  "Start from the top-left corner",
                ]),
                h("li", { className: "help-list__item" }, [
                  h("span", { className: "help-list__marker" }, ["▸"]),
                  "Select colors to flood connected areas",
                ]),
                h("li", { className: "help-list__item" }, [
                  h("span", { className: "help-list__marker" }, ["▸"]),
                  "Fill the entire board with one color",
                ]),
                h("li", { className: "help-list__item" }, [
                  h("span", { className: "help-list__marker" }, ["▸"]),
                  "Complete in the minimum number of moves",
                ]),
              ],
            ),
          ]),

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
                h(
                  "li",
                  { className: "shortcut-list__item" },
                  [
                    h("span", {}, ["Reset current game"]),
                    h(
                      "kbd",
                      { className: "kbd" },
                      ["Alt+Shift+R"],
                    ),
                  ],
                ),
                h(
                  "li",
                  { className: "shortcut-list__item" },
                  [
                    h("span", {}, ["New game (current settings)"]),
                    h("kbd", { className: "kbd" }, ["Alt+Shift+N"]),
                  ],
                ),
                h(
                  "li",
                  { className: "shortcut-list__item" },
                  [
                    h("span", {}, ["Quit to welcome screen"]),
                    h("kbd", { className: "kbd" }, ["Alt+Shift+Q"]),
                  ],
                ),
              ],
            ),
          ]),

          h(
            "p",
            { className: "panel__intro" },
            ["Choose your difficulty level to begin!"],
          ),

          h(
            "div",
            { className: "difficulty-list" },
            DIFFICULTIES.map((difficulty) =>
              h(
                "button",
                {
                  type: "button",
                  className: "btn btn--primary btn--block difficulty-list__button",
                  onClick: () => {
                    if (difficulty.name === "Custom") {
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
                      message:
                        "Starting a new game will end your current game. Continue?",
                      pendingAction: start,
                    });
                  },
                },
                [
                  difficulty.name === "Custom"
                    ? "Custom (choose size and move limit)"
                    : `${difficulty.name} (${difficulty.rows}×${difficulty.columns})`,
                ],
              ),
            ),
          ),

          h("div", { className: "panel__footer" }, [
            h(
              "button",
              {
                type: "button",
                className: "link-button",
                onClick: () =>
                  window.open(
                    "https://github.com/ekremkaraca/floodit-js",
                    "_blank",
                    "noopener,noreferrer",
                  ),
              },
              ["View Source Code"],
            ),
          ]),
        ],
      ),
    ],
  );
}
