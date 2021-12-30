/*
 * Name: Caroline Freer and Ryan Khamneian
 * Date: November 29, 2021
 * Section: CSE 154 AE Tim Mandzyuk & Nikola Bojanic and AB Shriya Kurpad & Abdul Itani
 *
 * This is the JS to implement the UI for our Nozama store. It allows the user to buy items,
 * sign in, log out, create an account sell items, see transaction history, filter items,
 * and more.
 */

"use strict";
(function() {

  window.addEventListener("load", onLoad);

  /**
   * Once the page loads, sets up original functionality.
   */
  function onLoad() {
    // TODO
  }

  /**
   * Hides the given element.
   * @param {HTMLElement} element - the element to be hidden.
   */
  function hide(element) {
    element.classList.add("hidden");
  }

  /**
   * Shows the given element.
   * @param {HTMLElement} element - the element to be shown.
   */
  function show(element) {
    element.classList.remove("hidden");
  }

  /**
   * Checks the status of the fetch to make sure everything went okay.
   * @param {Response} res - the response of fetching the url.
   * @return {Response} the response of fetching the url if nothing went wrong.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /* ---- Helper Functions ---- */
  /**
   * Returns the DOM object with the given id attribute.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id (null if not found).
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first DOM object that matches the given selector.
   * @param {string} selector - query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns an array of DOM objects that match the given selector.
   * @param {string} selector - query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();