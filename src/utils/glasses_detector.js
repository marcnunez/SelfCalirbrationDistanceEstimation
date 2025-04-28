import * as ort from 'onnxruntime-web';
import { preprocessImage } from "./utils.js";

class GlassesDetector {
  constructor(webcamModels) {
    this.model = webcamModels.glassesDetectorModel;
  }

  async cropFace(video, landmarks, croppedCanvas) {
    /**
     * Crops the face from the video frame based on detected landmarks.
     * @param {HTMLVideoElement} video - The video element.
     * @param {Array} landmarks - Facial landmarks.
     * @param {HTMLCanvasElement} croppedCanvas - The canvas where the cropped face is drawn.
     * @returns {Promise<string>} - The glasses detection result.
     */

    const cropSize = 60
    const ctx = croppedCanvas.getContext("2d");

    const xMin = Math.min(...landmarks.map(p => p.x)) * video.videoWidth;
    const yMin = Math.min(...landmarks.map(p => p.y)) * video.videoHeight;
    const xMax = Math.max(...landmarks.map(p => p.x)) * video.videoWidth;
    const yMax = Math.max(...landmarks.map(p => p.y)) * video.videoHeight;

    const width = xMax - xMin;
    const height = yMax - yMin;

    ctx.clearRect(0, 0, cropSize, cropSize);
    ctx.drawImage(video, xMin, yMin, width, height, 0, 0, cropSize, cropSize);
    return this.detectGlasses(croppedCanvas, cropSize);
  }

  async detectGlasses(croppedCanvas, cropSize) {
    /**
     * Detects whether the person in the cropped image is wearing glasses.
     * @param {HTMLCanvasElement} croppedCanvas - The cropped face canvas.
     * @returns {Promise<string>} - The glasses detection result.
     */
    if (!this.model) {
      console.error("Glasses detection model not loaded.");
      return "Error: Model not loaded";
    }

    const floatArray = preprocessImage(croppedCanvas, cropSize);
    const inputTensor = new ort.Tensor("float32", floatArray, [1, 3, cropSize, cropSize]);

    try {
      const feeds = { [this.model.inputNames[0]]: inputTensor };
      let output = await this.model.run(feeds);
      output = output[this.model.outputNames[0]].data;

      const maxIndex = this.argsortDescending(output)[0];
      return maxIndex === 0 ? "Glasses Detected" : "No Glasses";
    } catch (error) {
      console.error("ONNX inference error:", error);
      return "Error in detection";
    }
  }

  argsortDescending(output) {
    /**
     * Sorts the model output in descending order and returns the indices.
     * @param {Float32Array} output - The ONNX model output.
     * @returns {Array} - Indices sorted by highest confidence.
     */
    return Array.from(output)
      .map((val, idx) => [val, idx])
      .sort((a, b) => b[0] - a[0])
      .map(pair => pair[1]);
  }
}

export default GlassesDetector;