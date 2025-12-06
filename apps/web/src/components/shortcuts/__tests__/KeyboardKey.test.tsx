// ===========================================
// Tests composant KeyboardKey - P3
// ===========================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardKey } from '../KeyboardKey';

describe('KeyboardKey', () => {
  it('should render the key label', () => {
    render(<KeyboardKey keyLabel="K" />);
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('should render with kbd tag', () => {
    render(<KeyboardKey keyLabel="⌘" />);
    const kbd = screen.getByText('⌘');
    expect(kbd.tagName).toBe('KBD');
  });

  it('should apply default md size classes', () => {
    render(<KeyboardKey keyLabel="A" />);
    const kbd = screen.getByText('A');
    expect(kbd).toHaveClass('min-w-7', 'h-7');
  });

  it('should apply sm size classes', () => {
    render(<KeyboardKey keyLabel="A" size="sm" />);
    const kbd = screen.getByText('A');
    expect(kbd).toHaveClass('min-w-5', 'h-5');
  });

  it('should apply lg size classes', () => {
    render(<KeyboardKey keyLabel="A" size="lg" />);
    const kbd = screen.getByText('A');
    expect(kbd).toHaveClass('min-w-9', 'h-9');
  });

  it('should apply custom className', () => {
    render(<KeyboardKey keyLabel="A" className="custom-class" />);
    const kbd = screen.getByText('A');
    expect(kbd).toHaveClass('custom-class');
  });

  it('should apply font-mono for single character symbols', () => {
    render(<KeyboardKey keyLabel="⌘" />);
    const kbd = screen.getByText('⌘');
    expect(kbd).toHaveClass('font-mono');
  });

  it('should apply tracking-wide for multi-character labels', () => {
    render(<KeyboardKey keyLabel="Ctrl" />);
    const kbd = screen.getByText('Ctrl');
    expect(kbd).toHaveClass('tracking-wide');
  });

  it('should render arrow symbols correctly', () => {
    render(<KeyboardKey keyLabel="↑" />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('should have select-none class to prevent text selection', () => {
    render(<KeyboardKey keyLabel="K" />);
    const kbd = screen.getByText('K');
    expect(kbd).toHaveClass('select-none');
  });
});
