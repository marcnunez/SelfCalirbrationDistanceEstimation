<template>
  <div class="container">
    <h1>Distance & Glasses Detection</h1>

    <div class="video-container">
      <div class="video-wrapper">
        <video ref="video" autoplay playsinline></video>
        <!--<canvas ref="canvas"></canvas>-->
      </div>
    <!--
      <div class="cropped-face-container">
        <h3>Face Crop</h3>
        <canvas ref="croppedCanvas"></canvas>
        <div class="label">{{ glassesDetected }}</div>
      </div>
      -->
    </div>

    <div class="controls">
      <button @click="enableCam" class="btn-primary">
        {{ webcamRunning ? 'Stop Webcam' : 'Start Webcam' }}
      </button>

      <input type="number" v-model="userHeight" placeholder="Enter your height (cm)" class="input-field" />

      <label for="sideFace">Choose Side:</label>
      <select v-model="sideFace" class="dropdown">
        <option value="both">Both</option>
        <option value="right">Right</option>
        <option value="left">Left</option>
      </select>

      <button @click="calibrateCamera" :disabled="!webcamRunning" class="btn-secondary">
        Calibrate
      </button>

      <p v-if="distance" class="distance-display">Estimated Distance: <strong>{{ distance }} cm</strong></p>
    </div>
  </div>
</template>

<script>
import CameraCalibration from "../utils/calibrate_camera.js";
import DistanceEstimation from "../utils/distance_estimation.js";
import WebcamModels from "../utils/webcam_models.js";
import GlassesDetector from "../utils/glasses_detector.js";

export default {
  data() {
    return {
      webcamModels: null,
      glassesDetector: null,
      webcamRunning: false,
      videoStream: null,
      isLoaded: false,
      isCalibrated: false,
      userHeight: null,
      cameraCalibration: null,
      distanceEstimator: null,
      distance: null,
      sideFace: "both", // Default selection
      glassesDetected: "Starting Webcam...",
      landmarks: null,
    };
  },
  async mounted() {
    this.webcamModels = new WebcamModels();
    await this.webcamModels.initModels();
    this.glassesDetector = new GlassesDetector(this.webcamModels)
    this.isLoaded = true;
    console.log("WebcamModels loaded!", this.webcamModels);
  },
  beforeUnmount() {
    this.stopWebcam();
  },
  methods: {
    enableCam() {
      this.webcamRunning = !this.webcamRunning;
      if (this.webcamRunning) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          this.$refs.video.srcObject = stream;
          this.videoStream = stream;
        });
      } else {
        this.stopWebcam();
      }
    },
    stopWebcam() {
      if (this.videoStream) {
        this.videoStream.getTracks().forEach(track => track.stop());
      }
      this.isCalibrated = false;
    },
    async calibrateCamera() {
      if (!this.webcamRunning || !this.userHeight) return;

      const video = this.$refs.video;
      const frame = this.captureFrame(video);
      const imageSize = [video.videoWidth, video.videoHeight];
      const distanceToEye = this.userHeight * this.webcamModels.armLenghtRatio;

      this.cameraCalibration = new CameraCalibration(frame, imageSize, distanceToEye, this.webcamModels);
      await this.cameraCalibration.cameraCalibration();

      this.distanceEstimator = new DistanceEstimation(this.cameraCalibration, this.webcamModels);
      this.isCalibrated = true;
      await this.processFrame();
    },
    async processFrame() {
      if (!this.webcamRunning || !this.isCalibrated || !this.distanceEstimator) return;

      const video = this.$refs.video;
      const frame = this.captureFrame(video);
      const imageSize = [video.videoWidth, video.videoHeight];

      [this.distance, this.landmarks] = await this.distanceEstimator.estimateDistance(frame, imageSize, this.sideFace);
      console.log(this.landmarks)
      if (this.landmarks) {
        //this.glassesDetected = await this.glassesDetector.cropFace(video, this.landmarks, this.$refs.croppedCanvas);
        //this.glassesDetected = await this.glassesDetector.cropFace(video, this.landmarks, this.$refs.croppedCanvas);
      } else {
        this.glassesDetected = "No person detected";
      }

      requestAnimationFrame(this.processFrame);
    },
    captureFrame(video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    },
  },
};
</script>

<style scoped>
/* Main container */
.container {
  max-width: 800px;
  margin: auto;
  text-align: center;
  font-family: Arial, sans-serif;
}

/* Video container */
.video-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

/* Video & Canvas Styling */
.video-wrapper {
  position: relative;
}
video, canvas {
  width: 640px;
  height: 480px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

/* Face Crop Section */
.cropped-face-container {
  text-align: center;
  background: #f8f8f8;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.label {
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
}

/* Buttons & Inputs */
.controls {
  margin-top: 20px;
}
button {
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}
.btn-primary {
  background: #007bff;
  color: white;
}
.btn-primary:hover {
  background: #0056b3;
}
.btn-secondary {
  background: #28a745;
  color: white;
}
.btn-secondary:hover {
  background: #1e7e34;
}

/* Input field */
.input-field {
  padding: 8px;
  width: 250px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
}

/* Dropdown */
.dropdown {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
}

/* Distance display */
.distance-display {
  font-size: 50px;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
}
</style>
