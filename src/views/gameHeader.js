import { h } from "./dom.js";
import { ChevronDown, SquareCode, Moon, Sun, RotateCcw, CircleHelp } from "lucide";
import { renderIcon } from "./icons.js";

export function renderGameHeader({
  boardName,
  stepsLeft,
  currentStep,
  maxSteps,
  onNewGame,
  onReset,
  onHelp,
  onToggleDarkMode,
  isDarkMode,
}) {
  const safeMaxSteps = Math.max(1, maxSteps);
  const percentageRemaining = (stepsLeft / safeMaxSteps) * 100;
  const stepsColorClass =
    percentageRemaining > 50
      ? "steps-tone--good"
      : percentageRemaining > 25
        ? "steps-tone--warn"
        : "steps-tone--danger";

  const progressPercentage = (currentStep / safeMaxSteps) * 100;

  const newGameMenu = h("details", { className: "menu menu--newgame" }, [
    h(
      "summary",
      {
        className: "btn btn--new menu__trigger",
      },
      [
        h("span", {}, ["New"]),
        renderIcon(ChevronDown, {
          className: "ui-icon menu__trigger-icon",
        }),
      ],
    ),
    h(
      "div",
      {
        className: "menu__panel",
      },
      [h("div", { className: "menu__list" }, onNewGame)],
    ),
  ]);

  function closeOnOutsideClick(event) {
    if (!newGameMenu.isConnected) {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
      return;
    }

    if (!newGameMenu.open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (newGameMenu.contains(target)) return;
    newGameMenu.open = false;
  }

  document.addEventListener("mousedown", closeOnOutsideClick);
  document.addEventListener("touchstart", closeOnOutsideClick);

  return h(
    "nav",
    {
      className: "game-header",
    },
    [
      h("div", { className: "game-header__inner" }, [
        h(
          "div",
          {
            className: "game-header__row",
          },
          [
            h("div", { className: "game-header__main" }, [
              h("div", {}, [
                h(
                  "h1",
                  {
                    className: "game-header__title",
                  },
                  [boardName],
                ),
              ]),

              h("div", { className: "game-header__steps-mobile" }, [
                h("div", { className: `steps-count ${stepsColorClass}` }, [
                  String(stepsLeft),
                ]),
                h("div", { className: "steps-label" }, ["left"]),
              ]),

              h("div", { className: "game-header__progress-wrap" }, [
                h("div", { className: "progress" }, [
                  h(
                    "div",
                    {
                      className: "progress__meta",
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
                      className: "progress__track",
                    },
                    [
                      h("div", {
                        className: "progress__fill",
                        style: { width: `${progressPercentage}%` },
                      }),
                    ],
                  ),
                ]),
              ]),
            ]),

            h(
              "div",
              {
                className: "game-header__actions",
              },
              [
                newGameMenu,

                h(
                  "button",
                  {
                    type: "button",
                    onClick: onReset,
                    className: "btn btn--neutral",
                    title: "Reset game",
                    "aria-label": "Reset game",
                  },
                  [renderIcon(RotateCcw)],
                ),

                h(
                  "button",
                  {
                    type: "button",
                    onClick: onToggleDarkMode,
                    className: "btn btn--neutral btn--icon",
                    title: "Toggle dark mode",
                    "aria-label": "Toggle dark mode",
                  },
                  [isDarkMode ? renderIcon(Sun) : renderIcon(Moon)],
                ),

                h(
                  "button",
                  {
                    type: "button",
                    onClick: onHelp,
                    className: "btn btn--neutral btn--icon",
                    title: "Open help and rules",
                    "aria-label": "Open help and rules",
                  },
                  [renderIcon(CircleHelp)],
                ),

                h(
                  "button",
                  {
                    type: "button",
                    onClick: () =>
                      window.open(
                        "https://github.com/ekremkaraca/floodit-js",
                        "_blank",
                        "noopener,noreferrer",
                      ),
                    className: "btn btn--neutral btn--icon",
                    title: "View source code on GitHub",
                    "aria-label": "View source code on GitHub",
                  },
                  [renderIcon(SquareCode)],
                ),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
