# Accessibility Checklist

This document outlines the accessibility features implemented in Yandex Translate Electron App to ensure WCAG 2.1 Level AA compliance.

## ✅ Keyboard Navigation

- **Tab Navigation**: All interactive elements are accessible via Tab key
- **Focus Indicators**: Clear visual focus indicators on all focusable elements (blue outline)
- **Keyboard Shortcuts**:
  - `Enter`: Translate text (in overlay window)
  - `Escape`: Close overlay window
  - `Ctrl+Enter`: Translate (alternative)
  - `Tab`: Navigate between controls
  - `Shift+Tab`: Navigate backwards
  - Global hotkey: `Win+T` or `Ctrl+Shift+T` to open overlay

## ✅ Visual Accessibility

### Color Contrast
- **Text on Background**: Minimum 4.5:1 contrast ratio for normal text
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Sufficient contrast for buttons, links, and form controls
- **High Contrast Mode**: Detects system high contrast preference and increases border widths

### Theme Support
- **Dark Mode**: Full dark theme with appropriate contrast ratios
- **Light Mode**: Light theme with proper contrast
- **System Theme**: Respects OS theme preference
- **Theme Toggle**: Accessible via Settings or tray menu

### Visual Feedback
- **Hover States**: Visual feedback on hover for all interactive elements
- **Active States**: Click/press feedback with scale animation
- **Loading States**: Visual spinner with aria-live region
- **Error States**: Red borders and error messages with sufficient contrast

## ✅ Screen Reader Support

### ARIA Attributes
- **Labels**: All form inputs have associated labels
- **Roles**: Appropriate ARIA roles for custom components
- **Live Regions**: Toast notifications use aria-live for screen reader announcements
- **Button States**: `aria-busy` and `aria-disabled` for loading/disabled states
- **Status Messages**: Loading spinners have `role="status"` and `aria-label`

### Semantic HTML
- **Headings**: Proper heading hierarchy (h1, h2, h3, h4)
- **Landmarks**: Main, nav, and complementary regions
- **Lists**: Proper list markup for navigation and options
- **Forms**: Fieldset and legend for grouped form controls

## ✅ Animation & Motion

### Reduced Motion Support
- **CSS Media Query**: `prefers-reduced-motion: reduce` respected
- **Fallback**: Animations disabled for users with motion sensitivity
- **Transitions**: Essential animations only, with option to disable

### Animation Guidelines
- **Duration**: Animations kept under 400ms
- **Easing**: Natural easing functions (ease-out, ease-in-out)
- **Purpose**: Animations provide meaningful feedback, not decoration

## ✅ Focus Management

### Focus Order
- **Logical Flow**: Tab order follows visual layout
- **Overlay Window**: Focus automatically set to text input when opened
- **Modal Dialogs**: Focus trapped within modal, returns on close
- **Skip Links**: "Skip to main content" link for keyboard users

### Focus Restoration
- **Navigation**: Focus restored when navigating between tabs
- **Overlay Close**: Focus returns to trigger element after overlay closes
- **Settings**: Focus managed when switching between settings sections

## ✅ Form Accessibility

### Input Fields
- **Labels**: All inputs have visible labels
- **Error Messages**: Associated error messages with `aria-describedby`
- **Hint Text**: Helper text properly associated with inputs
- **Required Fields**: Indicated with asterisk and `aria-required`

### Validation
- **Inline Validation**: Real-time feedback for form errors
- **Error Summary**: List of errors at top of form (if applicable)
- **Clear Messages**: Error messages explain what went wrong and how to fix it

## ✅ Language Support

### Internationalization
- **Russian Default**: Primary language is Russian
- **Language Attribute**: `lang` attribute set correctly on HTML element
- **Screen Reader Compatibility**: Text properly announced in Russian
- **Future Support**: Architecture supports additional languages

## 🔄 Testing Recommendations

### Manual Testing
1. **Keyboard Only**: Navigate entire app without mouse
2. **Screen Reader**: Test with NVDA (Windows) or VoiceOver (macOS)
3. **High Contrast**: Enable Windows high contrast mode
4. **Zoom**: Test at 200% zoom level
5. **Color Blindness**: Use color blindness simulator

### Automated Testing
- ESLint plugin: `eslint-plugin-jsx-a11y` (future enhancement)
- Axe DevTools: Browser extension for automated audits
- Lighthouse: Accessibility score in Chrome DevTools

## 📋 Known Issues & Future Improvements

### Current Limitations
- Global hotkeys may conflict with other applications
- Some complex interactions may need additional ARIA annotations
- E2E accessibility testing not yet automated

### Planned Enhancements
- Add `eslint-plugin-jsx-a11y` for automated linting
- Implement comprehensive ARIA live regions for all state changes
- Add keyboard shortcuts documentation in-app
- Improve screen reader announcements for translation progress
- Add configurable font sizes in settings

## 🎯 WCAG 2.1 Compliance

### Level A (Complete)
- ✅ 1.1.1 Non-text Content
- ✅ 1.3.1 Info and Relationships
- ✅ 1.4.1 Use of Color
- ✅ 2.1.1 Keyboard
- ✅ 2.1.2 No Keyboard Trap
- ✅ 2.4.1 Bypass Blocks
- ✅ 3.1.1 Language of Page
- ✅ 4.1.1 Parsing
- ✅ 4.1.2 Name, Role, Value

### Level AA (Complete)
- ✅ 1.4.3 Contrast (Minimum)
- ✅ 1.4.5 Images of Text
- ✅ 2.4.6 Headings and Labels
- ✅ 2.4.7 Focus Visible
- ✅ 3.2.3 Consistent Navigation
- ✅ 3.2.4 Consistent Identification

## 🔗 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)
- [Accessible Rich Internet Applications (ARIA)](https://www.w3.org/WAI/standards-guidelines/aria/)
