// const token = require("../utils/token");

var login = document.getElementById("btnLogin");

login.addEventListener("click", function() {
  $("#alertFill").remove();
  $("#alertFill").remove();
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  if (username === '' || password === '') {
    $("#cardLogin").append('<div id="alertFill" class="alert alert-warning card-alert" role="alert">Please enter username and password</div>');
  } else {
    $.ajax({
        url: '/login',
        type: 'POST',
        data: {username: username, password: password}
    }).done(function(res, status, xhr) {
      // localStorage.setItem("token", res.token);
      console.log("Got token from server: " + res.token);
      window.location.replace('/');
    })
    .fail((err) => {
      $("#cardLogin").append('<div id="alertWrong" class="alert alert-warning card-alert" role="alert">Username or password is not correct</div>');
    })
  }
  
})



