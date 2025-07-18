# Zeurk UI Design Standards

## Overview
This document defines the UI/UX standards for the Zeurk ride-sharing application. These guidelines ensure consistency, accessibility, and a premium user experience across all screens and components.

## Design Philosophy
- **Dark-first design**: Primary dark theme with elegant contrast
- **Minimalist approach**: Clean, uncluttered interfaces
- **Premium feel**: Sophisticated styling with subtle effects
- **Accessibility**: High contrast ratios and clear visual hierarchy
- **Consistency**: Unified design language across all screens

## Color System

### Primary Colors
```javascript
// From designTokens.js
colors: {
  background: {
    primary: '#000000',      // Main background
    secondary: '#1a1a1a',    // Secondary surfaces
    tertiary: '#2a2a2a'      // Elevated surfaces
  },
  text: {
    primary: '#FFFFFF',      // Primary text
    secondary: 'rgba(255, 255, 255, 0.7)',  // Secondary text
    tertiary: 'rgba(255, 255, 255, 0.4)',   // Placeholder text
    disabled: 'rgba(255, 255, 255, 0.3)'    // Disabled text
  },
  brand: {
    primary: '#007AFF',      // Brand blue
    secondary: '#5856D6',    // Brand purple
    accent: '#FF9500'        // Accent orange
  },
  ui: {
    border: 'rgba(255, 255, 255, 0.1)',     // Default borders
    borderFocused: 'rgba(255, 255, 255, 0.3)', // Focused borders
    borderActive: 'rgba(255, 255, 255, 0.2)',  // Active borders
    surface: 'rgba(255, 255, 255, 0.1)',    // Glass surfaces
    error: '#ff6b6b',        // Error states
    success: '#51cf66',      // Success states
    warning: '#ffd43b'       // Warning states
  }
}
```

### Usage Guidelines
- **Background**: Always use `#000000` for primary backgrounds
- **Text**: Use white with appropriate opacity for hierarchy
- **Borders**: Subtle white borders with low opacity for elegance
- **Interactive elements**: Increase opacity on focus/hover states

## Typography

### Font Hierarchy
```javascript
typography: {
  sizes: {
    h1: 32,          // Screen titles
    h2: 24,          // Section headers
    h3: 20,          // Subsection headers
    body: 16,        // Body text, inputs
    caption: 14,     // Captions, small text
    small: 12        // Very small text
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
}
```

### Typography Rules
- **Titles**: 32px, bold weight, white color
- **Subtitles**: 16px, regular weight, 70% opacity
- **Body text**: 16px, regular weight, white or secondary
- **Captions**: 14px, regular weight, 80% opacity
- **Labels**: 16px, semibold weight, white

## Spacing System

### Standard Spacing Scale
```javascript
spacing: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40
}
```

### Layout Guidelines
- **Screen padding**: 20px horizontal, varies vertical
- **Component spacing**: 20px between major components
- **Input spacing**: 15px internal padding
- **Button spacing**: 16px vertical padding
- **Card spacing**: 20px internal padding

## Border Radius Standards

```javascript
borderRadius: {
  small: 8,
  medium: 12,
  large: 15,
  xlarge: 20,
  round: 25,
  circle: 50
}
```

### Usage
- **Buttons**: 15px radius
- **Input fields**: 15px radius
- **Cards**: 15px radius
- **Containers**: 15px-30px radius
- **Icons**: 20px radius for backgrounds

## Component Standards

### Buttons

#### Primary Button
```javascript
primaryButton: {
  backgroundColor: '#000000',
  paddingVertical: 16,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  alignItems: 'center'
}
```

#### Secondary Button
```javascript
secondaryButton: {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  paddingVertical: 16,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  alignItems: 'center'
}
```

### Input Fields

#### Standard Input
```javascript
inputContainer: {
  backgroundColor: '#000000',
  borderRadius: 15,
  paddingHorizontal: 15,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  flexDirection: 'row',
  alignItems: 'center'
}

inputFocused: {
  borderColor: 'rgba(255, 255, 255, 0.3)',
  backgroundColor: '#000000'
}
```

### Cards

#### Standard Card
```javascript
card: {
  backgroundColor: '#000000',
  borderRadius: 15,
  padding: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: 16
}
```

#### Elevated Card
```javascript
elevatedCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 15,
  padding: 20,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: 16
}
```

## Interactive States

### Focus States
- **Border**: Increase opacity to 0.3
- **Background**: Maintain or slightly lighten
- **Text**: Maintain white color

### Disabled States
- **Border**: Reduce opacity to 0.1
- **Text**: Reduce opacity to 0.3
- **Background**: Maintain or darken slightly

### Loading States
- **Spinner**: White color
- **Text**: Fade to 0.3 opacity
- **Button**: Maintain background, disable interaction

## Layout Patterns

### Screen Structure
```javascript
screenContainer: {
  flex: 1,
  backgroundColor: '#000000'
}

header: {
  paddingTop: 90,        // Account for status bar
  paddingBottom: 40,
  paddingHorizontal: 20,
  alignItems: 'center'
}

content: {
  flex: 1,
  paddingHorizontal: 20
}
```

### Navigation Patterns
- **Tab navigation**: Bottom tabs with icons
- **Stack navigation**: Header with back button
- **Modal navigation**: Full-screen overlays

## Accessibility Guidelines

### Contrast Requirements
- **Text on background**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 ratio
- **Focus indicators**: Clear visual distinction

### Touch Targets
- **Minimum size**: 44x44 points
- **Spacing**: 8px minimum between targets
- **Feedback**: Visual/haptic feedback on interaction

## Animation Standards

### Timing
```javascript
animations: {
  fast: 200,      // Quick transitions
  normal: 300,    // Standard transitions
  slow: 500       // Emphasis transitions
}
```

### Easing
- **Default**: ease-in-out
- **Entrance**: ease-out
- **Exit**: ease-in

## Icon Guidelines

### Icon System
- **Primary**: Ionicons library
- **Size**: 20-24px for UI elements
- **Color**: White with appropriate opacity
- **Style**: Outline style preferred

### Usage
- **Navigation**: 24px icons
- **Buttons**: 20px icons
- **List items**: 20px icons
- **Status indicators**: 16px icons

## Error Handling

### Error States
```javascript
errorContainer: {
  backgroundColor: 'rgba(255, 107, 107, 0.1)',
  borderColor: '#ff6b6b',
  borderWidth: 1,
  borderRadius: 15,
  padding: 16
}

errorText: {
  color: '#ff6b6b',
  fontSize: 14,
  textAlign: 'center'
}
```

### Success States
```javascript
successContainer: {
  backgroundColor: 'rgba(81, 207, 102, 0.1)',
  borderColor: '#51cf66',
  borderWidth: 1,
  borderRadius: 15,
  padding: 16
}
```

## Implementation Guidelines

### Code Organization
1. **Import design tokens**: Always use `designTokens.js`
2. **Consistent naming**: Use descriptive style names
3. **Reusable components**: Create shared components for common patterns
4. **Platform considerations**: Handle iOS/Android differences

### Performance
- **Optimize images**: Use appropriate formats and sizes
- **Minimize re-renders**: Use React.memo and useMemo appropriately
- **Lazy loading**: Implement for heavy components

### Testing
- **Visual regression**: Test UI changes across devices
- **Accessibility**: Test with screen readers
- **Performance**: Monitor render times

## Examples

### Screen Template
```javascript
const ExampleScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Screen Title</Text>
        <Text style={styles.subtitle}>Screen description</Text>
      </View>
      <View style={styles.content}>
        {/* Screen content */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    paddingTop: 90,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  }
});
```

## Maintenance

### Regular Reviews
- **Monthly**: Review consistency across screens
- **Quarterly**: Update design tokens if needed
- **Per release**: Validate new components follow standards

### Documentation Updates
- **New patterns**: Document new UI patterns
- **Component library**: Maintain shared component documentation
- **Design system**: Keep design tokens updated

---

*This document should be referenced for all UI development in the Zeurk application. For questions or suggestions, consult with the design team.*