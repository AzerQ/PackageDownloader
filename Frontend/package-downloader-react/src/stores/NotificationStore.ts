import { makeAutoObservable, runInAction } from "mobx";

interface Notification {
  id: string;
  type: "info" | "warning" | "error";
  message: string;
}

class NotificationStore {
  notifications: Notification[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  // Метод для добавления нового уведомления
  addNotification(notification: Omit<Notification, "id">) {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9), // Генерируем уникальный ID
    };

    this.notifications.push(newNotification);

    // Автоматическое удаление уведомления через 5 секунд
    setTimeout(() => this.removeNotification(newNotification.id), 5000);
  }

  addInfo = (message: string) => this.addNotification ({
    message: message,
    type: "info"
  });

  addWarn = (message: string) => this.addNotification ({
    message: message,
    type: "warning"
  });

  addError = (message: string) => this.addNotification ({
    message: message,
    type: "error"
  });


  // Метод для удаления уведомления по ID
  removeNotification(id: string) {
    runInAction(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    });
  }

  // Метод для очистки всех уведомлений
  clearNotifications() {
    runInAction(() => {
      this.notifications = [];
    });
  }
}

export const notificationStore = new NotificationStore();

// @ts-ignore
export const showError = (error: unknown) => notificationStore.addError(error.toString());

export const showWarning = (warnMessage: string) => notificationStore.addWarn(warnMessage);

export const showInfo = (message: string) => notificationStore.addInfo(message);