const express = require("express");
const router = express.Router();
const db = require("../db");
const { page } = require("../views");

router.get("/account", (req, res) => {
  if (!req.cookies.username) {
    return res.redirect("/");
  }

  const me = db.prepare("SELECT * FROM accounts WHERE username = ?").get(req.cookies.username);
  if (!me) {
    res.clearCookie("username");
    return res.redirect("/");
  }

  const messageBlock = me.ciphertext
  ? `
  <div class="message-box">

      <div id="lockedBox">

          🔒 Message is locked.<br><br>

          <input
              type="password"
              id="unlockPassword"
              placeholder="Enter your password">

          <button
              id="unlockBtn"
              class="btn btn-yellow"
              style="margin-top:10px;">
              Unlock 🔓
          </button>

      </div>

      <div
          id="messageArea"
          style="display:none;">
      </div>

  </div>

  <script src="/public/crypto.js"></script>

  <script>

  const ciphertext = ${JSON.stringify(me.ciphertext)};
  const iv = ${JSON.stringify(me.iv)};

  document.getElementById("unlockBtn")
  .addEventListener("click", async () => {

      const password =
          document.getElementById("unlockPassword").value;

      try{

          const message =
              await decryptMessage(
                  password,
                  ciphertext,
                  iv
              );

          document.getElementById("lockedBox").style.display = "none";

          document.getElementById("messageArea").style.display = "block";

          document.getElementById("messageArea").innerHTML =
              "<strong>💬 Your message:</strong><br>" + message;

      }
      catch{

          alert("Wrong password!");

      }

  });

  </script>
  `
  :
  `<div class="message-box empty">💬 No message set yet.</div>`;

  res.send(page("My Page", `
    <h1>👋 Hi, ${me.display_name}!</h1>
    ${messageBlock}
    <div class="button-row">
      <a href="/set-message" class="btn btn-yellow">✏️ Set My Message</a>
      <a href="/change-password" class="btn btn-green">🔑 Change Password</a>
    </div>
    <a href="/logout" class="btn btn-pink" style="margin-top: 14px; display:inline-block;">Log Out</a>
  `));
});

router.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

module.exports = router;
