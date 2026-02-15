import { h } from "./dom.js";

export function renderHelpRules({ onBack, isInGame }) {
  return h("div", { className: "app-screen app-screen--centered" }, [
    h("div", { className: "panel panel--help" }, [
      h("div", { className: "help-header-row" }, [
        h("h1", { className: "panel__title panel__title--md" }, [
          "Help & Rules",
        ]),
        h(
          "button",
          {
            type: "button",
            onClick: onBack,
            className: "btn btn--neutral",
          },
          [isInGame ? "Back to Game" : "Back"],
        ),
      ]),

      h("div", { className: "help-sections" }, [
        h("section", { className: "panel__section" }, [
          h("h2", { className: "panel__section-title" }, ["Objective"]),
          h("ul", { className: "help-list" }, [
            h("li", {}, ["Classic: flood the entire board into one color."]),
            h("li", {}, ["Maze: reach the goal tile before moves run out."]),
          ]),
        ]),

        h("section", { className: "panel__section" }, [
          h("h2", { className: "panel__section-title" }, ["How to Play"]),
          h("ul", { className: "help-list" }, [
            h("li", {}, ["The flooded area always starts from the top-left tile."]),
            h("li", {}, ["Pick a color from the bottom palette each move."]),
            h("li", {}, ["In maze mode, walls block flood expansion and G marks the goal."]),
          ]),
        ]),

        h("section", { className: "panel__section" }, [
          h("h2", { className: "panel__section-title" }, ["Controls"]),
          h("ul", { className: "shortcut-list" }, [
            h("li", { className: "shortcut-list__item" }, [
              h("span", {}, ["Reset current game"]),
              h("kbd", { className: "kbd" }, ["Alt+Shift+R"]),
            ]),
            h("li", { className: "shortcut-list__item" }, [
              h("span", {}, ["New board with current settings"]),
              h("kbd", { className: "kbd" }, ["Alt+Shift+N"]),
            ]),
            h("li", { className: "shortcut-list__item" }, [
              h("span", {}, ["Quit to welcome screen"]),
              h("kbd", { className: "kbd" }, ["Alt+Shift+Q"]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}
