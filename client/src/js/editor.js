// Import methods to save and get data from the indexedDB database in './database.js'
import { getDb, putDb } from "./database";
import { header } from "./header";

export default class {
  constructor() {
    const localData = localStorage.getItem("content");

    // check if CodeMirror is loaded
    if (!window.CodeMirror) {
      throw new Error("CodeMirror is not loaded or initiated properly");
    }

    try {
      this.editor = CodeMirror(document.querySelector("#main"), {
        value: "",
        mode: "javascript",
        theme: "monokai",
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
        indentUnit: 2,
        tabSize: 2,
      });
    } catch (error) {
      console.error("Failed to initialize CodeMirror", error);
      return;
    }

    // When the editor is ready, set the value to whatever is stored in indexeddb.
    // Fall back to localStorage if nothing is stored in indexeddb, and if neither is available, set the value to header.
    getDb().then((data) => {
      console.info("Loaded data from IndexedDB, injecting into editor");
      const value = data || localData || header;

      // Check if the value is a string and if it's not empty
      if (typeof value !== "string" || !value.trim()) {
        console.error("Unexpected or empty value", value);
        return;
      }

      // Set the value of the editor
      this.editor.setValue(value);
    });

    this.editor.on("change", () => {
      localStorage.setItem("content", this.editor.getValue());
    });

    // Save the content of the editor when the editor itself is loses focus
    this.editor.on("blur", () => {
      console.log("The editor has lost focus");
      putDb(localStorage.getItem("content"));
    });
  }
  toString() {
    return this.editor.getValue();
  }
}
