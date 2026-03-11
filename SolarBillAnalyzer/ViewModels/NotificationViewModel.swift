import Foundation

@Observable
final class NotificationViewModel {
    var notificationsEnabled = false
    var billRemindersEnabled = true
    var usageSpikeAlertsEnabled = true
    var savingsMilestonesEnabled = true
    var permissionDenied = false
    var pendingCount = 0

    private let service = NotificationService.shared

    func checkPermission() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        await MainActor.run {
            notificationsEnabled = settings.authorizationStatus == .authorized
            permissionDenied = settings.authorizationStatus == .denied
        }
    }

    func requestPermission() async {
        let granted = await service.requestPermission()
        await MainActor.run {
            notificationsEnabled = granted
            permissionDenied = !granted
        }
    }

    func refreshPendingCount() async {
        let count = await service.getPendingNotificationCount()
        await MainActor.run {
            pendingCount = count
        }
    }

    func scheduleBillReminder(dueDate: Date, provider: String) {
        guard notificationsEnabled && billRemindersEnabled else { return }
        service.scheduleBillReminder(dueDate: dueDate, provider: provider)
    }

    func checkUsageSpike(currentUsage: Double, averageUsage: Double) {
        guard notificationsEnabled && usageSpikeAlertsEnabled else { return }
        service.scheduleUsageSpikeAlert(currentUsage: currentUsage, averageUsage: averageUsage)
    }

    func clearAll() {
        service.cancelAllNotifications()
        pendingCount = 0
    }
}

import UserNotifications
