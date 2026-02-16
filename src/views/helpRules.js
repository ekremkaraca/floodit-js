import { h } from "./dom.js";

export function renderHelpRules({ onBack, isInGame }) {
  return h("div", { className: "app-screen app-screen--centered" }, [
    h("div", {
      className: "panel help-panel",
    }, [
      h("div", { className: "help-header-row" }, [
        h("h1", { className: "panel__title panel__title--help" }, [
          "Help & Rules",
        ]),
        h(
          "button",
          {
            type: "button",
            onClick: onBack,
            className: "btn btn--neutral btn--help-back",
          },
          [isInGame ? "Back to Game" : "Back"],
        ),
      ]),

      h("div", { className: "help-sections" }, [
        h("section", { className: "help-card" }, [
          h("h2", { className: "help-card__title" }, ["Objective"]),
          h("ul", { className: "help-card__list" }, [
            h("li", {}, ["Classic: flood the entire board into one color."]),
            h("li", {}, ["Maze: reach the goal tile before moves run out."]),
          ]),
        ]),

        h("section", { className: "help-card" }, [
          h("h2", { className: "help-card__title" }, ["How to Play"]),
          h("ul", { className: "help-card__list" }, [
            h("li", {}, ["The flooded area always starts at top-left."]),
            h("li", {}, ["Pick one color per move from the palette."]),
            h("li", {}, ["Walls block flood expansion in maze mode."]),
          ]),
        ]),

        h("section", { className: "help-card help-card--wide" }, [
          h("h2", { className: "help-card__title" }, ["Keyboard Shortcuts"]),
          h("ul", { className: "help-card__list help-shortcuts" }, [
            h("li", { className: "help-shortcuts__item" }, [
              h("kbd", { className: "kbd" }, ["Alt+Shift+R"]),
              h("span", {}, ["Reset current game"]),
            ]),
            h("li", { className: "help-shortcuts__item" }, [
              h("kbd", { className: "kbd" }, ["Alt+Shift+N"]),
              h("span", {}, ["New game with current settings"]),
            ]),
            h("li", { className: "help-shortcuts__item" }, [
              h("kbd", { className: "kbd" }, ["Alt+Shift+Q"]),
              h("span", {}, ["Quit to welcome screen"]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}
