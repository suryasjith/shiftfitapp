// ShiftFit Mobile Push Notification & Discipline Engine
// Handles Service Worker mobile push notifications, daily 8:00 AM quotes (online + offline fallback), and smart hydration triggers.

export interface DailyQuote {
  quote: string;
  author: string;
}

// 100% Offline Curated Database of High-Performance Athletic & Shift Worker Resilience Quotes
export const OFFLINE_QUOTES: DailyQuote[] = [
  { quote: 'We do not rise to the level of our expectations, we fall to the level of our training.', author: 'Archilochus' },
  { quote: 'You do not have to be extreme, just consistent.', author: 'James Clear' },
  { quote: 'Discipline equals freedom.', author: 'Jocko Willink' },
  { quote: 'The body achieves what the mind believes.', author: 'Napoleon Hill' },
  { quote: 'No citizen has a right to be an amateur in the matter of physical training.', author: 'Socrates' },
  { quote: 'Don’t count the days, make the days count.', author: 'Muhammad Ali' },
  { quote: 'Action expresses priorities.', author: 'Mahatma Gandhi' },
  { quote: 'First say to yourself what you would be; and then do what you have to do.', author: 'Epictetus' },
  { quote: 'Strength does not come from winning. Your struggles develop your strengths.', author: 'Arnold Schwarzenegger' },
  { quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { quote: 'Small disciplines repeated with consistency every day lead to great achievements.', author: 'John C. Maxwell' },
  { quote: 'Energy flows where attention goes.', author: 'Tony Robbins' },
  { quote: 'The only bad workout is the one that didn’t happen.', author: 'Fitness Maxim' },
  { quote: 'Consistency is the DNA of mastery.', author: 'Robin Sharma' },
  { quote: 'Tough times don’t last. Tough people do.', author: 'Robert H. Schuller' },
  { quote: 'Hydration and sleep build the foundation of every PR in the gym.', author: 'ShiftFit Science' },
  { quote: 'Mastering the 12-hour shift means mastering your recovery between the shifts.', author: 'ShiftFit Operating System' },
];

export class NotificationService {
  /**
   * Check if Web Push / Notifications are supported by the browser/PWA
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current notification permission state
   */
  static getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request device push notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Dispatches a mobile push notification via Service Worker (with native fallback)
   */
  static async sendNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/shiftfitapp/icon-192.png',
      badge: '/shiftfitapp/icon-192.png',
      silent: false,
      ...options,
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, defaultOptions);
          return true;
        }
      }
      // Fallback to Window Notification
      new Notification(title, defaultOptions);
      return true;
    } catch {
      try {
        new Notification(title, defaultOptions);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Fetches quote from public API with timeout, falls back to offline curated list
   */
  static async fetchDailyQuote(): Promise<DailyQuote> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('https://dummyjson.com/quotes/random', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.quote && data.author) {
          return { quote: data.quote, author: data.author };
        }
      }
    } catch {
      // Offline fallback
    }

    // Deterministic selection based on current day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const selected = OFFLINE_QUOTES[dayOfYear % OFFLINE_QUOTES.length];
    return selected;
  }

  /**
   * Sends the 8:00 AM Morning Discipline Quote Notification
   */
  static async sendMorningQuoteNotification(): Promise<boolean> {
    const quoteData = await this.fetchDailyQuote();
    return this.sendNotification('☀️ Morning Discipline — 8:00 AM', {
      body: `"${quoteData.quote}" — ${quoteData.author}`,
      tag: 'morning-quote',
    });
  }

  /**
   * Sends Smart Hydration Push Reminder (Suppressed if goal achieved)
   */
  static async sendHydrationReminder(currentWaterMl: number, targetWaterMl: number): Promise<boolean> {
    // Smart suppression: if goal is already met or exceeded, stay silent!
    if (currentWaterMl >= targetWaterMl) {
      return false;
    }

    const remainingMl = Math.max(0, targetWaterMl - currentWaterMl);
    const percentDone = Math.round((currentWaterMl / targetWaterMl) * 100);

    return this.sendNotification('💧 Hydration Check', {
      body: `You've logged ${currentWaterMl}ml / ${targetWaterMl}ml (${percentDone}%). Drink a glass (+250ml) to stay on track. ${remainingMl}ml remaining.`,
      tag: 'hydration-reminder',
    });
  }
}
