import { getLandmarkDepth, euclideanDistance } from './utils';

class DistanceEstimation {
  constructor(calibrationData, webcamModels) {
    this.calibrationData = calibrationData;
    this.webcamModels = webcamModels;
  }

  async estimateDistance(frame, imageSize, sideFace= "both") {
    /**
     * Estimates the distance from the camera lens to the irises based on detected facial landmarks.
     * @param {Array} frame - The image frame to estimate distance from.
     * @param {Array} imageSize - The size of the current frame.
     * @returns {number | null} - Estimated distance from the camera.
     */
    const resultPose = await this.webcamModels.poseEstimation.detect(frame);
    const multiPoseLandmarks = resultPose.landmarks;

    if (!multiPoseLandmarks || multiPoseLandmarks.length === 0) {
      return ["No person in the scene", null];
    }

    const poseLandmarks = multiPoseLandmarks[0].map(lm => [lm.x, lm.y, lm.z]);
    const depthToPart = [];
    const landmarks = this.webcamModels.poseLandmarksIndexes[sideFace];

    for (let i = 0; i < this.calibrationData.distancePartRatios[sideFace].length; i++) {
      const [firstIndex, secondIndex] = landmarks[i];
      const distanceToPartsRatio =
        getLandmarkDepth(poseLandmarks[firstIndex], poseLandmarks[secondIndex], imageSize) /
        this.calibrationData.distancePartRatios[sideFace][i];
      depthToPart.push(
        this.calculateDepth(imageSize, poseLandmarks[firstIndex], distanceToPartsRatio) / 10
      );
    }
    return [Math.round(depthToPart.reduce((sum, val) => sum + val, 0) / depthToPart.length), multiPoseLandmarks[0]];
  }

  calculateDepth(imageSize, centerLandmark, landmarksDistance) {
    /**
     * Calculates depth from the camera lens to a landmark using trigonometry.
     * @param {Array} imageSize - The frame size.
     * @param {Array} centerLandmark - The landmark coordinates.
     * @param {number} landmarksDistance - The distance factor.
     * @returns {number} - The calculated depth in mm.
     */
    const origin = imageSize.map(size => size / 2);
    const centerLandmarkPixel = centerLandmark.slice(0, 2).map((val, idx) => val * imageSize[idx]);
    const y = euclideanDistance(origin[0], origin[1], centerLandmarkPixel[0], centerLandmarkPixel[1]);
    const x = Math.sqrt(Math.pow(this.calibrationData.focalLength, 2) + Math.pow(y, 2));
    return (this.webcamModels.humanIrisSizeInMm * x) / landmarksDistance;
  }
}

export default DistanceEstimation;
