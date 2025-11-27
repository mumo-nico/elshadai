"use client";

import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  required = false,
  minDate,
  className = "",
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrInstance = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (inputRef.current && !flatpickrInstance.current) {
      flatpickrInstance.current = flatpickr(inputRef.current, {
        dateFormat: "Y-m-d",
        minDate: minDate || undefined,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const formattedDate = date.toISOString().split("T")[0];
            onChange(formattedDate);
          }
        },
      });
    }

    return () => {
      if (flatpickrInstance.current) {
        flatpickrInstance.current.destroy();
        flatpickrInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (flatpickrInstance.current && minDate) {
      flatpickrInstance.current.set("minDate", minDate);
    }
  }, [minDate]);

  useEffect(() => {
    if (flatpickrInstance.current && value) {
      flatpickrInstance.current.setDate(value, false);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-neon-blue focus:outline-none transition-colors ${className}`}
    />
  );
}

