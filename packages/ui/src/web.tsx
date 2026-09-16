/**
 * @repo/ui — React DOM (desktop) neubrutalism primitives
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Radius, Border, Colors } from './tokens';

// ---------------------------------------------------------------------------
// Shared style helpers
// ---------------------------------------------------------------------------

function baseStyle(radius: number): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: Border.width.desktop,
    borderStyle: Border.style,
    borderColor: Colors.dark.border,
    boxShadow: '4px 4px 0px var(--accent-color)',
  };
}

function pressedStyle(radius: number): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: Border.width.desktop,
    borderStyle: Border.style,
    borderColor: Colors.dark.border,
    boxShadow: '0px 0px 0px transparent',
    transform: [{ translateX: 4 }, { translateY: 4 }],
  };
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pressed?: boolean;
}

export function Card({ children, style, pressed = false }: CardProps) {
  return (
    <View
      style={[
        baseStyle(Radius.card),
        pressed ? pressedStyle(Radius.card) : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  pressed?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  children, onPress, variant = 'primary', pressed = false, disabled = false, style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[
        styles.text,
        variant === 'primary' ? styles.primaryText : styles.secondaryText,
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.control,
    borderWidth: Border.width.desktop,
    borderStyle: Border.style,
    borderColor: Colors.dark.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '4px 4px 0px var(--accent-color)',
  },
  primary: { backgroundColor: 'var(--accent-color)' },
  secondary: { backgroundColor: '#0D0D0D' },
  pressed: {
    boxShadow: '0px 0px 0px transparent',
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  disabled: { opacity: 0.5 },
  text: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: '500' },
  primaryText: { color: '#000000' },
  secondaryText: { color: '#FFFFFF' },
});

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
}

export function Input({ value, onChangeText, placeholder, placeholderTextColor, secureTextEntry, style }: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor ?? '#9A9A9A'}
      secureTextEntry={secureTextEntry}
      style={[
        formStyles.input,
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[formStyles.badge, variant === 'accent' && formStyles.accentBadge, style]}>
      <Text style={[formStyles.badgeText, variant === 'accent' && formStyles.accentBadgeText]}>
        {children}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

interface CheckboxProps {
  checked: boolean;
  onPress?: () => void;
}

export function Checkbox({ checked, onPress }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[formStyles.checkbox, checked && formStyles.checkboxChecked]}
    >
      {checked && <Text style={formStyles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const formStyles = StyleSheet.create({
  input: {
    borderRadius: Radius.control,
    borderWidth: Border.width.desktop,
    borderStyle: Border.style,
    borderColor: Colors.dark.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#0D0D0D',
    boxShadow: '4px 4px 0px var(--accent-color)',
  },
  badge: {
    borderRadius: Radius.control,
    borderWidth: Border.width.desktop,
    borderStyle: Border.style,
    borderColor: Colors.dark.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0D0D0D',
    boxShadow: '4px 4px 0px var(--accent-color)',
  },
  accentBadge: { backgroundColor: 'var(--accent-color)' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  accentBadgeText: { color: '#000000' },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: Border.width.desktop,
    borderStyle: Border.style,
    borderColor: Colors.dark.border,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '4px 4px 0px var(--accent-color)',
  },
  checkboxChecked: {
    backgroundColor: 'var(--accent-color)',
    boxShadow: '0px 0px 0px transparent',
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  checkmark: { color: '#000000', fontSize: 20, fontWeight: '700' },
});
