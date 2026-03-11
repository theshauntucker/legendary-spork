import SwiftUI
import MapKit

struct AddressSearchView: View {
    @Binding var addressQuery: String
    let searchResults: [MKLocalSearchCompletion]
    let onQueryChanged: () -> Void
    let onResultSelected: (MKLocalSearchCompletion) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.secondary)

                TextField("Enter your address", text: $addressQuery)
                    .textContentType(.fullStreetAddress)
                    .autocorrectionDisabled()
                    .onChange(of: addressQuery) { _, _ in
                        onQueryChanged()
                    }

                if !addressQuery.isEmpty {
                    Button {
                        addressQuery = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(12)
            .background(Color(UIColor.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10))

            if !searchResults.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(searchResults.prefix(5), id: \.self) { result in
                        Button {
                            onResultSelected(result)
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(result.title)
                                    .font(.subheadline)
                                    .foregroundStyle(.primary)
                                Text(result.subtitle)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 10)
                        }

                        if result != searchResults.prefix(5).last {
                            Divider().padding(.leading, 12)
                        }
                    }
                }
                .background(Color(UIColor.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }
}
