const express = require("express");
const router = express.Router();
const db = require("../db");
const { page } = require("../views");

router.get("/set-message", (req, res) => {
  if (!req.cookies.username) {
    return res.redirect("/");
  }

  res.send(page("Set My Message", `
    <h1>✏️ Set My Message</h1>
    <p class="subtitle">
      This will be encrypted in your browser before it's saved.
    </p>

    <form id="messageForm" method="POST" action="/set-message">

      <label>Your password</label>
      <input
        type="password"
        id="password"
        placeholder="Your password"
        required>

      <label>Your message</label>
      <input
        type="text"
        id="message"
        placeholder="Say something fun!"
        required>

      <input type="hidden" name="ciphertext" id="ciphertext">
      <input type="hidden" name="iv" id="iv">

      <button type="submit" class="btn btn-yellow">
        Encrypt & Save 🔒
      </button>

    </form>

    <a href="/account"
       class="btn btn-pink"
       style="margin-top:14px;display:inline-block;">
       Back
    </a>

    <script src="/public/crypto.js"></script>

    <script>

      document.getElementById("messageForm")
      .addEventListener("submit", async function(e){

        e.preventDefault();

        const password =
          document.getElementById("password").value;

        const message =
          document.getElementById("message").value;

        const result =
          await encryptMessage(password, message);

        document.getElementById("ciphertext").value =
          result.ciphertext;

        document.getElementById("iv").value =
          result.iv;

        this.submit();

      });

    </script>
  `));
});

router.post("/set-message", (req, res) => {

  if (!req.cookies.username) {
    return res.redirect("/");
  }

  db.prepare(`
      UPDATE accounts
      SET ciphertext = ?, iv = ?
      WHERE username = ?
  `).run(
      req.body.ciphertext,
      req.body.iv,
      req.cookies.username
  );

  res.redirect("/account");

});

module.exports = router;
