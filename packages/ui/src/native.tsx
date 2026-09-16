/**
 * @repo/ui — React Native (mobile) neubrutalism primitives
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  type ViewStyle, type GestureResponderEvent,
} from 'react-native';
import { ShadowOffsets, Radius, Border, Colors } from './tokens';

// ---------------------------------------------------------------------------
// Shared style helpers
// ---------------------------------------------------------------------------

function baseStyle(radius: number, accentColor = '#D7FF3F'): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.border,
    shadowColor: accentColor,
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  };
}

function pressedStyle(radius: number): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.border,
    shadowColor: 'transparent',
    shadowOffset: ShadowOffsets.pressed,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
  accentColor?: string;
}

export function Card({ children, style, pressed = false, accentColor = '#D7FF3F' }: CardProps) {
  return (
    <View
      style={[
        baseStyle(Radius.card, accentColor),
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
  onPress?: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  pressed?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accentColor?: string;
}

export function Button({
  children, onPress, variant = 'primary', pressed = false, disabled = false, style,
  accentColor = '#D7FF3F',
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      style={[
        styles.button,
        { shadowColor: accentColor },
        variant === 'primary' ? { backgroundColor: accentColor } : styles.secondary,
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
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D7FF3F',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primary: {
    backgroundColor: '#D7FF3F',
  },
  secondary: {
    backgroundColor: Colors.dark.bgElevated,
  },
  pressed: {
    shadowOffset: ShadowOffsets.pressed,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  disabled: {
    opacity: 0.5,
  },
   text: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: { color: '#000000' },
  secondaryText: { color: Colors.dark.textPrimary },
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
  accentColor?: string;
}

export function Input({ value, onChangeText, placeholder, placeholderTextColor, secureTextEntry, style, accentColor = '#D7FF3F' }: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor ?? Colors.dark.textSecondary}
      secureTextEntry={secureTextEntry}
      style={[
        formStyles.input,
        { shadowColor: accentColor },
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
  accentColor?: string;
}

export function Badge({ children, variant = 'default', style, accentColor = '#D7FF3F' }: BadgeProps) {
  return (
    <View style={[
      formStyles.badge,
      { shadowColor: accentColor },
      variant === 'accent' && { backgroundColor: accentColor },
      style,
    ]}>
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
  accentColor?: string;
}

export function Checkbox({ checked, onPress, accentColor = '#D7FF3F' }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={[
        formStyles.checkbox,
        { shadowColor: accentColor },
        checked && { backgroundColor: accentColor },
        checked && formStyles.checkboxChecked,
      ]}
    >
      {checked && <Text style={formStyles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const formStyles = StyleSheet.create({
  input: {
    borderRadius: Radius.control,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.dark.textPrimary,
    backgroundColor: Colors.dark.bgElevated,
    shadowColor: '#D7FF3F',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badge: {
    borderRadius: Radius.control,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.dark.bgElevated,
    shadowColor: '#D7FF3F',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  accentBadge: { backgroundColor: '#D7FF3F' },
  badgeText: { color: Colors.dark.textPrimary, fontSize: 12, fontWeight: '600' },
  accentBadgeText: { color: '#000000' },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D7FF3F',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  checkboxChecked: {
    backgroundColor: '#D7FF3F',
    shadowOffset: ShadowOffsets.pressed,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  checkmark: { color: '#000000', fontSize: 20, fontWeight: '700' },
});
