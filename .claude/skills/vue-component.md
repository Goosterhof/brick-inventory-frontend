# Vue Component Skill

Patterns for writing Vue 3 components in this project.

## Props with Destructuring

Use prop destructuring with inline defaults (no `withDefaults` needed):

```ts
const {
    label,
    type = "text",
    disabled = false,
} = defineProps<{label: string; type?: "text" | "email" | "password"; disabled?: boolean}>();
```

## v-model with defineModel

Use `defineModel` for two-way binding instead of manual prop + emit:

```ts
const model = defineModel<string>({required: true});
```

Then bind directly in template:

```vue
<input v-model="model" />
```

## Form Component Composition

Input components should compose the form primitives (FormField, FormLabel, FormError):

```vue
<template>
    <FormField>
        <FormLabel :for="inputId" :required="required">{{ label }}</FormLabel>
        <input :id="inputId" v-model="model" ... />
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>
```

## Component Naming

- Use two-word PascalCase for component names (e.g., FormLabel, TextInput, NavLink)
- File name should match component name

## Script Setup

Always use Composition API with `<script setup>` syntax:

```vue
<script setup lang="ts">
// imports, props, emits, reactive state, computed, methods
</script>
```

## Translations

All user-facing text must use the translation service — no hardcoded strings in templates:

```vue
<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;
</script>

<template>
    <FormField>
        <FormLabel :for="inputId" :required="required">{{ t("auth.email").value }}</FormLabel>
        <input :id="inputId" v-model="model" :placeholder="t('auth.email').value" />
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>
```
