import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Colors, Typography, Spacing, BorderRadius } from '../theme/colors';
import { useTasarimStore } from '../store/useStore';
import { Bodygraph } from './../components/Bodygraph';
import { Starfield } from '../components/Starfield';
import { StoryCard, STORY_W, STORY_H } from '../components/StoryCard';
import { TYPES } from '../data/types';
import { AUTHORITIES } from '../data/authorities';
import { L, getLang } from '../i18n';
import { crossLabel } from '../utils/humanDesign';
import { cityLabel } from '../data/cities';

interface Props {
  onClose: () => void;
}

export function IdCardScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { activeProfile, chart, updateProfilePhoto } = useTasarimStore();
  const cardRef = useRef<any>(null);
  const storyRef = useRef<any>(null);
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState<null | 'card' | 'story'>(null);

  // narrowed referanslar: callback closure'larında null check kaybolmasın
  const profile = activeProfile;
  if (!profile || !chart) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.empty}>{getLang() === 'en' ? 'Create a chart first' : 'Önce harita oluştur'}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeAlone}>
          <Text style={styles.closeText}>{getLang() === 'en' ? 'Close' : 'Kapat'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const t = TYPES[chart.type];
  const a = AUTHORITIES[chart.authority];

  async function pickPhoto() {
    try {
      setUploading(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          getLang() === 'en' ? 'Permission needed' : 'İzin gerekli',
          getLang() === 'en' ? 'You need to grant access to your photo library.' : 'Galeriye erişim izni vermelisin.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        await updateProfilePhoto(profile!.id, result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert(getLang() === 'en' ? 'Error' : 'Hata', e.message || (getLang() === 'en' ? 'Photo could not be uploaded' : 'Foto yüklenemedi'));
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    await updateProfilePhoto(profile!.id, null);
  }

  async function capture(
    ref: any,
    opts: { width?: number; height?: number; suffix: string }
  ) {
    try {
      setSharing(opts.suffix === 'story' ? 'story' : 'card');
      const fileName = `sakin-tasarim-${profile!.name.replace(/\s+/g, '_')}-${opts.suffix}.png`;
      if (Platform.OS === 'web') {
        const uri = await captureRef(ref as any, {
          format: 'png',
          quality: 0.95,
          result: 'data-uri',
          ...(opts.width ? { width: opts.width } : {}),
          ...(opts.height ? { height: opts.height } : {}),
        });
        const link = document.createElement('a');
        link.href = uri;
        link.download = fileName;
        link.click();
      } else {
        const uri = await captureRef(ref as any, {
          format: 'png',
          quality: 0.95,
          ...(opts.width ? { width: opts.width } : {}),
          ...(opts.height ? { height: opts.height } : {}),
        });
        const can = await Sharing.isAvailableAsync();
        if (can) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: opts.suffix === 'story'
              ? (getLang() === 'en' ? 'Share as Instagram Story' : 'Instagram Story olarak Paylaş')
              : (getLang() === 'en' ? 'Share Your ID Card' : 'Kimlik Kartını Paylaş'),
          });
        } else {
          Alert.alert(
            getLang() === 'en' ? 'Share' : 'Paylaş',
            getLang() === 'en' ? 'Sharing is not available on your device.' : 'Cihazında paylaşma özelliği aktif değil.'
          );
        }
      }
    } catch (e: any) {
      Alert.alert(getLang() === 'en' ? 'Error' : 'Hata', e.message || (getLang() === 'en' ? 'Could not share' : 'Paylaşılamadı'));
    } finally {
      setSharing(null);
    }
  }

  function shareCard() {
    capture(cardRef, { suffix: 'kart' });
  }

  function shareStory() {
    // 540x960 RN view → 1080x1920 PNG (Instagram Story tam boyut)
    capture(storyRef, { width: 1080, height: 1920, suffix: 'story' });
  }

  const photoUri = profile.photoUri;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel={getLang() === 'en' ? 'Back' : 'Geri'}>
          <Text style={styles.topBarBtn}>{getLang() === 'en' ? '← Back' : '← Geri'}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{getLang() === 'en' ? 'ID Card' : 'Kimlik Kartı'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ViewShot
          ref={cardRef}
          options={{ format: 'png', quality: 0.95 }}
          style={styles.card}
        >
          <Starfield width={320} height={720} density={0.55} seed={profile.id.charCodeAt(0) + profile.birthDate.length} />
          <Text style={styles.cardBrand}>{getLang() === 'en' ? 'SAKİN · DESIGN' : 'SAKİN · TASARIM'}</Text>
          <Text style={styles.cardSubBrand}>{getLang() === 'en' ? 'Human Design Identity' : 'Human Design Kimliği'}</Text>

          <View style={styles.photoRing}>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                {/* Sakin paleti duotone overlay'i: fotoğrafı palete bağlar */}
                <View style={styles.photoOverlay} pointerEvents="none" />
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderEmoji}>{t.emoji}</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardName}>{profile.name}</Text>
          <Text style={styles.cardType}>{L(t, 'name')}</Text>
          <Text style={styles.cardMeta}>
            {chart.profile} · {getLang() === 'en' ? L(a, 'name').replace(' Authority', '') : a.name.replace(' Yetki', '')}
          </Text>

          <View style={styles.divider} />

          <View style={styles.bodygraphHolder}>
            <Bodygraph chart={chart} size={200} showLabels={false} />
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <Stat label={getLang() === 'en' ? 'Strategy' : 'Strateji'} value={L(t, 'strategy')} />
            <Stat label={getLang() === 'en' ? 'Signature' : 'İmza'} value={L(t, 'signature')} />
            <Stat label={getLang() === 'en' ? 'Not-self Frequency' : 'Yanlış Frekans'} value={L(t, 'notSelf')} />
            <Stat
              label={getLang() === 'en' ? 'Definition' : 'Tanım'}
              value={
                getLang() === 'en'
                  ? (chart.definition.startsWith('Tek')
                      ? 'Single'
                      : chart.definition.startsWith('Bölünmüş')
                      ? 'Split'
                      : chart.definition.startsWith('Üçlü')
                      ? 'Triple'
                      : chart.definition.startsWith('Dörtlü')
                      ? 'Quadruple'
                      : 'None')
                  : chart.definition.split(' ')[0]
              }
            />
            <Stat
              label={getLang() === 'en' ? 'Active Gate' : 'Aktif Kapı'}
              value={`${chart.activeGates.size} / 64`}
            />
            <Stat
              label={getLang() === 'en' ? 'Defined Center' : 'Tanımlı Merkez'}
              value={`${chart.definedCenters.size} / 9`}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.birthBlock}>
            <Text style={styles.birthLabel}>{getLang() === 'en' ? 'BIRTH' : 'DOĞUM'}</Text>
            <Text style={styles.birthValue}>
              {profile.birthDate} · {profile.birthTime}
            </Text>
            <Text style={styles.birthValue}>
              {cityLabel(profile.city).split(',')[0]}
            </Text>
          </View>

          <Text style={styles.cardCross}>
            {crossLabel(chart.incarnationCross)}
          </Text>

          <Text style={styles.cardFooter}>
            sakin.life · {new Date().toLocaleDateString(getLang() === 'en' ? 'en-US' : 'tr-TR')}
          </Text>
        </ViewShot>

        <View style={styles.actions}>
          {photoUri ? (
            <>
              <TouchableOpacity
                style={styles.btn}
                onPress={pickPhoto}
                accessibilityRole="button"
                accessibilityLabel={getLang() === 'en' ? 'Change photo' : 'Fotoğrafı değiştir'}
              >
                <Text style={styles.btnText}>{getLang() === 'en' ? 'Change Photo' : 'Fotoğrafı Değiştir'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={removePhoto}
                accessibilityRole="button"
                accessibilityLabel={getLang() === 'en' ? 'Remove photo' : 'Fotoğrafı kaldır'}
              >
                <Text style={[styles.btnText, { color: Colors.textMuted }]}>{getLang() === 'en' ? 'Remove' : 'Kaldır'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.btn}
              onPress={pickPhoto}
              accessibilityRole="button"
              accessibilityLabel={getLang() === 'en' ? 'Upload photo' : 'Fotoğraf yükle'}
              disabled={uploading}
            >
              {uploading
                ? <ActivityIndicator color={Colors.gold} />
                : <Text style={styles.btnText}>{getLang() === 'en' ? '+ Upload Photo' : '+ Fotoğraf Yükle'}</Text>}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={shareStory}
            disabled={sharing !== null}
            accessibilityRole="button"
            accessibilityLabel={getLang() === 'en' ? 'Download as Instagram Story' : 'Instagram Story olarak indir'}
          >
            {sharing === 'story'
              ? <ActivityIndicator color={Colors.background} />
              : (
                <Text style={[styles.btnText, { color: Colors.background, fontWeight: '700' }]}>
                  {Platform.OS === 'web'
                    ? (getLang() === 'en' ? 'Download Instagram Story (1080×1920)' : 'Instagram Story İndir (1080×1920)')
                    : (getLang() === 'en' ? 'Share Instagram Story' : 'Instagram Story Paylaş')}
                </Text>
              )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btn}
            onPress={shareCard}
            disabled={sharing !== null}
            accessibilityRole="button"
            accessibilityLabel={getLang() === 'en' ? 'Download card' : 'Kartı indir'}
          >
            {sharing === 'card'
              ? <ActivityIndicator color={Colors.gold} />
              : (
                <Text style={styles.btnText}>
                  {Platform.OS === 'web'
                    ? (getLang() === 'en' ? 'Download as card' : 'Kart olarak indir')
                    : (getLang() === 'en' ? 'Share as card' : 'Kart olarak paylaş')}
                </Text>
              )}
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          {getLang() === 'en'
            ? 'Instagram Story full size (9:16, 1080×1920). Your photo is stored only on your device; no AI service call is made, the Sakin palette is applied locally.'
            : 'Instagram Story tam boyut (9:16, 1080×1920). Fotoğrafın yalnızca cihazında saklanır; AI servis çağrısı yapılmaz, sakin paleti lokal olarak uygulanır.'}
        </Text>

        {/* OFF-SCREEN StoryCard: capture için render edilir, görünmez */}
        <View style={styles.offscreen} pointerEvents="none">
          <ViewShot
            ref={storyRef}
            options={{ format: 'png', quality: 0.95, width: 1080, height: 1920 }}
          >
            <StoryCard profile={profile} chart={chart} />
          </ViewShot>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

  empty: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  closeAlone: {
    alignSelf: 'center', marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1, borderColor: Colors.gold,
  },
  closeText: { color: Colors.gold },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  topBarBtn: { color: Colors.text, fontSize: Typography.size.md },
  topBarTitle: {
    fontSize: Typography.size.md,
    color: Colors.text,
    letterSpacing: 0.5,
    fontWeight: Typography.weight.semibold,
  },

  card: {
    width: 320,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '25',
    overflow: 'hidden',
  },
  cardBrand: {
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.gold,
    fontWeight: Typography.weight.semibold,
  },
  cardSubBrand: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },

  photoRing: {
    width: 130, height: 130,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.gold + '60',
    padding: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%', height: '100%',
    borderRadius: 999,
  },
  photoOverlay: {
    position: 'absolute',
    top: 4, left: 4, right: 4, bottom: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(201, 168, 76, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  photoPlaceholder: {
    flex: 1, borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderEmoji: { fontSize: 48, opacity: 0.85 },

  cardName: {
    fontSize: Typography.size.xxl,
    color: Colors.text,
    fontFamily: Typography.font.serif,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  cardType: {
    fontSize: Typography.size.md,
    color: Colors.gold,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  cardMeta: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: '70%',
    marginVertical: Spacing.lg,
  },

  bodygraphHolder: {
    alignItems: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  stat: {
    width: '50%',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 10, letterSpacing: 1.2, color: Colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: Typography.size.sm,
    color: Colors.text,
  },

  birthBlock: {
    alignItems: 'center',
  },
  birthLabel: {
    fontSize: 10, letterSpacing: 2, color: Colors.textMuted,
    marginBottom: 4,
  },
  birthValue: {
    fontSize: Typography.size.sm, color: Colors.text,
    letterSpacing: 0.3,
    lineHeight: Typography.size.sm * 1.5,
  },

  cardCross: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  cardFooter: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.textDim,
    marginTop: Spacing.md,
  },

  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  btn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
  },
  btnGhost: {
    borderColor: Colors.divider,
  },
  btnPrimary: {
    backgroundColor: Colors.gold,
  },
  btnText: {
    color: Colors.gold,
    fontSize: Typography.size.md,
    letterSpacing: 0.4,
  },
  note: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: Typography.size.xs * 1.6,
    fontStyle: 'italic',
  },
  offscreen: {
    position: 'absolute',
    top: 0,
    left: -10000,
    width: 540,
    height: 960,
    opacity: 1,
  },
});
