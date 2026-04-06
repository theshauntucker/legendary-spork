import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../lib/theme';

interface BrandHeaderProps {
  showBack?: boolean;
  subtitle?: string;
}

export default function BrandHeader({ showBack = false, subtitle }: BrandHeaderProps) {
  const router = useRouter();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={{ color: colors.textSecondary, fontSize: 22 }}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>
          Routine<Text style={{ color: colors.gold[400] }}>X</Text>
        </Text>
        {subtitle && (
          <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
            | {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
