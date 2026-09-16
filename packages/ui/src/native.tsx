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

function baseStyle(radius: number, accentColor = '#FFB800'): ViewStyle {
  return {
    borderRadius: radius,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.borderColor,
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
    borderColor: Colors.dark.borderColor,
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

export function Card({ children, style, pressed = false, accentColor = '#FFB800' }: CardProps) {
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
  accentColor = '#FFB800',
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
    borderColor: Colors.dark.borderColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primary: {
    backgroundColor: '#FFB800',
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
    fontFamily: 'SpaceGrotesk-Regular',
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

export function Input({ value, onChangeText, placeholder, placeholderTextColor, secureTextEntry, style, accentColor = '#FFB800' }: InputProps) {
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

export function Badge({ children, variant = 'default', style, accentColor = '#FFB800' }: BadgeProps) {
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

export function Checkbox({ checked, onPress, accentColor = '#FFB800' }: CheckboxProps) {
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
    borderColor: Colors.dark.borderColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.dark.textPrimary,
    backgroundColor: Colors.dark.bgElevated,
    shadowColor: '#FFB800',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  badge: {
    borderRadius: Radius.badge,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.borderColor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.dark.bgElevated,
    shadowColor: '#FFB800',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  accentBadge: { backgroundColor: '#FFB800' },
  badgeText: { color: Colors.dark.textPrimary, fontSize: 12, fontWeight: '600' },
  accentBadgeText: { color: '#000000' },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: Radius.circle,
    borderWidth: Border.width.mobile,
    borderColor: Colors.dark.borderColor,
    backgroundColor: Colors.dark.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: ShadowOffsets.resting,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  checkboxChecked: {
    backgroundColor: '#FFB800',
    shadowOffset: ShadowOffsets.pressed,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  checkmark: { color: '#000000', fontSize: 20, fontWeight: '700' },
});
