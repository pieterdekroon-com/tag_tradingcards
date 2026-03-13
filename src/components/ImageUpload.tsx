import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  image: string;
  onChange: (dataUrl: string) => void;
}

export function ImageUpload({ image, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${image ? styles.hasImage : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
    >
      {image ? (
        <img src={image} alt="Card" className={styles.preview} />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.icon}>↑</span>
          <span className={styles.text}>Drop image or click to upload</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className={styles.fileInput}
      />
    </div>
  );
}
