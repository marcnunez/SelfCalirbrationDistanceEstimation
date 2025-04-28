/**
 * Calculate Euclidean distance between two points.
 * @param {number} x0 - X coordinate of the first point.
 * @param {number} y0 - Y coordinate of the first point.
 * @param {number} x1 - X coordinate of the second point.
 * @param {number} y1 - Y coordinate of the second point.
 * @returns {number} - Euclidean distance between the points.
 */
export function euclideanDistance(x0, y0, x1, y1) {
  return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
}

/**
 * Calculate landmark depth based on image size.
 * @param {Array} ld0 - First landmark [x, y].
 * @param {Array} ld1 - Second landmark [x, y].
 * @param {Array} imageSize - [width, height] of the image.
 * @returns {number} - Depth based on Euclidean distance.
 */
export function getLandmarkDepth(ld0, ld1, imageSize) {

  return euclideanDistance(
    ld0[0] * imageSize[0],
    ld0[1] * imageSize[1],
    ld1[0] * imageSize[0],
    ld1[1] * imageSize[1]
  );
}

/**
 * Preprocess an image frame by converting it to RGB and flipping it.
 * @param {cv2.Mat} video - Input image frame.
 * @param inputSize
 */
export function preprocessImage(video, inputSize) {
    const size = Math.round((1.0 / 0.96) * inputSize);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(video, 0, 0, size, size);

    const start = Math.floor((size - inputSize) / 2);
    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCanvas.width = inputSize;
    croppedCanvas.height = inputSize;

    croppedCtx.drawImage(canvas, start, start, inputSize, inputSize, 0, 0, inputSize, inputSize);
    const imageData = croppedCtx.getImageData(0, 0, inputSize, inputSize);
    const data = imageData.data;

    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    const float32Data = new Float32Array(inputSize * inputSize * 3);

    for (let i = 0; i < inputSize * inputSize; i++) {
      let r = data[i * 4] / 255.0;
      let g = data[i * 4 + 1] / 255.0;
      let b = data[i * 4 + 2] / 255.0;

      float32Data[i] = (r - mean[0]) / std[0];
      float32Data[i + inputSize * inputSize] = (g - mean[1]) / std[1];
      float32Data[i + 2 * inputSize * inputSize] = (b - mean[2]) / std[2];
    }

    return float32Data;
}
