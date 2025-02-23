import * as React from "react";
import { observer } from "mobx-react-lite";
import { Alert, Snackbar, Stack } from "@mui/material";
import { notificationStore } from "../../stores/NotificationStore";

const NotificationBanner: React.FC = observer(() => {
  return (
    <Stack spacing={2} sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
      {notificationStore.notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={5000}
          onClose={() => notificationStore.removeNotification(notification.id)}
        >
          <Alert
            severity={notification.type}
            onClose={() => notificationStore.removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
});

export default NotificationBanner;