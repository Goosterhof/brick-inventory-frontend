# Vue Component — _Beautiful_

Every component is a brick in the set. Small, purposeful, clicks firmly into place. A component with more than 3-4 props is a brick trying to do too many things — in real Lego, multi-function pieces are rare and specific. Split it.

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
