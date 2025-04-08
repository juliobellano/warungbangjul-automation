from ultralytics import YOLO


model = YOLO("yolo11-model.pt")

model.predict(source = "testimage.jpeg", show = True, save = True, conf = 0.6, line_width = 2, save_crop = True, save_txt = True, show_labels = True, show_conf = True, classes = [0, 1, 2, 3, 4, 5, 6])