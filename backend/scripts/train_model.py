import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.training import train_and_save_model

if __name__ == "__main__":
    print("[Train] Training scikit-learn rockfall classifier...")
    acc = train_and_save_model()
    print(f"[Train] Finished! Accuracy: {acc * 100:.2f}%")
