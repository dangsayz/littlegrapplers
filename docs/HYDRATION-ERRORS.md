# Hydration Errors Reference

Common hydration mismatch errors and their solutions for this Next.js project.

---

## Error: Clerk SignInButton adds invalid `component` prop

**Error Message:**
```
Hydration failed because the server rendered HTML didn't match the client.
```

**Stack trace points to:**
```tsx
<SignInButton mode="modal">
  <button ...>
```

**Root Cause:**
Clerk's `SignInButton` component passes a `component="SignInButton"` prop down to the child button element. This is an invalid HTML attribute on a native `<button>` element, causing a server/client mismatch.

**Solution:**
Wrap the button in a custom component that filters out the `component` prop:

```tsx
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

interface ClerkButtonProps extends ComponentPropsWithoutRef<'button'> {
  component?: string; // Accept but don't pass to DOM
}

const ClerkButton = forwardRef<HTMLButtonElement, ClerkButtonProps>(
  ({ component, ...props }, ref) => <button ref={ref} {...props} />
);
ClerkButton.displayName = 'ClerkButton';

// Usage:
<SignInButton mode="modal">
  <ClerkButton aria-label="Sign in">
    <User className="h-5 w-5" />
    <span>Sign In</span>
  </ClerkButton>
</SignInButton>
```

**File affected:** `src/components/layout/mobile-bottom-nav.tsx`

---

## Common Hydration Mismatch Causes

### 1. Server/Client Branching
```tsx
// BAD - causes mismatch
if (typeof window !== 'undefined') {
  return <ClientOnly />;
}

// GOOD - use useEffect or dynamic import
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### 2. Date/Time Formatting
```tsx
// BAD - locale differs between server and client
<span>{new Date().toLocaleDateString()}</span>

// GOOD - format on client only or use consistent format
const [date, setDate] = useState<string>('');
useEffect(() => {
  setDate(new Date().toLocaleDateString());
}, []);
```

### 3. Random Values
```tsx
// BAD - different on server vs client
<div key={Math.random()}>

// GOOD - use stable IDs
<div key={item.id}>
```

### 4. Invalid HTML Nesting
```tsx
// BAD - p cannot contain div
<p><div>content</div></p>

// GOOD
<div><div>content</div></div>
```

### 5. Third-party Components Passing Invalid Props
```tsx
// BAD - library passes invalid prop to DOM element
<ThirdPartyButton>
  <button {...props}> {/* props may contain invalid attributes */}
</ThirdPartyButton>

// GOOD - filter out invalid props
const SafeButton = forwardRef(({ invalidProp, ...rest }, ref) => (
  <button ref={ref} {...rest} />
));
```

---

## Debugging Tips

1. **Check the diff in the error** - React shows `+` for client and `-` for server
2. **Look for dynamic values** - timestamps, random IDs, locale-dependent strings
3. **Check third-party component props** - they may inject invalid HTML attributes
4. **Verify HTML validity** - use browser dev tools to check for nesting issues
5. **Browser extensions** - can modify HTML before React hydrates

---

## Related Resources

- [React Hydration Mismatch Docs](https://react.dev/link/hydration-mismatch)
- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
