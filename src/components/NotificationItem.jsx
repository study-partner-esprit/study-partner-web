import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  AlertTriangle,
  Clock,
  BookOpen,
  Target,
  Zap,
  Trophy,
  Calendar,
} from "lucide-react";
import useNotificationStore from "../store/notificationStore";

const NotificationItem = ({ notification }) => {
  const { markAsRead } = useNotificationStore();

  const getIcon = (type) => {
    const iconProps = { size: 20 };

    switch (type) {
      case "study_reminder":
        return <Clock {...iconProps} className="text-blue-500" />;
      case "break_suggestion":
        return <Zap {...iconProps} className="text-yellow-500" />;
      case "plan_generated":
        return <Target {...iconProps} className="text-green-500" />;
      case "task_due":
        return <Calendar {...iconProps} className="text-red-500" />;
      case "session_suspended":
        return <AlertTriangle {...iconProps} className="text-orange-500" />;
      case "fatigue_alert":
        return <AlertTriangle {...iconProps} className="text-red-500" />;
      case "focus_drop":
        return <BookOpen {...iconProps} className="text-purple-500" />;
      case "achievement":
        return <Trophy {...iconProps} className="text-yellow-500" />;
      case "schedule_change":
        return <Calendar {...iconProps} className="text-blue-500" />;
      default:
        return <Bell {...iconProps} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      case "high":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20";
      case "normal":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const handleClick = () => {
    if (notification.status === "unread") {
      markAsRead(notification._id);
    }
  };

  return (
    <div
      className={`p-4 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        notification.status === "unread"
          ? `${getPriorityColor(notification.priority)} border-r-2 border-r-current`
          : "bg-white dark:bg-gray-800 border-l-gray-300 dark:border-l-gray-600"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4
              className={`text-sm font-semibold truncate ${
                notification.status === "unread"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {notification.title}
            </h4>

            {notification.status === "unread" && (
              <div className="w-2 h-2 bg-current rounded-full flex-shrink-0 ml-2"></div>
            )}
          </div>

          <p
            className={`text-sm mt-1 ${
              notification.status === "unread"
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-500 dark:text-gray-500"
            }`}
          >
            {notification.message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>

            <span
              className={`text-xs px-2 py-1 rounded-full capitalize ${
                notification.priority === "urgent"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : notification.priority === "high"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {notification.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
