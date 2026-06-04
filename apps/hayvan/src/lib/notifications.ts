import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export interface RationaleStrings {
  title: string;
  message: string;
  confirm: string;
  cancel: string;
}

/**
 * Show a rationale dialog explaining why we need notifications,
 * then request the OS permission only if the user confirms.
 * Required by App Store Review Guideline 4.5.4 and Play Console policy.
 */
export async function requestNotificationPermissionWithRationale(r: RationaleStrings): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const confirmed = await new Promise<boolean>(resolve => {
    Alert.alert(
      r.title,
      r.message,
      [
        { text: r.cancel, style: 'cancel', onPress: () => resolve(false) },
        { text: r.confirm, onPress: () => resolve(true) },
      ],
      { cancelable: false },
    );
  });
  if (!confirmed) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const MORNING_MESSAGES = [
  'Bugünün kartı seni bekliyor. ✦',
  'Yunus Emre bugün sana ne söyleyecek?',
  'Sufi meclisin açıldı. Telefonu salla.',
  'Gün başlamadan rehberini al.',
  'Bugünün taşı, hayvanı ve sözü hazır.',
];

function pickMessage(): string {
  return MORNING_MESSAGES[Math.floor(Math.random() * MORNING_MESSAGES.length)];
}

export async function scheduleDailyReminder(hour = 8, minute = 0): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'TURA',
      body: pickMessage(),
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
