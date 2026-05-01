import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../src/components/Button';
import { colors } from '../src/theme/colors';

interface ValueProp {
  icon: string;
  title: string;
  description: string;
  iconBg: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: '🔤',
    title: 'Script & pronunciation support',
    description: 'Cyrillic with transliteration. Learn to read from day one.',
    iconBg: 'rgba(6,182,212,0.15)',
  },
  {
    icon: '📴',
    title: 'Fully offline',
    description: 'Download content once, study anywhere. No network required.',
    iconBg: 'rgba(139,92,246,0.15)',
  },
  {
    icon: '📈',
    title: 'Serious progression',
    description: 'Spaced retrieval and task-based practice — not just flashcard streaks.',
    iconBg: 'rgba(16,185,129,0.15)',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top section */}
        <View style={styles.topSection}>
          {/* Logo mark */}
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>Кы</Text>
          </View>

          {/* App name */}
          <Text style={styles.appName}>
            {'Lingua'}
            <Text style={styles.appNameAccent}>{'Nomad'}</Text>
          </Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Serious language learning for underrepresented languages. Starting with Kyrgyz.
          </Text>

          {/* Language badge */}
          <View style={styles.languageBadge}>
            <Text style={styles.langFlag}>🇰🇬</Text>
            <Text style={styles.langBadgeText}>Kyrgyz · Кыргызча</Text>
          </View>
        </View>

        {/* Value propositions */}
        <View style={styles.valueProps}>
          {VALUE_PROPS.map((prop) => (
            <View key={prop.title} style={styles.propCard}>
              <View style={[styles.propIcon, { backgroundColor: prop.iconBg }]}>
                <Text style={styles.propIconText}>{prop.icon}</Text>
              </View>
              <View style={styles.propText}>
                <Text style={styles.propTitle}>{prop.title}</Text>
                <Text style={styles.propDescription}>{prop.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <Button
            label="Start with Kyrgyz →"
            variant="primary"
            style={styles.ctaButton}
            onPress={() => router.push('/course')}
          />
          <Text style={styles.kyrgyxPreview}>
            <Text style={styles.cyrillicText}>Баштайлы!</Text>
            {' — Let\'s begin!'}
          </Text>
          <Text style={styles.tos}>
            By continuing you accept our Terms and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 64,
    paddingBottom: 48,
    justifyContent: 'space-between',
    gap: 40,
  },
  topSection: {
    alignItems: 'center',
    gap: 0,
  },
  logoMark: {
    width: 72,
    height: 72,
    backgroundColor: colors.accent,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logoMarkText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  appNameAccent: {
    color: colors.accentSoft,
  },
  tagline: {
    fontSize: 15,
    color: '#9494b0',
    textAlign: 'center',
    lineHeight: 15 * 1.5,
    maxWidth: 260,
    marginBottom: 20,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  langFlag: {
    fontSize: 18,
  },
  langBadgeText: {
    fontSize: 14,
    color: '#a5b4fc',
    fontWeight: '500',
  },
  valueProps: {
    gap: 16,
  },
  propCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
  },
  propIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  propIconText: {
    fontSize: 17,
  },
  propText: {
    flex: 1,
    gap: 3,
  },
  propTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e2f0',
    marginBottom: 3,
  },
  propDescription: {
    fontSize: 12.5,
    color: '#7070a0',
    lineHeight: 12.5 * 1.45,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 14,
  },
  ctaButton: {
    width: '100%',
  },
  kyrgyxPreview: {
    fontSize: 14,
    color: '#6060a0',
  },
  cyrillicText: {
    color: '#7c7cbc',
    fontSize: 15,
  },
  tos: {
    fontSize: 11.5,
    color: '#4a4a70',
    textAlign: 'center',
    lineHeight: 11.5 * 1.5,
  },
});
