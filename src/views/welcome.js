import { h } from "./dom.js";
import { DIFFICULTIES } from "../engine/game.js";

export function renderWelcome({ actions }) {
  return h(
    "div",
    {
      className:
        "min-h-dvh w-full bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 grid place-items-center px-4 py-6 transition-colors duration-200",
    },
    [
      h(
        "div",
        {
          className:
            "bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-auto transition-colors duration-200",
        },
        [
          h(
            "h1",
            {
              className:
                "text-4xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100",
            },
            ["Flood It"],
          ),

          h("div", { className: "mb-6" }, [
            h(
              "h2",
              {
                className:
                  "text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3",
              },
              ["How to Play"],
            ),
            h(
              "ul",
              {
                className: "text-gray-600 dark:text-gray-400 space-y-2 text-sm",
              },
              [
                h("li", { className: "flex items-start" }, [
                  h(
                    "span",
                    { className: "text-purple-500 dark:text-purple-400 mr-2" },
                    ["▸"],
                  ),
                  "Start from the top-left corner",
                ]),
                h("li", { className: "flex items-start" }, [
                  h(
                    "span",
                    { className: "text-purple-500 dark:text-purple-400 mr-2" },
                    ["▸"],
                  ),
                  "Select colors to flood connected areas",
                ]),
                h("li", { className: "flex items-start" }, [
                  h(
                    "span",
                    { className: "text-purple-500 dark:text-purple-400 mr-2" },
                    ["▸"],
                  ),
                  "Fill the entire board with one color",
                ]),
                h("li", { className: "flex items-start" }, [
                  h(
                    "span",
                    { className: "text-purple-500 dark:text-purple-400 mr-2" },
                    ["▸"],
                  ),
                  "Complete in the minimum number of moves",
                ]),
              ],
            ),
          ]),

          h("div", { className: "mb-6" }, [
            h(
              "h2",
              {
                className:
                  "text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3",
              },
              ["Keyboard Shortcuts"],
            ),
            h(
              "ul",
              {
                className: "text-gray-600 dark:text-gray-400 space-y-2 text-sm",
              },
              [
                h(
                  "li",
                  { className: "flex items-start justify-between gap-3" },
                  [
                    h("span", {}, ["Reset current game"]),
                    h(
                      "kbd",
                      {
                        className:
                          "rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 font-mono text-xs text-gray-800 dark:text-gray-200",
                      },
                      ["Alt+Shift+R"],
                    ),
                  ],
                ),
                h(
                  "li",
                  { className: "flex items-start justify-between gap-3" },
                  [
                    h("span", {}, ["New game (current settings)"]),
                    h(
                      "kbd",
                      {
                        className:
                          "rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 font-mono text-xs text-gray-800 dark:text-gray-200",
                      },
                      ["Alt+Shift+N"],
                    ),
                  ],
                ),
                h(
                  "li",
                  { className: "flex items-start justify-between gap-3" },
                  [
                    h("span", {}, ["Quit to welcome screen"]),
                    h(
                      "kbd",
                      {
                        className:
                          "rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 font-mono text-xs text-gray-800 dark:text-gray-200",
                      },
                      ["Alt+Shift+Q"],
                    ),
                  ],
                ),
              ],
            ),
          ]),

          h(
            "p",
            { className: "text-gray-600 dark:text-gray-400 text-center mb-6" },
            ["Choose your difficulty level to begin!"],
          ),

          h(
            "div",
            { className: "space-y-3" },
            DIFFICULTIES.map((difficulty) =>
              h(
                "button",
                {
                  type: "button",
                  className:
                    "w-full px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 font-semibold shadow-md",
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

          h("div", { className: "mt-6 text-center" }, [
            h(
              "button",
              {
                type: "button",
                className:
                  "inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium",
                onClick: () =>
                  window.open(
                    "https://github.com/ekremkaraca/floodit-js",
                    "_blank",
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
