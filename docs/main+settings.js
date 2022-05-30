var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 17;
var canvasOffsetLeft = parseInt($("#content").css("margin-left"));
var mouseX;
var dx = 2; //속도 조절
var dy = -2;
var paddleWidth = 148;
var paddleHeight = (51 / 148) * paddleWidth;
var paddleX = (canvas.width - paddleWidth) / 2;
var paddleimg = new Image();
paddleimg.src = "./image/paddleImage.png";
var x = canvas.width / 2;
var y = canvas.height - paddleHeight - 30;
var rightPressed = false;
var leftPressed = false;
var brickRowCount = 14;
var brickColumnCount = 3;
var brickWidth = 65;
var brickHeight = 65;
var brickPadding = 5;
var brickOffsetTop = 55;
var brickOffsetLeft = 30;
var brickImage = new Image();
brickImage.src = "./image/blockImage.png";
var rockBrickImage = new Image();
rockBrickImage.src = "./image/rockBlockImg.png";
var monsterbrickImage = new Image();
monsterbrickImage.src = "./image/monsterBlock.png";
var monsterImage = new Image();
monsterImage.src = "./image/monster.png";
var monsterWidth = brickWidth / 2;
var score = 0;
var scoreImg = new Image();
scoreImg.src = "./image/score.png";
var lives = 5;
var livesImg = new Image();
livesImg.src = "./image/lives.png";
var levelImg = new Image();
levelImg.src = "./image/level.png";

var tempscore = 0;
var wallcount = 0;
var emptyBlockCount = 0;
var level = 1;
var slideIndex = 1;

var timer;

var bgm = 0;
var bgmList = ["./sound/bgm1.mp3", "./sound/bgm2.mp3", "./sound/bgm3.mp3"];
var bgmPlayList = [
  new Audio("./sound/bgm1.mp3"),
  new Audio("./sound/bgm2.mp3"),
  new Audio("./sound/bgm3.mp3"),
];
var soundEffect = 0;
var effectList = [
  new Audio("./sound/effect1.mp3"),
  new Audio("./sound/effect2.mp3"),
  new Audio("./sound/effect3.mp3"),
];

var monsterList = [];

// 아이템 넣기 위해서 수정
// var itemList = ["속도up", "속도down", "바up", "바down"];
var itemImg = [new Image(), new Image(), new Image(), new Image()];
itemImg[0].src = "./image/item_speed_up.png";
itemImg[1].src = "./image/item_speed_down.png";
itemImg[2].src = "./image/item_bar_up.png";
itemImg[3].src = "./image/item_bar_down.png";

var bricks = [];
for (var c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (var r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, wall: 0, monster: 0 };
  }
}

function randomWall(percent) {
  var i = Math.floor(Math.random() * 10);
  if (i >= percent) {
    return 0;
  } else {
    return 1;
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

var relativeX;

function mouseMoveHandler(e) {
  mouseX = e.clientX;
  relativeX = mouseX - canvasOffsetLeft;
  if (
    relativeX >= paddleWidth / 4 &&
    relativeX < canvas.width - paddleWidth / 4
  ) {
    paddleX = relativeX - paddleWidth / 2;
  }
}
function monsterCollisionDetection() {
  for (i = 0; i < monsterList.length; i++) {
    if (monsterList[i].status == 1) {
      if (
        monsterList[i].x + monsterWidth > paddleX &&
        monsterList[i].x < paddleX + paddleWidth &&
        monsterList[i].y + monsterWidth > canvas.height - paddleHeight - 10 &&
        monsterList[i].y < canvas.height - 10
      ) {
        lives--;
        monsterList[i].status = 0;
        $("#background").css("display", "none");
        $("#backgroundDamage").css({ display: "block", opacity: "0.5" });
        setTimeout(() => {
          $("#background").css("display", "block");
          $("#backgroundDamage").css("opacity", "0");
        }, 800);
        if (!lives) {
          // alert("GAME OVER");
          // document.location.reload();
          clearInterval(timer);
          drawLives();
          printGameover();
        }
        console.log("맞음");
      }
    }
  }
}
function collisionDetection() {
  // 벽돌 삭제 부분
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status >= 1) {
        var flag = 0;
        if (
          //벽돌에 충돌했을때
          (x + ballRadius >= b.x &&
            x + ballRadius < b.x + brickWidth &&
            y >= b.y &&
            y <= b.y + brickHeight) ||
          (x - ballRadius > b.x &&
            x - ballRadius <= b.x + brickWidth &&
            y > b.y &&
            y < b.y + brickHeight)
        ) {
          dx = -dx;
          flag = 1;
          if (b.wall == 1) {
            if (dx < 0) {
              x = x - ballRadius;
            } else {
              x = x + ballRadius;
            }
          }
        }
        if (
          //upper bound of ball in brick:
          (y - ballRadius > b.y &&
            y - ballRadius <= b.y + brickHeight &&
            x >= b.x &&
            x <= b.x + brickWidth) ||
          // lower bound of ball in brick:
          (y + ballRadius >= b.y &&
            y + ballRadius < b.y + brickHeight &&
            x >= b.x &&
            x <= b.x + brickWidth)
        ) {
          dy = -dy;
          flag = 1;
          if (b.wall == 1) {
            if (dy < 0) {
              y = y - ballRadius;
            } else {
              y = y + ballRadius;
            }
          }
        }
        if (flag == 1) {
          if (b.wall != 1) {
            // 아이템이 있는 벽돌이라면
            if (b.status == 2) {
              dx *= 1.4;
              dy *= 1.4;
            } else if (b.status == 3) {
              dx *= 0.8;
              dy *= 0.8;
            } else if (b.status == 4) {
              paddleWidth += 25;
              paddleHeight = (51 / 148) * paddleWidth;
            } else if (b.status == 5) {
              paddleWidth -= 25;
              paddleHeight = (51 / 148) * paddleWidth;
            }
            b.status = 0;
            score++;
            tempscore++;

            effectList[soundEffect].play();
          }
          console.log(tempscore);
          if (
            tempscore ==
            brickRowCount * brickColumnCount - wallcount - emptyBlockCount
          ) {
            clearInterval(timer);
            draw();
            if (level == 3) {
              printWin();
              return;
            }

            printscore();
            initialize(++level);
          }
          if (b.monster == 1) {
            monsterList[monsterList.length] = {
              status: 1,
              x: r * (brickWidth + brickPadding) + brickOffsetLeft,
              y: c * (brickHeight + brickPadding) + brickOffsetTop,
            };
          }
        }
      }
    }
  }

  for (i = 0; i < monsterList; i++) {
    //if (paddleX)= TODO
  }
}

function printscore() {
  $("#score_popup").removeClass("bounce-out");
  $("#score_popup").removeClass("hide").addClass("popup").addClass("bounce-in");
  change_position($("#score_popup"));

  $("#print_level").html(`<img src='./image/clear.png' />`);
  // $("#print_level").html(`<img src='./image/level${level}.png' /><img src='./image/clear.png' />`);
  $("#print_score").text("SCORE: " + score);
}

$("#click_next").on("click", function () {
  $("#score_popup").removeClass("bounce-in").addClass("bounce-out");
  setTimeout(() => {
    $("#score_popup").addClass("hide");
    timer = setInterval(draw, 10);
  }, "400");
});

$("#click_main").on("click", function () {
  $("#score_popup").removeClass("bounce-in").addClass("bounce-out");
  setTimeout(() => {
    $("#score_popup").addClass("hide");
    $("#start-page").css("display", "flex");
    $("#pause_div").css("display", "none");
    $("#myCanvas").css("display", "none");
    $("#next_level").removeClass("hide");
    $("#dead").addClass("hide");
  }, "400");

  level = 1;
  score = 0;
  initialize(level);
});

function printWin() {
  $("#score_popup").removeClass("bounce-out");
  $("#score_popup").removeClass("hide").addClass("popup").addClass("bounce-in");
  change_position($("#score_popup"));

  $("#print_level").html(
    `<img class="star" src='./image/star_left.png' /><img src='./image/youwin.png' /><img class="star" src='./image/star_left.png' />`
  );
  $("#print_score").text("SCORE: " + score);

  $("#next_level").addClass("hide");
}

var ballImg;
var imgList = [
  "./image/red.png",
  "./image/red2.png",
  "./image/yellow.png",
  "./image/yellow2.png",
  "./image/blue.png",
  "./image/blue2.png",
];
function drawBallImage() {
  ballImg = new Image();
  if (dx > 0) {
    ballImg.src = imgList[(level - 1) * 2];
  } else {
    ballImg.src = imgList[(level - 1) * 2 + 1];
  }
}
function drawBall() {
  ctx.drawImage(
    ballImg,
    x - ballRadius,
    y - ballRadius,
    ballRadius * 2,
    ballRadius * 2
  );
}

function drawPaddle() {
  ctx.drawImage(
    paddleimg,
    paddleX,
    canvas.height - paddleHeight - 10,
    paddleWidth,
    paddleHeight
  );
}
function drawBricks() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        var brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        // ctx.beginPath();
        // ctx.rect(brickX, brickY, brickWidth, brickHeight);
        if (bricks[c][r].wall == 1) {
          ctx.drawImage(
            rockBrickImage,
            brickX,
            brickY,
            brickWidth,
            brickHeight
          );
        } else if (bricks[c][r].monster == 1) {
          ctx.drawImage(
            monsterbrickImage,
            brickX,
            brickY,
            brickWidth,
            brickHeight
          );
        } else {
          ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
        }
        // ctx.fill();
        // ctx.closePath();
      }
      //아이템이 있는 벽돌들에 아이템 글씨 표시
      else if (bricks[c][r].status > 1) {
        var brickX = r * (brickWidth + brickPadding) + brickOffsetLeft;
        var brickY = c * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.drawImage(
          itemImg[bricks[c][r].status - 2],
          brickX,
          brickY,
          brickWidth,
          brickHeight
        );
      }
    }
  }
}
function drawMonster() {
  for (i = 0; i < monsterList.length; i++) {
    if (monsterList[i].status == 1) {
      ctx.drawImage(
        monsterImage,
        monsterList[i].x,
        monsterList[i].y,
        brickWidth / 2,
        brickHeight / 2
      );
    }
  }
}
function drawScore() {
  ctx.font = "800 33px Gowun-Dodum";
  ctx.fillStyle = "#FFae00";
  ctx.fillText(": " + score, 355, 40);
}
function drawLives() {
  ctx.font = "800 33px Gowun-Dodum";
  ctx.fillStyle = "#FFae00";
  ctx.fillText(": " + lives, 735, 40);
}

function drawLevel() {
  ctx.font = "800 33px Gowun-Dodum";
  ctx.fillStyle = "#FFae00";
  ctx.fillText(": " + level, 545, 40);
  // 가운데로 나중에 수치 조절할 것
}

function drawBackground() {
  if (level == 1) {
    $("#myCanvas").css("background-image", "url(./image/bg1.png)");
  } else if (level == 2) {
    $("#myCanvas").css("background-image", "url(./image/bg2.jpeg)");
  } else if (level == 3) {
    $("#myCanvas").css("background-image", "url(./image/bg3.jpeg)");
  }

  ctx.drawImage(scoreImg, 270, 15, 79, 28);
  ctx.drawImage(levelImg, 460, 15, 79, 28);
  ctx.drawImage(livesImg, 650, 15, 79, 28);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBallImage();
  drawBall();
  drawPaddle();
  drawMonster();
  drawScore();
  drawLives();
  drawLevel();
  drawBackground();
  collisionDetection();
  monsterCollisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - paddleHeight - 2) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      //바에 맞는 위치에 따라 공이 꺾이는 각도 변화
      if (x < paddleX + paddleWidth * 0.2 || x > paddleX + paddleWidth * 0.8) {
        console.log("밖");
        if (dx > 0) {
          dx += 0.2;
        } else {
          dx -= 0.2;
        }
        dy += 0.2;
      } else if (
        x > paddleX + paddleWidth * 0.4 &&
        x < paddleX + paddleWidth * 0.6
      ) {
        console.log("안");
        if (dx > 0) {
          dx -= 0.2;
        } else {
          dx += 0.2;
        }
        dy -= 0.2;
      }
      dy = -dy;
    } else {
      lives--;
      if (!lives) {
        // alert("GAME OVER");
        // document.location.reload();
        clearInterval(timer);
        drawLives();
        printGameover();

        //
      } else {
        $("#myCanvas")
          .animate({ opacity: "0.5" }, 500)
          .animate({ opacity: "1" }, 1000);
        $("#background").css("display", "none");
        $("#backgroundDamage").css({ display: "block", opacity: "0.5" });
        clearInterval(timer);
        setTimeout(() => {
          $("#background").css("display", "block");
          $("#backgroundDamage").css("opacity", "0");
          timer = setInterval(draw, 10);
        }, 800);
        x = paddleX + paddleWidth / 2;
        y = canvas.height - paddleHeight - 20;
        dy = -Math.abs(dy);
        //init_speed(level);
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;
  for (i = 0; i < monsterList.length; i++) {
    monsterList[i].y += 3;
  }
}

function printGameover() {
  $("#dead").removeClass("hide");

  $("#score_popup").removeClass("bounce-out");
  $("#score_popup").removeClass("hide").addClass("popup").addClass("bounce-in");
  change_position($("#score_popup"));

  $("#print_level").html(
    `<img src='./image/gameover.png' style="width: 350px !important" />`
  );
  $("#print_score").text("SCORE: " + score);

  $("#next_level").addClass("hide");
}

function mainpage() {
  $("#enter").css("display", "none");
  $("#start").css("display", "block");
  $("#settings").css("display", "block");
}

function init_speed(level) {
  if (level == 1) {
    dx = 2.5;
    dy = -2.5;
  } else if (level == 2) {
    dx = 3;
    dy = -3;
  } else if (level == 3) {
    dx = 3.3;
    dy = -3.3;
  }
}

function initialize(level) {
  if (level == 1) {
    brickColumnCount = 3;
  } else if (level == 2) {
    brickColumnCount = 4;
  } else if (level == 3) {
    brickColumnCount = 5;
  }
  for (var c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (var r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, wall: 0, monster: 0 };
    }
  }
  lives = 5 - level + 1;
  tempscore = 0;
  wallcount = 0;
  emptyBlockCount = 0;
  drawBallImage();

  // 레벨별 paddle 초기화 (너무 작아지지 않게)
  paddleWidth = 148;
  paddleHeight = (51 / 148) * paddleWidth;

  x = canvas.width / 2;
  y = canvas.height - paddleHeight - 30;

  // 레벨별 speed 초기화
  init_speed(level);

  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      if (randomWall(1)) {
        bricks[c][r].wall = 1;
        bricks[c][r].status = 1;
        wallcount++;
      } else if (randomWall(4)) {
        bricks[c][r].status = 0;
        emptyBlockCount++;
      } else if (randomWall((level - 1) * 3)) {
        bricks[c][r] = { x: 0, y: 0, status: 1, monster: 1 };
      } else {
        bricks[c][r].wall = 0;
        var random = Math.random() * 5;
        if (random < 1) {
          var index = Math.floor(Math.random() * 4);
          bricks[c][r] = { x: 0, y: 0, status: 2 + index };
        } else {
          bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
    }
  }
}

$("#enter").on("click", mainpage);

$("#playbutton>img").on("click", function () {
  $("#myCanvas").css("display", "block");
  $("#pause_div").css("display", "flex");
  initialize(level);

  timer = setInterval(draw, 10);

  $("#start-page").css("display", "none");
  // $("#second-page").css("display", "block");
});
$("#pause_btn").on("click", function () {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  $("#pause").removeClass("hide");
  clearInterval(timer);
  $("#pause_popup").removeClass("bounce-out");
  $("#pause_popup").removeClass("hide").addClass("popup").addClass("bounce-in");
  change_position($("#pause_popup"));
  // $("#myCanvas").css("display", "none");
  // $("#pause_div").css("display", "none");
  // $("#start-page").css("display", "flex");
});

$("#resume_btn").on("click", () => {
  $("#pause_popup").removeClass("bounce-in").addClass("bounce-out");
  setTimeout(() => {
    $("#pause_popup").addClass("hide");
    timer = setInterval(draw, 10);
    $("#pause").addClass("hide");
  }, "400");
});

$("#retry_btn").on("click", () => {
  $("#pause_popup").removeClass("bounce-in").addClass("bounce-out");
  setTimeout(() => {
    $("#pause_popup").addClass("hide");
    score = score - tempscore;
    initialize(level);
    timer = setInterval(draw, 10);
    $("#pause").addClass("hide");
  }, "400");
});

$("#home_btn").on("click", () => {
  $("#pause_popup").removeClass("bounce-in").addClass("bounce-out");
  setTimeout(() => {
    $("#pause_popup").addClass("hide");
    $("#pause").addClass("hide");

    $("#start-page").css("display", "flex");
    $("#pause_div").css("display", "none");
    $("#myCanvas").css("display", "none");
  }, "400");

  level = 1;
  score = 0;
  initialize(level);
});

// settings page js start
$("#settingbutton>img").on("click", show_settings);

// 설정 팝업 띄우기
function show_settings() {
  $("#settings-page").addClass("popup");
  change_position($(".popup"));

  $("#settings-page").fadeIn();
  $("#start-page").css("opacity", 0.5);

  $('input:radio[name="bgm"]').eq(bgm).prop("checked", true);
  $('input:radio[name="bounce"]').eq(soundEffect).prop("checked", true);
  showDivs(slideIndex);
}

var audio = document.getElementById("bgm");
var bgmAudio = new Audio();
$("#save_settings").on("click", function () {
  $("#settings-page").fadeOut();
  $("#start-page").css("opacity", 1);

  // 설정 저장 함수 추가
  //  //레벨 저장
  level = slideIndex;
  drawBackground();
  drawBallImage();
  // 배경음악 저장
  var bgmChecked = $('input:radio[name="bgm"]:checked').val();
  console.log(bgmChecked);
  if (bgmChecked == "bgm1") {
    bgm = 0;
  } else if (bgmChecked == "bgm2") {
    bgm = 1;
  } else if (bgmChecked == "bgm3") {
    bgm = 2;
  }
  bgmAudio.pause();
  audio.src = bgmList[bgm];
  audio.load();
  audio.play();

  //효과음 저장
  var effectChecked = $('input:radio[name="bounce"]:checked').val();
  if (effectChecked == "bounce1") {
    soundEffect = 0;
  } else if (effectChecked == "bounce2") {
    soundEffect = 1;
  } else if (effectChecked == "bounce3") {
    soundEffect = 2;
  }

  // level은 init부분 설정
  // 나머지 sound랑 배경은 그냥 src 적용
});

$("#cancel_settings").on("click", function () {
  slideIndex = level;
  bgmAudio.pause();
  audio.play();
  $("#settings-page").fadeOut();
  $("#start-page").css("opacity", 1);
});

$(".bgmLabel").on("click", function () {
  var bgmFor = $(this).attr("for");
  bgmAudio.src = "./sound/" + bgmFor + ".mp3";
  audio.pause();
  bgmAudio.load();
  bgmAudio.play();
});
$(".bounceLabel").on("click", function () {
  var index = $(this).attr("for");
  effectList[index[6] - 1].play();
});

$(window).resize(function () {
  change_position($(".popup"));
});
function change_position(e) {
  e.css("top", ($(window).height() - e.height()) / 2);
  e.css("left", ($(window).width() - e.width()) / 2);
}

// level slide
showDivs(slideIndex);

function plusDivs(n) {
  showDivs((slideIndex += n));
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("levels");
  if (n > x.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = x.length;
  }
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  x[slideIndex - 1].style.display = "block";
}

// settings page js end
