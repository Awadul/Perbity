import React from 'react';
import './Input.css';

const Input = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = ''
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'input-error' : ''}
        required={required}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
