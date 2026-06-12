import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  onValueChange?: (value: string | number) => void;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  triggerClassName?: string;
  menuClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  onChange,
  onValueChange,
  placeholder = 'Pilih opsi...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  name,
  onBlur,
  disabled,
  required,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Combine ref for native element
  useImperativeHandle(ref, () => selectRef.current!);

  // Manage internal state for uncontrolled usage
  const [internalValue, setInternalValue] = useState<string | number>('');

  const currentValue = value !== undefined ? value : internalValue;

  // Sync internal state if value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (optionValue: string | number) => {
    if (disabled) return;

    setInternalValue(optionValue);

    if (selectRef.current) {
      selectRef.current.value = String(optionValue);
      // Dispatch standard change event for React Hook Form
      const event = new Event('change', { bubbles: true });
      selectRef.current.dispatchEvent(event);
    }

    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || '',
          value: String(optionValue),
        },
        currentTarget: {
          name: name || '',
          value: String(optionValue),
        }
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }

    if (onValueChange) {
      onValueChange(optionValue);
    }

    setIsOpen(false);
  };

  const selectedOption = options.find(opt => String(opt.value) === String(currentValue));

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden native select for standard HTML forms & React Hook Form */}
      <select
        ref={selectRef}
        name={name}
        value={currentValue}
        onChange={(e) => {
          if (onChange) onChange(e);
          if (onValueChange) onValueChange(e.target.value);
        }}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className="sr-only"
        tabIndex={-1}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {typeof opt.label === 'string' ? opt.label : String(opt.value)}
          </option>
        ))}
      </select>

      {/* Custom Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-bg-surface/50 border border-border-main/50 focus:border-brand-primary rounded-xl px-4 py-2.5 text-xs font-semibold text-text-main transition-all duration-200 outline-none select-none cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-surface/85 hover:border-border-main'
        } ${isOpen ? 'border-brand-primary/80 ring-1 ring-brand-primary/20' : ''} ${triggerClassName}`}
      >
        <span className={selectedOption ? 'text-text-main' : 'text-text-muted/70 font-normal'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-brand-primary' : ''}`} />
      </button>

      {/* Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute z-[999] w-full mt-1.5 bg-slate-900 border border-border-main/80 backdrop-blur-md shadow-2xl rounded-xl py-1.5 max-h-60 overflow-y-auto text-left select-none ${menuClassName}`}
          >
            {options.length === 0 ? (
              <div className="px-4 py-2 text-xs text-text-muted italic">Tidak ada opsi tersedia</div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(currentValue);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-150 cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/20' 
                        : 'text-text-muted hover:text-text-main hover:bg-brand-primary/5'
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Select.displayName = 'Select';
