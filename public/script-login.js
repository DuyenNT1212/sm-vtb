// window.location.replace("/login");
// window.location.pathname
$("#username").keyup(function (event) {
  if (event.keyCode === 13) {
    $("#btnLogin").click();
  }
});

$("#password").keyup(function (event) {
  if (event.keyCode === 13) {
    $("#btnLogin").click();
  }
});

$("#btnLogin").click(function () {
  $("#warningErr").empty();
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  if (username  === "" || password  === "") {
    $("#warningErr").append(
        '<div class="alert alert-warning card-alert" role="alert">Please enter username and password</div>'
    );
  } else {
    $("#warningErr").empty();
    $.ajax({
      url: "/login",
      type: "POST",
      data: { username: username, password: password },
      statusCode: {
        403: function () {
          $("#warningErr").append(
              '<div class="alert alert-warning card-alert" style="height: 65px; font-size: 15px;" role="alert">Access denied. Unauthorized IP address.</br>Please contact trangth9@viettel.com.vn for further information.</div>'
          );
        },
        400: function () {
          $("#warningErr").append(
              '<div class="alert alert-warning card-alert" role="alert">Username or password is wrong</div>'
          );
        },
      },
    })
        .done(function (res, status, xhr) {
          // localStorage.setItem("token", res.token);
          console.log("Got token from server: " + res.token);
          window.location.replace("/");
        })
        .fail((err) => {
        });
  }
});
