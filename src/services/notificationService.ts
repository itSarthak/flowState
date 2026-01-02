export const NOTIFICATION_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';

export const notificationService = {
  requestPermission: () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },
  trigger: (goal: string, minutes: number) => {
    // Only show browser notification if the app is NOT visible
    if (document.visibilityState !== 'visible') {
      if (Notification.permission === 'granted') {
        new Notification('Flow Session Reminder', {
          body: `Your session "${goal}" has been active for ${minutes} minutes. Don't forget to end it if you are done!`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });
      }
    }
    
    // Play sound thrice with 0.5s interval
    const playSound = () => {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.play().catch(e => console.log("Audio play blocked", e));
    };

    playSound();
    setTimeout(playSound, 500);
    setTimeout(playSound, 1000);
  }
};
