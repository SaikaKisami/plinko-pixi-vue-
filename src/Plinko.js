import Matter from "matter-js";
import * as PIXI from "pixi.js";

export function Plinko(element) {
  const Engine = Matter.Engine;
  const Render = Matter.Render;
  const Runner = Matter.Runner;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;
  const Composite = Matter.Composite;
  const Events = Matter.Events;
  const canvasWidth = element.offsetWidth;
  const canvasHeight = element.offsetHeight;
  const engine = Engine.create();
  engine.timing.timeScale = 1;

  const sceneObjects = [];

  const app = new PIXI.Application({
    backgroundAlpha: 0,
    resizeTo: element,
    width: canvasWidth,
    height: canvasWidth,
    antialias: true,
    resolution: 2,
    autoDensity: true,
  });

  let scale = 1.2;
  app.stage.scale.set(scale);

  element.appendChild(app.view);

  app.ticker.add(() => {
    sceneObjects.forEach((object) => {
      object.sprite.position = object.body.position;
      object.sprite.rotation = object.body.angle;
    });
  });

  Runner.run(engine);
  Events.on(engine, "collisionStart", collision);

  const ParticleRadius = 12;
  const PointRadius = 10;
  const MapGap = 3;
  let score = 10000;
  let scoreArray = [];
  const Points = [];
  let collisionNum = 0;
  let basket_list = [2.1, 1.2, 1.0, 0.8, 0.5, 0.8, 1.0, 1.2, 2.1];
  let percentage_list = [
    0.00390625, 0.03125, 0.109375, 0.21875, 0.2734375, 0.21875, 0.109375,
    0.03125, 0.00390625,
  ];
  let last = 0;
  let bet = 100;
  let currency = 1300;

  function Point(x, y, r, color = 0xd3d3d3) {
    const options = {
      isStatic: true,
    };

    const metter = Bodies.circle(x, y, 8, options);
    metter.label = "point";
    Composite.add(engine.world, metter);

    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.drawCircle(x, y, 8);
    graphics.zIndex = 2;
    graphics.endFill();
    app.stage.addChild(graphics);
    let Point = [x, y, 8];
    Points.push(Point);
  }

  function Particle(x, y, r, road) {
    const options = {
      restitution: 0,
      friction: 0,
      collisionFilter: {
        group: -1,
      },
    };

    const metter = Bodies.circle(x, y, r, options);
    metter.label = "particle";
    metter.road = {
      list: road,
      id: [],
    };
    Composite.add(engine.world, metter);
    let texture = PIXI.Texture.from("/ball.png?8");
    const sprite = new PIXI.Sprite(texture);
    sprite.width = ParticleRadius * 2;
    sprite.height = ParticleRadius * 2;
    sprite.pivot.set(ParticleRadius * 2, ParticleRadius * 2);
    app.stage.addChild(sprite);

    sceneObjects.push({
      body: metter,
      sprite: sprite,
    });
  }

  function Basket(x, y, gap, text) {
    const options = {
      isStatic: true,
    };

    const metter = Bodies.rectangle(x, y, gap, gap, options);
    metter.label = "basket";
    Composite.add(engine.world, metter);

    if (text === undefined) {
      return;
    }

    let color = colorPicker(text);

    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(color);

    const cornerRadius = (gap * 10) / 60;
    rectangle.drawRoundedRect(
      -gap / 2,
      -gap / 4,
      gap - 4,
      gap / 2,
      cornerRadius
    );
    rectangle.endFill();

    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 14,
      fill: "#ffffff",
      align: "center",
    });

    const label = new PIXI.Text(text + "x", style);
    label.anchor.set(0.5, 0.5);

    const container = new PIXI.Container();
    container.position.x = x;
    container.position.y = y;
    container.interactive = true;
    container.buttonMode = true;
    container.addChild(rectangle);
    container.addChild(label);

    const object = {
      body: metter,
      sprite: container,
    };

    sceneObjects.push(object);
    app.stage.addChild(container);
    container.on("mouseover", function (e) {
      let sum = 0;
      for (let i = 0; i < scoreArray.length; i++) {
        if (scoreArray[i] === text) {
          sum += (scoreArray[i] - 1) * bet;
        }
      }
      let percent = getPercentFromText(text);
      document.getElementById("profit").textContent =
        "$" + Math.round(sum * currency).toFixed(2);
      document.getElementById("bitProfit").value = Math.round(
        (text - 1) * bet
      ).toFixed(2);
      document.getElementById("chance").value = percent * 100;
      document.getElementById("overlay").style.display = "flex";
    });

    container.on("mouseout", function (e) {
      document.getElementById("overlay").style.display = "none";
    });

    metter.metter = {
      text: text,
      color: color,
      x: x,
      y: y,
      gap: gap,
    };

    // let startTime;
    // function update() {
    //   const time = Date.now() - startTime;
    //   const newY = y + Math.sin(time * 0.01) * 10;
    //   rectangle.clear();
    //   rectangle.beginFill(color);
    //   rectangle.drawRoundedRect(
    //     x + 2 - gap / 2,
    //     newY - gap / 4,
    //     rectangleWidth,
    //     rectangleHeight,
    //     cornerRadius
    //   );
    //   rectangle.endFill();
    //   pixiText.y = newY;
    //   requestAnimationFrame(update);
    // }

    // function stopAnimation() {
    //   rectangle.clear();
    //   rectangle.beginFill(color);
    //   rectangle.drawRoundedRect(
    //     x,
    //     y,
    //     rectangleWidth,
    //     rectangleHeight,
    //     cornerRadius
    //   );
    //   rectangle.endFill();
    //   pixiText.y = y;
    // }

    // function startAnimation(duration) {
    //   startTime = Date.now();
    //   requestAnimationFrame(update);
    //   setTimeout(stopAnimation, duration);
    // }
    // startAnimation(5000);
  }

  function ScoreBoard(x, y, gap, text) {
    const options = {
      isStatic: true,
    };

    const metter = Bodies.rectangle(x, y, gap, gap, options);
    metter.label = "scoreboard";
    Composite.add(engine.world, metter);

    if (text === undefined) {
      return;
    }

    let color = colorPicker(text);

    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(color);

    const cornerRadius = (gap * 10) / 120;
    const rectangleWidth = gap - 4;
    const rectangleHeight = gap / 2;

    rectangle.drawRoundedRect(
      x + 2 - gap / 2,
      y - gap / 4,
      rectangleWidth,
      rectangleHeight,
      cornerRadius
    );

    rectangle.endFill();

    const pixiText = new PIXI.Text(text + "x", {
      fontSize: (gap * 12) / 60 + "px",
      fill: "#ffffff",
    });

    pixiText.anchor.set(0.5);
    pixiText.x = x;
    pixiText.y = y;

    app.stage.addChild(rectangle);
    app.stage.addChild(pixiText);
    metter.metter = {
      text: text,
      color: color,
      x: x,
      y: y,
      gap: gap,
    };
  }

  function RemoveParticle(body) {
    for (let i = 0; i < sceneObjects.length; i++) {
      if (sceneObjects[i].body.id === body.id) {
        Composite.remove(engine.world, sceneObjects[i].body);
        app.stage.removeChild(sceneObjects[i].sprite);
        sceneObjects.splice(i, 1);
      }
    }
  }

  function updateScore(body) {
    const text = body.metter.text;
    score += (text - 1) * 100;
    scoreArray.push(text);

    const startIndex = Math.max(scoreArray.length - 4, 0);
    const lastFourScores = scoreArray.slice(startIndex);

    for (let i = 0; i < lastFourScores.length; i++) {
      ScoreBoard(
        canvasWidth - 40,
        (canvasHeight / 2 + 30 * (i - 2)) / scale,
        50,
        lastFourScores[i]
      );
    }
  }

  function Splash(body) {
    const graphics = new PIXI.Graphics();

    var reqAnim;
    var breathSpeed = 2;
    var rMax = 15;
    var rMin = 0;
    var r = rMin;
    var opacity = 0.7;
    var rDiff = rMax - rMin;
    var opacityIncr = 1 / rDiff / 1.2;

    animate();
    function animate() {
      graphics.clear();
      if (
        localStorage.getItem("style") &&
        localStorage.getItem("style") == "light"
      ) {
        graphics.lineStyle(r, 0xb2de27, opacity);
      } else {
        graphics.lineStyle(r, 0xffffff, opacity);
      }
      graphics.lineStyle(r, 0xb2de27, opacity);
      graphics.beginFill(0, 0);
      graphics.drawCircle(
        body.position.x,
        body.position.y,
        body.circleRadius * 2
      );
      graphics.endFill();

      app.stage.addChild(graphics);
      if (r === rMax) {
        cancelAnimationFrame(reqAnim);
        reqAnim = undefined;
        return;
      }
      r += breathSpeed;
      opacity -= opacityIncr;
      reqAnim = requestAnimationFrame(animate);
    }

    setTimeout(() => {
      app.stage.removeChild(graphics);
    }, 400);
  }

  function BasketSplash(body) {
    const graphics = new PIXI.Graphics();

    var reqAnim;
    var breathSpeed = 1;
    var rMax = 15;
    var rMin = 0;
    var r = rMin;
    var opacity = 0.7;
    var rDiff = rMax - rMin;
    var opacityIncr = 1 / rDiff / 1.2;

    animate();

    function animate() {
      graphics.clear();
      if (
        localStorage.getItem("style") &&
        localStorage.getItem("style") == "light"
      ) {
        graphics.lineStyle(r, body.metter.color, opacity);
      } else {
        graphics.lineStyle(r, body.metter.color, opacity);
      }
      graphics.beginFill(0, 0);

      const rectWidth = 60;
      const rectHeight = 40;
      const rectX = body.position.x - rectWidth / 2;
      const rectY = body.position.y - rectHeight / 2;
      graphics.drawRoundedRect(rectX, rectY, rectWidth, rectHeight, 10);

      graphics.endFill();

      app.stage.addChild(graphics);
      if (r === rMax) {
        cancelAnimationFrame(reqAnim);
        reqAnim = undefined;
        return;
      }
      r += breathSpeed;
      opacity -= opacityIncr;
      reqAnim = requestAnimationFrame(animate);
    }

    setTimeout(() => {
      app.stage.removeChild(graphics);
    }, 400);
  }

  function getIndexFromCoordinate(row, col) {
    return (row * (row - 1)) / 2 + (row - 1) * 2 + col;
  }

  function colorPicker(text) {
    let color = 0x05121c;
    switch (parseFloat(text)) {
      case 10:
      case parseFloat(Math.pow(10, 1.4).toFixed(2)):
      case parseFloat(Math.pow(10, 2).toFixed(2)):
        color = 0xfa223e;
        break;
      case 7.2:
      case parseFloat(Math.pow(7.2, 1.4).toFixed(2)):
      case parseFloat(Math.pow(7.2, 2).toFixed(2)):
        color = 0xfa223e;
        break;
      case 5.6:
      case parseFloat(Math.pow(5.6, 1.4).toFixed(2)):
      case parseFloat(Math.pow(5.6, 2).toFixed(2)):
        color = 0xfa223e;
        break;
      case 3.6:
      case parseFloat(Math.pow(3.6, 1.4).toFixed(2)):
      case parseFloat(Math.pow(3.6, 2).toFixed(2)):
        color = 0xfa302f;
        break;
      case 2.1:
      case parseFloat(Math.pow(2.1, 1.4).toFixed(2)):
      case parseFloat(Math.pow(2.1, 2).toFixed(2)):
        color = 0xfa5224;
        break;
      case 1.2:
      case parseFloat(Math.pow(1.2, 1.4).toFixed(2)):
      case parseFloat(Math.pow(1.2, 2).toFixed(2)):
        color = 0xfa681e;
        break;
      case 1:
        color = 0xfa8c10;
        break;
      case 0.8:
      case parseFloat(Math.pow(0.8, 1.4).toFixed(2)):
      case parseFloat(Math.pow(0.8, 2).toFixed(2)):
        color = 0xfaa00c;
        break;
      case 0.5:
      case parseFloat(Math.pow(0.5, 1.4).toFixed(2)):
      case parseFloat(Math.pow(0.5, 2).toFixed(2)):
        color = 0xfac000;
        break;
      default:
        color = 0xfac000;
    }
    return color;
  }

  function getPercentFromText(text) {
    let id = 0;
    for (let i = 0; i < basket_list.length; i++) {
      if (basket_list[i] === text) {
        id = i;
      }
    }
    return percentage_list[id];
  }

  function searchRoute(rowNum, target) {
    let selfPos = 0;
    const result = [];
    const dirResult = [];
    let gapLeft = target - 1;
    let gapRight = rowNum + 1 - target;
    let currentIndex = getIndexFromCoordinate(rowNum, target);
    for (let i = rowNum; i > 0; i--) {
      let flag = gapLeft > 0 ? (Math.random() > 0.5 ? 0 : 1) : 1;
      if (gapRight === 0) {
        flag = 0;
      }
      if (flag === 0) {
        last = Math.random() < 0.2 ? 6 : Math.random() < 0.4 ? 1 : 3;
        if (last === 6) {
          selfPos = 3;
        }
        gapLeft--;
      }
      if (flag === 1) {
        last = Math.random() < 0.2 ? 6 : Math.random() < 0.4 ? 0 : 2;
        if (last === 6) {
          selfPos = 2;
        }
        gapRight--;
      }
      currentIndex += flag;
      result.push(currentIndex);
      if (last === 1 || last === 0) {
        dirResult.push(last, last + 4);
      } else if (last === 6) {
        dirResult.push(last, selfPos);
      } else {
        dirResult.push(last);
      }
      currentIndex -= i + 2;
    }
    return [result, dirResult];
  }

  function collision(event) {
    const pairs = event.pairs;
    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;
      if (bodyA.label === "point") new Splash(bodyA);
      if (bodyB.label === "point") new Splash(bodyB);
      if (bodyA.label === "particle" && bodyB.label === "point") {
        Road(bodyA, bodyB);
      }
      if (bodyB.label === "particle" && bodyA.label === "point") {
        Road(bodyB, bodyA);
      }
      if (bodyA.label === "basket" && bodyB.label === "particle") {
        RemoveParticle(bodyB);
        new BasketSplash(bodyA);
        updateScore(bodyA);
      }
      if (bodyB.label === "basket" && bodyA.label === "particle") {
        RemoveParticle(bodyA);
        new BasketSplash(bodyB);
        updateScore(bodyB);
      }
    }
  }

  function Road(body, point) {
    Body.setStatic(body, true);
    if (!body.road.id.includes(point.id)) {
      const road = body.road.list.shift();
      collisionNum++;
      if (road === 0) {
        setTimeout(() => {
          Body.setVelocity(body, {
            x: -3.2,
            y: -1.6 + Math.random(),
          });
        }, 0);
        engine.timing.timeScale = 1.2;
      } else if (road === 1) {
        setTimeout(() => {
          Body.setVelocity(body, {
            x: 3.2,
            y: -1.6 + Math.random(),
          });
        }, 0);
        engine.timing.timeScale = 1.2;
      } else if (road === 2) {
        Body.setPosition(body, {
          x: point.position.x,
          y: point.position.y - point.circleRadius * 2,
        });
        setTimeout(() => {
          Body.setVelocity(body, {
            x: -1,
            y: -3.2,
          });
        }, 0);
        engine.timing.timeScale = 1.5;
      } else if (road === 3) {
        Body.setPosition(body, {
          x: point.position.x,
          y: point.position.y - point.circleRadius * 2,
        });
        setTimeout(() => {
          Body.setVelocity(body, {
            x: 1,
            y: -3.2,
          });
        }, 0);
        engine.timing.timeScale = 1.5;
      } else if (road === 4) {
        setTimeout(() => {
          Body.setVelocity(body, {
            x: 0.7,
            y: 0,
          });
        }, 0);
        engine.timing.timeScale = 1.5;
      } else if (road === 5) {
        setTimeout(() => {
          Body.setVelocity(body, {
            x: -0.7,
            y: 0,
          });
        }, 0);
        engine.timing.timeScale = 1.5;
      } else {
        Body.setPosition(body, {
          x: point.position.x,
          y: point.position.y - point.circleRadius * 2,
        });
        setTimeout(() => {
          Body.setVelocity(body, {
            x: 0,
            y: -3.5,
          });
        }, 0);
        engine.timing.timeScale = 1.5;
      }
      body.road.id.push(point.id);
    } else {
      setTimeout(() => {
        Body.setVelocity(body, {
          x: Math.random() < 0.5 ? -1 : 1,
          y: -3.5,
        });
      }, 0);
    }
    Body.setStatic(body, false);
  }

  function map(rows, percentage) {
    app.stage.position._x = 0;
    let col = 3;
    const increment = 1;
    const radius = PointRadius;
    const gap = PointRadius * 2 * MapGap;

    for (let i = 1; i <= rows.length; i++) {
      const space = (canvasWidth - gap * col) / 2;
      for (let j = 1; j <= col; j++) {
        if (i < rows.length) {
          new Point(space + j * gap - radius * MapGap, i * gap, radius);
        } else {
          if (j > 1) {
            new Basket(
              space + j * gap - radius * MapGap,
              i * gap,
              gap,
              rows[j - 2]
            );
          }
        }
      }
      col += increment;
    }
    scale = 9 / rows.length;
    app.stage.scale.set(scale);
    app.stage.position._x += ((1 - scale) * canvasWidth) / 2;
    if (percentage === undefined) {
      return;
    }
    percentage_list = percentage;
    basket_list = rows;
  }

  function add(rowNum, target) {
    // let col = 3;
    // const increment = 1;
    // const radius = PointRadius;
    // const gap = PointRadius * 2 * MapGap;
    // for (let i = 1; i <= rowNum; i++) {
    //   const space = (canvasWidth - gap * col) / 2;
    //   for (let j = 1; j <= col; j++) {
    //     if (i <= rowNum) {
    //       const index = getIndexFromCoordinate(i, j);
    //       // console.log("getIndex", i, j, index);
    //       if (routes.indexOf(index) >= 0) {
    //         new Point(
    //           space + j * gap - radius * MapGap,
    //           i * gap,
    //           radius,
    //           0xff0000
    //         );
    //       } else {
    //         new Point(space + j * gap - radius * MapGap, i * gap, radius);
    //       }
    //     }
    //   }
    //   col += increment;
    // }
    let [routes, dirRoute] = searchRoute(rowNum, target);
    new Particle(canvasWidth / 2, 0, ParticleRadius, dirRoute);
  }

  function clear() {
    Composite.clear(engine.world);
    app.stage.removeChildren();
  }

  return {
    map,
    add,
    clear,
  };
}
