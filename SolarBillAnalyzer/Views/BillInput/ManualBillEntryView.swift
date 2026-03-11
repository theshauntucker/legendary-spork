import SwiftUI
import SwiftData

struct ManualBillEntryView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = BillInputViewModel()
    @State private var showingBreakdown = false
    @State private var savedBill: Bill?

    var body: some View {
        NavigationStack {
            Form {
                providerSection
                billingPeriodSection
                usageSection
                lineItemsSection
                summarySection
                if !viewModel.validationErrors.isEmpty {
                    errorsSection
                }
            }
            .navigationTitle("Enter Bill Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveBill() }
                        .bold()
                }
            }
            .navigationDestination(item: $savedBill) { bill in
                BillBreakdownView(bill: bill)
            }
        }
    }

    private var providerSection: some View {
        Section("Utility Provider") {
            Picker("Provider", selection: $viewModel.provider) {
                Text("Select Provider").tag("")
                ForEach(MockDataService.commonProviders, id: \.self) { provider in
                    Text(provider).tag(provider)
                }
            }

            if viewModel.provider == "Other" {
                TextField("Provider Name", text: $viewModel.customProvider)
                    .textContentType(.organizationName)
            }
        }
    }

    private var billingPeriodSection: some View {
        Section("Billing Period") {
            DatePicker("Start Date", selection: $viewModel.billingPeriodStart, displayedComponents: .date)
            DatePicker("End Date", selection: $viewModel.billingPeriodEnd, displayedComponents: .date)
        }
    }

    private var usageSection: some View {
        Section("Usage & Total") {
            HStack {
                Text("Total Amount")
                Spacer()
                TextField("$0.00", text: $viewModel.totalAmount)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 120)
            }

            HStack {
                Text("Total kWh")
                Spacer()
                TextField("0", text: $viewModel.totalKWh)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 120)
            }

            TextField("Service Address (optional)", text: $viewModel.address)
                .textContentType(.fullStreetAddress)
        }
    }

    private var lineItemsSection: some View {
        Section {
            ForEach($viewModel.lineItems) { $item in
                VStack(spacing: 8) {
                    Picker("Category", selection: $item.category) {
                        ForEach(ChargeCategory.allCases) { category in
                            Text(category.rawValue).tag(category)
                        }
                    }
                    .pickerStyle(.menu)

                    TextField("Description", text: $item.description)

                    HStack {
                        Text("Amount")
                        Spacer()
                        TextField("$0.00", text: $item.amount)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 120)
                    }
                }
                .padding(.vertical, 4)
            }
            .onDelete(perform: viewModel.removeLineItem)

            Button {
                viewModel.addLineItem()
            } label: {
                Label("Add Line Item", systemImage: "plus.circle.fill")
            }
        } header: {
            Text("Charge Breakdown")
        } footer: {
            Text("Add individual charges from your bill for a detailed breakdown. If you skip this, the total amount will be used as a single charge.")
        }
    }

    private var summarySection: some View {
        Section("Summary") {
            HStack {
                Text("Bill Total")
                Spacer()
                Text(viewModel.totalAmountValue.asCurrency)
                    .bold()
            }

            if viewModel.lineItemsTotal > 0 {
                HStack {
                    Text("Line Items Total")
                    Spacer()
                    Text(viewModel.lineItemsTotal.asCurrency)
                        .foregroundStyle(viewModel.hasDiscrepancy ? .red : .green)
                }

                if viewModel.hasDiscrepancy {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange)
                        Text("Line items don't match the total")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            if viewModel.totalKWhValue > 0 && viewModel.totalAmountValue > 0 {
                HStack {
                    Text("Effective Rate")
                    Spacer()
                    Text(String(format: "$%.4f/kWh", viewModel.totalAmountValue / viewModel.totalKWhValue))
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var errorsSection: some View {
        Section {
            ForEach(viewModel.validationErrors, id: \.self) { error in
                Label(error, systemImage: "exclamationmark.circle.fill")
                    .foregroundStyle(.red)
                    .font(.caption)
            }
        }
    }

    private func saveBill() {
        guard let bill = viewModel.createBill() else { return }
        modelContext.insert(bill)
        savedBill = bill
    }
}
