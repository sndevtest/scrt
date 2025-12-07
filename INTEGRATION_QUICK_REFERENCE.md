# Quick Integration Reference

## State Variables by Component

### Booking Management
```javascript
Modal: showFilterModal
Data: rawUsers, rawDrivers, rawPassengers, rawBookings
Display: allBookings, filteredBookings
Filters: dateFrom, dateTo, selectedDriver, statusFilters{Completed, Pending, Cancelled}
```

### Audit Logs
```javascript
Data: logs[], searchTerm
Drivers: drivers{}, rawDrivers{}, rawUsers{}, driversLoaded
Filter: filteredLogs (computed)
```

### Passenger Management
```javascript
Modals: showEditModal, showFilterModal
Selected: selectedPassenger, selectedPassengerIndex
Data: rawUsers, rawPassengers, rawDrivers, rawBookings, rawFeedback
Display: passengers[], rideHistory[]
Search: searchQuery, startDate, endDate
Errors: emailError, phoneError
```

### Fare Matrix
```javascript
Modal: showModal
Input: modalTitle, modalValue
Static: No real-time data
```

---

## Firebase Paths and Collections

| Path | Used By | Data Type | Key Fields |
|------|---------|-----------|-----------|
| `/users` | All | User records | Firstname, Middlename, Lastname, Email, MobileNumber, RoleID, IsActive, PassengerID |
| `/drivers` | Booking, Logs, Passenger | Driver records | UserID, TricycleNumber, LicenseNumber, IsActive, DeletedAt, Name |
| `/passengers` | Booking, Passenger | Passenger records | UserID, PassengerID |
| `/bookings` or `/booking` | Booking, Passenger | Trip records | PassengerID, DriverID, PickupLocation, DropoffLocation, TotalFare, Status, RequestedAt, driverSnapshot |
| `/auditLogs` | Logs | Violation records | BookingID, DriverID, DriverName, ViolationType, Location, ViolationTimestamp, IsFlaggedForReview |
| `/feedback` | Passenger | Ratings | BookingID, Rating |

---

## Data Transformation Patterns

### Pattern 1: User Full Name
```javascript
makeFullName(user) = [user.Firstname, user.Middlename, user.Lastname]
                     .filter(Boolean).join(' ')
```

### Pattern 2: Driver Name Resolution (Priority Order)
1. driverSnapshot.name (from booking)
2. drivers[driverId].UserID → users[userId] full name
3. drivers[driverId].Name
4. auditLogs[].DriverName (stored value)
5. Fallback: "Unknown Driver"

### Pattern 3: Passenger Lookup
1. booking.PassengerID → users[].PassengerID match
2. Fallback: rawUsers[booking.PassengerID]

### Pattern 4: Status Color Mapping
```javascript
"Completed" → green-400/green-600
"Pending" → yellow-300/yellow-500
"Cancelled" → red-400/red-600
"Flagged" → red-600
"Reviewed" → green-600
```

---

## Filter Logic by Component

### Booking Management
```
if dateFrom → filter booking.date >= dateFrom
if dateTo → filter booking.date <= dateTo
if selectedDriver !== "All Drivers" → filter booking.driver === selectedDriver
filter booking.status in [Completed, Pending, Cancelled] selected
```

### Audit Logs
```
search across: id, bookingId, driver, event, location, status
case-insensitive
OR logic (any field match)
real-time as user types
```

### Passenger Management (Ride History)
```
search across: passengerId, passengerName, driverName, tricycleNo, pickup, dropOff
if startDate → filter ride.date >= startDate
if endDate → filter ride.date <= endDate
search case-insensitive, OR logic
```

---

## Validation Rules

### Passenger Contact Number
- Input: Accept digits only (remove non-numeric)
- Length: Exactly 11 digits
- Display: Strip "+63" prefix if present
- Error: "Contact number must be exactly 11 digits"

### Passenger Email
- Domain: Must be @gmail.com
- Auto-append: If no domain provided, add @gmail.com
- Error: "Email must be on \"gmail.com\" format"
- Storage: Lowercase, trimmed

### Name Parsing
- Split full name by whitespace: [firstname, ...middle, lastname]
- If 2 parts: firstname, lastname (no middle)
- If 3+ parts: firstname, middle(s), lastname

---

## Modal Types and Behaviors

### Type 1: Filter Modal (Booking Management)
- Fixed overlay with semi-transparent background
- Z-index: 50
- Close button (×) in top-right
- Content: Filters, Reset button, Apply button
- On apply: applyFilters() → update filteredBookings → close modal

### Type 2: Status Toggle Modal (Audit Logs)
- No modal, inline status badge
- Click status badge → handleStatusChange()
- Firebase update: IsFlaggedForReview = !current
- No modal UI, direct DB update

### Type 3: Edit Modal (Passenger Management)
- Form inputs for: name, email, phone
- Real-time validation with error messages below inputs
- Save calls handleSave() → Firebase update → local state update
- Close button resets selectedPassenger state

### Type 4: Filter & Detail Modal (Passenger Management)
- Large modal (900px width)
- Contains search + date range filters + table
- Table shows ride history with detailed columns
- Empty state icon if no results
- Close button at bottom

### Type 5: Settings Edit Modal (Fare Matrix)
- Simple text input for value
- Title shows what's being edited
- Save and Cancel buttons
- Shows success alert on save

---

## useEffect Dependencies by Component

### Booking Management
```javascript
useEffect(() => {
  // Firebase listeners
  unsubscribe functions returned
}, [])  // Once on mount

useEffect(() => {
  // Derive bookings from raw data
  setAllBookings(bookingsArr)
  setFilteredBookings(bookingsArr)
}, [rawUsers, rawDrivers, rawPassengers, rawBookings])

useMemo(() => {
  // Extract unique driver names
  return driverNames
}, [rawDrivers, rawUsers])
```

### Audit Logs
```javascript
useEffect(() => {
  // Load drivers map
  setDrivers(driverMap)
  setDriversLoaded(true)
}, [])  // Once on mount

useEffect(() => {
  // Listen to auditLogs
  setLogs(items)
}, [rawDrivers, rawUsers])

// filteredLogs is inline filter, not a state
```

### Passenger Management
```javascript
useEffect(() => {
  // Firebase listeners
}, [])  // Once on mount

useEffect(() => {
  // Derive passengers and ride history
  setPassengers(passengersArr)
  setRideHistory(historyArr)
}, [rawUsers, rawPassengers, rawDrivers, rawBookings, rawFeedback])
```

### Fare Matrix
- No useEffect hooks
- No Firebase integration
- No data derivation

---

## UI Component Patterns

### Card Layout (Booking, Passenger)
```jsx
<div className="bg-[#252d42] p-6 rounded-lg hover:bg-[#2d3548]">
  <div className="flex justify-between">
    <div>/* left content */</div>
    <div>/* right content (status, fare, actions) */</div>
  </div>
</div>
```

### Table Layout (Logs, Ride History)
```jsx
<table className="w-full">
  <thead className="bg-[#252d42]">
    <tr>
      <th className="px-6 py-4 text-left">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="bg-[#151b28] hover:bg-[#1a202e]">
      <td className="px-6 py-4">Data</td>
    </tr>
  </tbody>
</table>
```

### Empty State
```jsx
<div className="text-center text-gray-400 py-8 bg-[#252d42] rounded-lg">
  <p>No data found</p>
</div>
// OR
<div className="text-center py-12">
  <svg className="w-16 h-16 mx-auto mb-4">/* icon */</svg>
  <p className="text-gray-400">No data found</p>
</div>
```

### Status Badges
```jsx
<span className={`px-4 py-2 rounded-lg text-sm font-bold ${
  status === "Completed" ? "bg-green-600 text-white" :
  status === "Pending" ? "bg-yellow-500 text-gray-900" :
  "bg-red-600 text-white"
}`}>
  {status}
</span>
```

### Input Fields
```jsx
<input 
  type="text|email|date|number"
  value={value}
  onChange={(e) => setState(e.target.value)}
  placeholder="..."
  className="px-4 py-3 rounded-lg bg-[#252d42] text-white border border-gray-700 focus:border-yellow-500 focus:outline-none"
/>
```

---

## Key Differences Between Components

| Aspect | Booking | Logs | Passenger | Fare |
|--------|---------|------|-----------|------|
| **Data Source** | Firebase (5 collections) | Firebase (2 collections) | Firebase (5 collections) | Static/None |
| **Real-time Sync** | Yes | Yes | Yes | No |
| **Search Type** | Multi-criteria filters | Full-text search | Multi-criteria + full-text | N/A |
| **Edit Capability** | No | Status toggle only | Full edit modal | Hardcoded edit modal |
| **Data Display** | Cards | Table | Cards + Table (modal) | Static cards |
| **Modal Count** | 1 (filter) | 0 (inline) | 2 (edit, filter) | 1 (edit) |
| **Complexity** | High | Medium | Very High | Low |
| **Lines of Code** | ~508 | ~348 | ~695 | ~249 |

---

## Common Helper Functions to Extract

```javascript
// Firebase Utilities
const hashKeyToInt = (key) => { /* in Booking */ }
const formatDate = (timestamp) => { /* in Logs */ }
const makeFullName = (user) => { /* in Passenger & Booking */ }
const stripPhonePrefix = (phone) => { /* in Passenger */ }

// Sidebar Navigation
const getLinkClass = (page) => { /* in all */ }

// Common Patterns to Create
const formatFare = (amount) => `₱ ${amount.toFixed(2)}`
const getStatusColor = (status) => { /* mapping */ }
const validateEmail = (email) => email.includes('@gmail.com')
const validatePhone = (phone) => phone.replace(/\D/g, '').length === 11
```

---

## Performance Optimization Opportunities

1. **Context API**: Share raw data objects globally instead of re-fetching
2. **Memoization**: Wrap card/row components with React.memo
3. **Virtual Lists**: For large tables (Logs, Ride History) use react-window
4. **Debouncing**: Debounce search input in Logs and Passenger filter
5. **Pagination**: Implement for large result sets instead of rendering all
6. **Code Splitting**: Load each tab component on demand
7. **Firebase Indexing**: Add indexes for frequently filtered fields
8. **Listener Consolidation**: One listener per collection, not per component

---

## Alert/Notification Integration

All components use `window.showAlert(message, type)` from ui-modals.js

Usage examples:
```javascript
window.showAlert("Saved: Base Fare Rate = ₱30", 'success')
window.showAlert("Changes saved for John Doe", 'success')
window.showAlert("Error saving changes: ...", 'error')
window.showAlert('Contact number must be exactly 11 digits', 'error')
```

Expected function signature:
```javascript
window.showAlert = (message, type) => {
  // type: 'success', 'error', 'info', 'warning'
  // Display toast notification or modal alert
}
```
