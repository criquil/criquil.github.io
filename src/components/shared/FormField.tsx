import React from 'react';
import { Form } from 'react-bootstrap';

interface FormFieldProps {
  label: string;
  type: 'text' | 'password' | 'email' | 'number';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  testId?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  required = false,
  placeholder = '',
  error = '',
  disabled = false,
  testId
}) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        isInvalid={!!error}
        disabled={disabled}
        data-testid={testId}
      />
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default FormField;