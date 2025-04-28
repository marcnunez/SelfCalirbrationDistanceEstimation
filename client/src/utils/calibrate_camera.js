import { getLandmarkDepth } from './utils';

class CameraCalibration {
  constructor(frame, imageSize, distanceToEye, webcamModels) {
    /**
     * @param {Array} frame - Frame from snapshot taken with blind spot or arm length solution.
     * @param {number} distanceToEye - Distance from camera to eye at the moment of the snapshot.
     */
    this.frame = frame;
    this.imageSize = imageSize;
    this.distanceToEye = distanceToEye;
    this.webcamModels = webcamModels;
    this.focalLength = null;
    this.distancePartRatios = null;
  }

  async cameraCalibration() {
    /**
     * Main pipeline that extracts both focal length and each of the distances from landmark references specified.
     * @returns {CameraCalibration | null} - Camera Calibration Object if landmarks are detected.
     */
    const resultsFaceMesh = await this.webcamModels.faceMesh.detect(this.frame);
    const multiFaceLandmarks = resultsFaceMesh.faceLandmarks;

    const resultsPoseLandmarks = await this.webcamModels.poseEstimation.detect(this.frame);
    const multiPoseLandmarks = resultsPoseLandmarks.landmarks;

    if (multiFaceLandmarks && multiFaceLandmarks.length > 0 && multiPoseLandmarks && multiPoseLandmarks.length > 0) {
      const faceLandmarks = multiFaceLandmarks[0].map(lm => [lm.x, lm.y, lm.z]);
      const poseLandmarks = multiPoseLandmarks[0].map(lm => [lm.x, lm.y, lm.z]);

      // Compute iris size
      const irisSize = this._eyeLandmarksToIrisSize(
        [faceLandmarks[this.webcamModels.irisLandmarksLeft[0]], faceLandmarks[this.webcamModels.irisLandmarksLeft[1]]],
        [faceLandmarks[this.webcamModels.irisLandmarksRight[0]], faceLandmarks[this.webcamModels.irisLandmarksRight[1]]]
      );
      console.log(multiPoseLandmarks)
      console.log(multiFaceLandmarks)
      this.distancePartRatios = {
        both: this._setDistancePartsRatios(poseLandmarks, this.webcamModels.poseLandmarksIndexes['both'], irisSize),
        left: this._setDistancePartsRatios(poseLandmarks, this.webcamModels.poseLandmarksIndexes['left'], irisSize),
        right: this._setDistancePartsRatios(poseLandmarks, this.webcamModels.poseLandmarksIndexes['right'], irisSize)
      };
      this._estimateFocalLength(irisSize);
      return this;
    }
    return null;
  }

  _setDistancePartsRatios(faceLandmarks, landmarks, irisSize) {
    return landmarks.map(([firstIndex, secondIndex]) =>
      getLandmarkDepth(faceLandmarks[firstIndex], faceLandmarks[secondIndex], this.imageSize) / irisSize
    );
  }

  _eyeLandmarksToIrisSize(eyeLandmarksLeft, eyeLandmarksRight) {
    const irisSizeLeft = getLandmarkDepth(eyeLandmarksLeft[0], eyeLandmarksLeft[1], this.imageSize);
    const irisSizeRight = getLandmarkDepth(eyeLandmarksRight[0], eyeLandmarksRight[1], this.imageSize);
    return (irisSizeLeft + irisSizeRight) / 2;
  }

  _estimateFocalLength(diameterIrisPx) {
    /**
     * Calculate focal length using the formula:
     * focal_length = (size in px * distance in mm) / size in mm
     */
    this.focalLength = (diameterIrisPx * this.distanceToEye) / this.webcamModels.humanIrisSizeInMm;
  }
}

export default CameraCalibration;
