import os
import io
import time
import math
import random
import logging
from typing import List, Dict, Any, Tuple
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger("AutoPulse.AI")

# Try to import cv2 if available
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.info("OpenCV not yet loaded or running in pure-Python/Pillow mode")

# Try to import ultralytics YOLO if installed
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

class RoadSceneDetector:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        self.init_model()

    def init_model(self):
        """Attempt to load YOLOv8 nano model if available."""
        if YOLO_AVAILABLE:
            try:
                # Load lightweight YOLOv8n
                self.model = YOLO("yolov8n.pt")
                self.model_loaded = True
                logger.info("YOLOv8n model initialized successfully")
            except Exception as e:
                logger.warning(f"Could not load YOLOv8 model weights: {e}. Fallback enabled.")
                self.model_loaded = False

    def analyze_image_bytes(
        self, 
        image_bytes: bytes, 
        confidence_threshold: float = 0.5
    ) -> Dict[str, Any]:
        """
        Analyze an uploaded frame or webcam snapshot.
        Returns detected objects, bounding boxes, labels, and road anomaly assessment.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            width, height = image.size
        except Exception as e:
            return {
                "error": f"Failed to parse image: {e}",
                "objects_detected": 0,
                "detections": [],
                "warning_level": "Safe",
                "summary": "Invalid image payload"
            }

        detections: List[Dict[str, Any]] = []
        is_simulated = True

        # If YOLOv8 is available and model loaded, run real inference
        if self.model_loaded and self.model is not None:
            try:
                results = self.model(image, conf=confidence_threshold)
                is_simulated = False
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        coords = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                        conf = float(box.conf[0])
                        cls_id = int(box.cls[0])
                        class_name = self.model.names[cls_id]
                        
                        # Determine if object represents road context or obstacle
                        hazard_type = None
                        severity = "low"
                        if class_name in ["car", "truck", "bus", "motorcycle"]:
                            severity = "low"
                        elif class_name in ["person", "bicycle", "dog"]:
                            severity = "high"
                            hazard_type = "pedestrian_or_animal"
                        elif class_name in ["stop sign", "traffic light"]:
                            severity = "medium"
                        
                        detections.append({
                            "label": f"{class_name.capitalize()}",
                            "confidence": round(conf, 2),
                            "box": [round(c, 1) for c in coords],
                            "hazard_type": hazard_type,
                            "severity": severity,
                            "is_ai_detected": True
                        })
            except Exception as e:
                logger.error(f"YOLO inference failed: {e}")
                is_simulated = True

        # If YOLO wasn't run or in demo mode, generate realistic road scene detections
        if not detections:
            is_simulated = True
            detections = self.generate_simulated_road_detections(width, height, confidence_threshold)

        # Assess overall warning level
        warning_level = "Safe"
        has_critical = any(d.get("severity") == "critical" or d.get("hazard_type") in ["pothole", "accident", "debris"] for d in detections)
        has_warning = any(d.get("severity") in ["medium", "high"] for d in detections)
        
        if has_critical:
            warning_level = "Hazard Detected"
        elif has_warning:
            warning_level = "Caution"

        summary = f"Identified {len(detections)} road entity/hazard object(s). System status: {warning_level}."

        return {
            "frame_id": f"FRM-{int(time.time() * 1000)}",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "width": width,
            "height": height,
            "objects_detected": len(detections),
            "detections": detections,
            "warning_level": warning_level,
            "summary": summary,
            "is_simulated": is_simulated,
            "disclaimer": "Simulated road hazard analysis active (supports standard vehicle objects and simulated pothole detection)" if is_simulated else "Live YOLO inference active"
        }

    def generate_simulated_road_detections(self, width: int, height: int, threshold: float) -> List[Dict[str, Any]]:
        """
        Generates realistic road detection boxes for preview and demo fallback,
        including forward vehicles, road potholes, and roadside signs.
        """
        detections = []

        # 1. Forward Leading Vehicle
        if threshold <= 0.85:
            vw = width * 0.32
            vh = height * 0.28
            vx1 = width * 0.35 + random.uniform(-10, 10)
            vy1 = height * 0.42 + random.uniform(-5, 5)
            detections.append({
                "label": "Vehicle (Sedan)",
                "confidence": round(random.uniform(0.88, 0.96), 2),
                "box": [vx1, vy1, vx1 + vw, vy1 + vh],
                "hazard_type": None,
                "severity": "low",
                "is_ai_detected": False
            })

        # 2. Adjacent Lane Vehicle
        if threshold <= 0.75:
            vw2 = width * 0.25
            vh2 = height * 0.22
            vx2 = width * 0.08
            vy2 = height * 0.48
            detections.append({
                "label": "Vehicle (SUV)",
                "confidence": round(random.uniform(0.82, 0.91), 2),
                "box": [vx2, vy2, vx2 + vw2, vy2 + vh2],
                "hazard_type": None,
                "severity": "low",
                "is_ai_detected": False
            })

        # 3. Road Surface Hazard (Pothole / Road Anomaly)
        if threshold <= 0.65:
            pw = width * 0.18
            ph = height * 0.10
            px1 = width * 0.44
            py1 = height * 0.72
            detections.append({
                "label": "Simulated Hazard: Severe Pothole",
                "confidence": round(random.uniform(0.84, 0.92), 2),
                "box": [px1, py1, px1 + pw, py1 + ph],
                "hazard_type": "pothole",
                "severity": "high",
                "is_ai_detected": False
            })

        return detections

detector = RoadSceneDetector()
