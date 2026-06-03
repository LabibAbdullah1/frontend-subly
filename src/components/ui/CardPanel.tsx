// src/components/ui/CardPanel.tsx
import React from 'react';

export interface CardPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  glowColor?: string;
  title?: string;
  headerActions?: React.ReactNode;
}

export const CardPanel: React.FC<CardPanelProps> = ({
  children,
  glow = false,
  glowColor,
  title,
  headerActions,
  className = '',
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(glow && glowColor ? { '--glow-color': glowColor } as React.CSSProperties : {}),
  };

  return (
    <div
      className={`glass-panel rounded-xl p-6 glow-hover transition-all duration-300 ${
        glow ? 'shadow-md shadow-brand-primary/5 hover:shadow-lg' : ''
      } ${className}`}
      style={customStyle}
      {...props}
    >
      {(title || headerActions) && (
        <div className="flex items-center justify-between border-b border-border-main pb-4 mb-4 select-none">
          {title && (
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {title}
            </h3>
          )}
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>
      )}
      <div className="text-left w-full h-full">
        {children}
      </div>
    </div>
  );
};
export default CardPanel;
