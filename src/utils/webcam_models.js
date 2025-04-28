import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import ort from "onnxruntime-web";

const { FaceLandmarker, FilesetResolver, PoseLandmarker } = vision;

class WebcamModels {
  constructor() {

    this.irisLandmarksRight = [471, 469];
    this.irisLandmarksLeft = [476, 474];

    const left_ear = 7
    const right_ear = 8
    const right_lip = 10
    const left_lip = 9
    const right_eye = 5
    const left_eye = 2
    const nose = 0


    this.poseLandmarksIndexes = {
      both: [
        [left_ear, right_ear], [left_ear, left_lip], [right_ear, right_lip],
        [left_ear, nose], [right_ear, nose], [left_eye, right_eye],
        [left_eye, nose], [right_eye, nose]
      ],
      left: [
        [left_ear, left_lip],
        [left_ear, nose],
        [left_eye, nose],
      ],
      right: [
        [right_ear, right_lip],
        [right_ear, nose],
        [right_eye, nose]
      ]
    };

    this.armLenghtRatio = 2.5307;
    this.humanIrisSizeInMm = 11.8;
    this.faceMesh = null;
    this.poseEstimation = null;
    this.glassesDetectorModel = null;
  }

  async initModels(pathGlassesDetector="/models/glasses_detector_mobilenetv4_small.onnx") {
    const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
    this.faceMesh = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        delegate: "CPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "IMAGE",
      numFaces: 1
    });
    this.poseEstimation = await PoseLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
        delegate: "CPU"
      },
      runningMode: "IMAGE",
      numPoses: 1
    });
    this.glassesDetectorModel = await ort.InferenceSession.create(pathGlassesDetector, {
      executionProviders: ["wasm"] });

  }
}

export default WebcamModels;
