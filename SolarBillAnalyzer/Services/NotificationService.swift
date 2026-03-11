import Foundation
import UserNotifications

final class NotificationService {
    static let shared = NotificationService()

    private init() {}

    func requestPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            return granted
        } catch {
            return false
        }
    }

    func scheduleBillReminder(dueDate: Date, provider: String) {
        let content = UNMutableNotificationContent()
        content.title = "Bill Due Soon"
        content.body = "Your \(provider) bill is due in 3 days. Don't forget to pay!"
        content.sound = .default
        content.categoryIdentifier = AppConstants.billReminderNotificationID

        // Schedule 3 days before due date
        guard let reminderDate = Calendar.current.date(byAdding: .day, value: -3, to: dueDate) else { return }
        let components = Calendar.current.dateComponents([.year, .month, .day, .hour], from: reminderDate)

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        let request = UNNotificationRequest(
            identifier: "\(AppConstants.billReminderNotificationID)_\(UUID().uuidString)",
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }

    func scheduleUsageSpikeAlert(currentUsage: Double, averageUsage: Double) {
        guard currentUsage > averageUsage * 1.2 else { return }  // 20% above average

        let percentIncrease = Int(((currentUsage - averageUsage) / averageUsage) * 100)

        let content = UNMutableNotificationContent()
        content.title = "Usage Spike Detected"
        content.body = "Your energy usage is \(percentIncrease)% above your 3-month average. Consider reviewing your consumption patterns."
        content.sound = .default
        content.categoryIdentifier = AppConstants.usageSpikeNotificationID

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(
            identifier: "\(AppConstants.usageSpikeNotificationID)_\(UUID().uuidString)",
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }

    func scheduleSavingsMilestone(totalSavings: Double) {
        let milestones = [100, 500, 1000, 2500, 5000, 10000]
        guard let nextMilestone = milestones.first(where: { Double($0) > totalSavings }) else { return }

        let remaining = Double(nextMilestone) - totalSavings

        let content = UNMutableNotificationContent()
        content.title = "Savings Milestone"
        content.body = "You're only \(remaining.asCurrency) away from saving $\(nextMilestone) total! Keep up the great work."
        content.sound = .default
        content.categoryIdentifier = AppConstants.savingsMilestoneNotificationID

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 86400, repeats: false) // Next day
        let request = UNNotificationRequest(
            identifier: AppConstants.savingsMilestoneNotificationID,
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }

    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }

    func getPendingNotificationCount() async -> Int {
        let requests = await UNUserNotificationCenter.current().pendingNotificationRequests()
        return requests.count
    }
}
