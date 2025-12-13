# Anti-Patterns

What NOT to do in this architecture.

## Core Layer

### ❌ Importing from `infra/` or `ui/`

```ts
// BAD - core depends on infra
import { SentryLogger } from '../../infra/logger/sentry.logger'

// GOOD - core depends on port
import { Logger } from '../_ports_/logger'
```

**Why**: Core must remain framework-agnostic and testable.

---

### ❌ Direct Date/Time Access

```ts
// BAD - untestable
const now = new Date()
const timestamp = Date.now()

// GOOD - injectable
const now = dateProvider.now()
```

**Why**: Tests become flaky and time-dependent.

---

### ❌ Business Logic in Thunks

```ts
// BAD - logic buried in thunk
const processOrder = createAppThunk(async (_, { extra }) => {
  const items = await extra.orderRepo.getItems()
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const tax = total * 0.2
  // ... 50 more lines
})

// GOOD - logic in domain, thunk orchestrates
const processOrder = createAppThunk(async (_, { extra }) => {
  const items = await extra.orderRepo.getItems()
  const invoice = calculateInvoice(items) // Pure function
  await extra.orderRepo.save(invoice)
})
```

**Why**: Pure functions are easier to test and reuse.

---

## Infrastructure Layer

### ❌ Leaking Implementation Details

```ts
// BAD - exposes Prisma types
interface UserRepository {
  findMany(args: Prisma.UserFindManyArgs): Promise<User[]>
}

// GOOD - clean interface
interface UserRepository {
  findAll(filters?: UserFilters): Promise<User[]>
}
```

**Why**: Consumers shouldn't know about Prisma, SQLite, etc.

---

## UI Layer

### ❌ Business Logic in Components

```ts
// BAD - calculation in component
function OrderTotal({ items }) {
  const subtotal = items.reduce((s, i) => s + i.price, 0)
  const tax = subtotal * 0.2
  const shipping = subtotal > 100 ? 0 : 10
  return <Text>{subtotal + tax + shipping}</Text>
}

// GOOD - use view model or selector
function OrderTotal({ items }) {
  const total = useOrderTotal(items) // or useSelector
  return <Text>{total}</Text>
}
```

**Why**: Logic becomes untestable and duplicated.

---

### ❌ Direct API Calls in Components

```ts
// BAD
function UserProfile() {
  useEffect(() => {
    fetch('/api/user').then(...)
  }, [])
}

// GOOD
function UserProfile() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchUser())
  }, [])
}
```

**Why**: Side effects belong in the Redux layer.

---

## Testing

### ❌ Mocking Everything

```ts
// BAD - mock hell
jest.mock('../repo')
jest.mock('../service')
jest.mock('../logger')
jest.mock('../dateProvider')

// GOOD - use fakes via DI
const store = createTestStore({
  userRepo: new FakeUserRepo(),
  dateProvider: new FakeDateProvider(),
})
```

**Why**: Mocks are brittle, fakes are reusable.

---

### ❌ Testing Implementation Details

```ts
// BAD - tests internal state shape
expect(store.getState().auth._internal.tokenRefreshCount).toBe(1)

// GOOD - tests behavior via selectors
expect(selectIsAuthenticated(store.getState())).toBe(true)
```

**Why**: Internal changes shouldn't break tests.

---

### ❌ Missing Arrange-Act-Assert Separation

```ts
// BAD - mixed concerns
test('user login', async () => {
  const store = createTestStore()
  store.dispatch(setEmail('test@example.com'))
  expect(selectEmail(store.getState())).toBe('test@example.com')
  await store.dispatch(login())
  expect(selectIsLoggedIn(store.getState())).toBe(true)
})

// GOOD - clear phases
test('user login', async () => {
  // Arrange
  const store = createTestStore()
  store.dispatch(setEmail('test@example.com'))
  store.dispatch(setPassword('password123'))

  // Act
  await store.dispatch(login())

  // Assert
  expect(selectIsLoggedIn(store.getState())).toBe(true)
})
```

**Why**: Tests are easier to read and maintain.
