// Define global variables
let handpose;
let video;
let predictions = [];
let canvas2;
let pointerX, pointerY; // Position of the index fingertip (index 8)
let knuckle, ring; // Positions of ring finger knuckle and the its tip
let blueBalls = []; // Array to hold blue balls (bullets)
let redRect; // The red rectangle (enemy)
let hitCount = 0; // Number counting for the number of hittings
let shootCooldown = 0; // "Cooldown" for shooting blue balls


// A function to draw keypoints and UFO (on index finger tip)
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];

    // Loop through all the keypoints on hand
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      // Draw an ellipse and number of index for each keypoint
      fill(173, 216, 230);
      noStroke();
      const x = keypoint[0];
      const y = keypoint[1];
      ellipse(x, y, 10);
      fill(255);
      textSize(10);
      text(j, x + 4, y);
      
      // Draw the UFO at the position of index 8
      if (j === 8) {
        pointerX = keypoint[0];
        pointerY = keypoint[1];
        drawUFO(pointerX, pointerY); // Draw UFO using the custom function
      }
      //key function: detecting bending finger:
      //compare knuckle and ring finger tip positions
      if (j === 14) {//check and record y position of the index if it is index 14 (knuckle of ring finger)
        knuckle = keypoint[1];
      } else if (j === 16) {//check and record y position of the index if it is index 16 (tip of ring finger)
        ring = keypoint[1];
      }
    }

    // If the ring finger tip is lower than the knuckle, meaning that the user is holding a fist (somehow a fist?) and when cool down is ready, then shoot!
    if (knuckle < ring && shootCooldown === 0) {
      blueBalls.push({ x: pointerX, y: pointerY, vx: 10 }); // Add a new blue ball shoot out from index finger tip
      shootCooldown = 30; // Reset cooldown to 30 frames after shooting
    }
  }
}

// Function to draw the blue balls
function drawBlueBalls() {
  for (let i = blueBalls.length - 1; i >= 0; i--) {
    const ball = blueBalls[i];
    // Move the ball based on the velocity
    ball.x += ball.vx; 
    // Draw the ball
    fill(0, 0, 255);
    ellipse(ball.x, ball.y, 10);
    
    // Collision detection of bullet and red rectangle
    if (ball.x > redRect.x && ball.x < redRect.x + redRect.w &&
        ball.y > redRect.y && ball.y < redRect.y + redRect.h) {
      blueBalls.splice(i, 1); // Remove the blue ball if collision
      redRect = createRedRect(); // Create a new red rectangle
      hitCount++; // Increment the hit count
      continue; //I did some research to learn this, this means that if this happen the following code would be skip and we are return to next iteration
    }
    
    // Remove the ball if it goes off-screen
    if (ball.x > width || ball.y > height || ball.y < 0) {
      blueBalls.splice(i, 1);
    }
  }
}

// Function to draw the red rectangle
function drawRedRect() {
  fill(255, 0, 0);
  rect(redRect.x, redRect.y, redRect.w, redRect.h);
}

// Function to display the hit count number
function displayHitCount() {
  push(); // Save the current drawing state
  fill(255);
  textSize(32);
  // Flip the text horizontally
  scale(-1.0, 1.0);
  text(`Hits: ${hitCount}`, -width + 150, 50);
  pop();
}

// Function to create new red rectangle object
function createRedRect() {
  // random but with restristions
  let rectX = random(width / 2 + 40, width - 40);
  let rectY = random(40, height - 80);
  let rectW = random(20, 60);
  let rectH = random(20, 60);

  return { x: rectX, y: rectY, w: rectW, h: rectH };
}

// Custom function to draw the UFO at the given position (x, y)
function drawUFO(x, y) {
  fill(173, 216, 230);
  ellipse(x, y, 30);
  fill(128, 128, 128);
  ellipse(x, y, 40, 10);
  fill(173, 216, 230);
  for (let offset of [-10, 0, 10]) {
    ellipse(x + offset, y, 7);
  }
}



function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Initializing the handpose model here
  handpose = ml5.handpose(video, modelReady);
  // This will track the predictions from the handpose model, this system is borrowed from the ml5 website. When the "predict" event occurs, the provided callback function is called.
  handpose.on('predict', function (results) {
    predictions = results;//assigns the tracking results to the global predictions
  });
  redRect = createRedRect(); // Initialize the red rectangle object
}

// Function to be called when the handpose model is loaded
function modelReady() {
  console.log('Model ready!');
}

function draw() {
  translate(width, 0); // Flip x-axis to act as a mirror
  scale(-1.0, 1.0);
  image(video, 0, 0, width, height); // Draw the video
  drawKeypoints(); // Function to draw keypoints of hand
  drawBlueBalls(); // Function to draw blue balls
  drawRedRect(); // Function to draw the red rectangle
  displayHitCount(); // Function to display the hit count number

  // Decrease the bullet cooldown if it's greater than 0
  if (shootCooldown > 0) {
    shootCooldown--;
  }
}
