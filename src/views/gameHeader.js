import { h } from "./dom.js";

export function renderGameHeader({
  boardName,
  stepsLeft,
  currentStep,
  maxSteps,
  onNewGame,
  onReset,
  onToggleDarkMode,
  isDarkMode,
}) {
  const safeMaxSteps = Math.max(1, maxSteps);
  const percentageRemaining = (stepsLeft / safeMaxSteps) * 100;
  const stepsColorClass =
    percentageRemaining > 50
      ? "text-green-600 dark:text-green-400"
      : percentageRemaining > 25
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";

  const progressPercentage = (currentStep / safeMaxSteps) * 100;

  return h(
    "nav",
    {
      className:
        "bg-white dark:bg-gray-800 rounded-lg shadow-md px-2 sm:px-3 py-1.5 sm:py-2 transition-colors duration-200",
    },
    [
      h("div", { className: "max-w-4xl mx-auto" }, [
        h(
          "div",
          {
            className:
              "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          },
          [
            h(
              "div",
              { className: "flex items-center gap-2 sm:gap-3 flex-1 min-w-0" },
              [
                h("div", {}, [
                  h(
                    "h1",
                    {
                      className:
                        "text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 truncate",
                    },
                    [boardName],
                  ),
                ]),

                h("div", { className: "flex items-center gap-1 sm:hidden" }, [
                  h(
                    "div",
                    { className: `text-sm font-bold ${stepsColorClass}` },
                    [String(stepsLeft)],
                  ),
                  h(
                    "div",
                    { className: "text-xs text-gray-600 dark:text-gray-400" },
                    ["left"],
                  ),
                ]),

                h(
                  "div",
                  { className: "hidden sm:flex flex-1 max-w-xs items-center" },
                  [
                    h("div", { className: "w-full" }, [
                      h(
                        "div",
                        {
                          className:
                            "flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 px-2",
                        },
                        [
                          h("span", { className: stepsColorClass }, [
                            `${currentStep} / ${maxSteps} (${stepsLeft} steps left)`,
                          ]),
                          h("span", {}, [`${Math.round(progressPercentage)}%`]),
                        ],
                      ),
                      h(
                        "div",
                        {
                          className:
                            "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden",
                        },
                        [
                          h("div", {
                            className:
                              "h-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out",
                            style: { width: `${progressPercentage}%` },
                          }),
                        ],
                      ),
                    ]),
                  ],
                ),
              ],
            ),

            h(
              "div",
              {
                className:
                  "flex items-center justify-end gap-1 sm:gap-2 shrink-0",
              },
              [
                h("details", { className: "relative" }, [
                  h(
                    "summary",
                    {
                      className:
                        "list-none inline-flex h-10 sm:h-11 items-center justify-center px-3 sm:px-4 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg transition-all duration-200 font-semibold shadow-md text-sm sm:text-base hover:from-green-600 hover:to-emerald-600 cursor-pointer active:scale-95",
                    },
                    ["New ▼"],
                  ),
                  h(
                    "div",
                    {
                      className:
                        "absolute top-full left-0 mt-1 sm:mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10 min-w-full sm:min-w-50",
                    },
                    [h("div", { className: "py-1 sm:py-2" }, onNewGame)],
                  ),
                ]),

                h(
                  "button",
                  {
                    type: "button",
                    onClick: onReset,
                    className:
                      "inline-flex h-10 sm:h-11 items-center justify-center px-3 sm:px-4 bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-md text-sm sm:text-base active:scale-95",
                  },
                  ["Reset"],
                ),

                h(
                  "button",
                  {
                    type: "button",
                    onClick: onToggleDarkMode,
                    className:
                      "inline-flex h-10 sm:h-11 w-10 sm:w-11 items-center justify-center bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-md active:scale-95",
                    title: "Toggle dark mode",
                    "aria-label": "Toggle dark mode",
                  },
                  [isDarkMode ? "☀" : "☾"],
                ),

                h(
                  "button",
                  {
                    type: "button",
                    onClick: () =>
                      window.open(
                        "https://github.com/ekremkaraca/floodit-js",
                        "_blank",
                      ),
                    className:
                      "inline-flex h-10 sm:h-11 w-10 sm:w-11 items-center justify-center bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-md active:scale-95",
                    title: "View source code on GitHub",
                    "aria-label": "View source code on GitHub",
                  },
                  ["</>"],
                ),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
