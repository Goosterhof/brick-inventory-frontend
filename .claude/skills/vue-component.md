# Vue Component — _Beautiful_

Patterns for writing Vue 3 components.

## Props

Use prop destructuring with inline defaults:

```ts
const {
    label,
    type = "text",
    disabled = false,
} = defineProps<{label: string; type?: "text" | "email" | "password"; disabled?: boolean}>();
```

## v-model

Use `defineModel` for two-way binding:

```ts
const model = defineModel<string>({required: true});
```

```vue
<input v-model="model" />
```

## Form Composition

Input components compose the shared form primitives:

```vue
<template>
    <FormField>
        <FormLabel :for="inputId" :required="required">{{ label }}</FormLabel>
        <input :id="inputId" v-model="model" />
        <FormError v-if="error" :id="errorId" :message="error" />
    </FormField>
</template>
```

## Translations

All user-facing text uses the translation service:

```vue
<script setup lang="ts">
import {familyTranslationService} from "@app/services";

const {t} = familyTranslationService;
</script>

<template>
    <FormLabel :for="inputId">{{ t("auth.email").value }}</FormLabel>
</template>
```
