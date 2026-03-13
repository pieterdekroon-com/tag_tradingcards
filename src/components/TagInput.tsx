import { useState, KeyboardEvent } from 'react';
import styles from './TagInput.module.css';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = 'Type and press Enter' }: TagInputProps) {
  const [input, setInput] = useState('');

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.container}>
      <div className={styles.tags}>
        {tags.map((tag, i) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button type="button" className={styles.remove} onClick={() => removeTag(i)}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className={styles.input}
      />
    </div>
  );
}
