<script setup lang="ts">
import BackButton from "@shared/components/BackButton.vue";
import BadgeLabel from "@shared/components/BadgeLabel.vue";
import CardContainer from "@shared/components/CardContainer.vue";
import DangerButton from "@shared/components/DangerButton.vue";
import DetailRow from "@shared/components/DetailRow.vue";
import EmptyState from "@shared/components/EmptyState.vue";
import FilterChip from "@shared/components/FilterChip.vue";
import FormError from "@shared/components/forms/FormError.vue";
import FormField from "@shared/components/forms/FormField.vue";
import FormLabel from "@shared/components/forms/FormLabel.vue";
import ListItemButton from "@shared/components/ListItemButton.vue";
import ModalDialog from "@shared/components/ModalDialog.vue";
import PageHeader from "@shared/components/PageHeader.vue";
import PrimaryButton from "@shared/components/PrimaryButton.vue";
import StatCard from "@shared/components/StatCard.vue";
import ToastMessage from "@shared/components/ToastMessage.vue";
import {ref} from "vue";

import SectionHeading from "./SectionHeading.vue";

const demoInput = ref("Brick 2x4");
const errorInput = ref("");
const toastVisible = ref(true);
const errorToastVisible = ref(true);
const modalOpen = ref(false);
const activeFilter = ref<string | null>(null);

const resetToasts = () => {
    toastVisible.value = true;
    errorToastVisible.value = true;
};

const toggleFilter = (filter: string) => {
    activeFilter.value = activeFilter.value === filter ? null : filter;
};
</script>

<template>
    <section p="y-20" id="components">
        <SectionHeading number="04" title="Component Gallery" />

        <!-- Buttons -->
        <div m="b-12">
            <p class="brick-label" m="b-6">Buttons</p>
            <div grid="~ cols-1 md:cols-2 lg:cols-3" gap="6">
                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">PrimaryButton</p>
                    <div flex="~ wrap" gap="3">
                        <PrimaryButton>Save Changes</PrimaryButton>
                    </div>
                </div>

                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">PrimaryButton :disabled</p>
                    <div flex="~ wrap" gap="3">
                        <PrimaryButton disabled>Save Changes</PrimaryButton>
                    </div>
                </div>

                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">DangerButton</p>
                    <div flex="~ wrap" gap="3">
                        <DangerButton>Delete Set</DangerButton>
                    </div>
                </div>

                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">BackButton</p>
                    <div flex="~ wrap" gap="3">
                        <BackButton>&larr; Back to Overview</BackButton>
                    </div>
                </div>

                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">ListItemButton</p>
                    <ListItemButton>
                        <span font="bold">Brick 2x4</span>
                        <span text="sm gray-600">Red &middot; Drawer B-7</span>
                    </ListItemButton>
                </div>
            </div>
        </div>

        <!-- Form inputs -->
        <div m="b-12">
            <p class="brick-label" m="b-6">Form Inputs</p>
            <div grid="~ cols-1 md:cols-2" gap="6">
                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">Default + Focus</p>
                    <FormField>
                        <FormLabel for="demo-input" :optional="false">Part Name</FormLabel>
                        <input
                            id="demo-input"
                            v-model="demoInput"
                            type="text"
                            p="x-4 y-3"
                            text="black"
                            font="medium"
                            w="full"
                            outline="none"
                            class="brick-border brick-shadow brick-transition focus:brick-shadow-hover focus:bg-brick-yellow"
                            bg="white"
                        />
                    </FormField>
                </div>

                <div p="6" class="brick-border" bg="gray-50">
                    <p text="xs" font="mono" text-color="gray-500" m="b-3">Error State</p>
                    <FormField>
                        <FormLabel for="error-input" :optional="false">Part Number</FormLabel>
                        <input
                            id="error-input"
                            v-model="errorInput"
                            type="text"
                            placeholder="Required"
                            p="x-4 y-3"
                            text="black"
                            font="medium"
                            w="full"
                            outline="none"
                            class="brick-border brick-transition bg-brick-red-light border-brick-red brick-shadow-error focus:brick-shadow-error-hover"
                            aria-invalid="true"
                            aria-describedby="error-input-error"
                        />
                        <FormError id="error-input-error" message="Part number is required." />
                    </FormField>
                </div>
            </div>
        </div>

        <!-- Cards & Layout -->
        <div m="b-12">
            <p class="brick-label" m="b-6">Cards &amp; Layout</p>
            <div grid="~ cols-1 md:cols-2 lg:cols-3" gap="6">
                <CardContainer>
                    <p font="heading bold" text="lg" uppercase tracking="wide" m="b-2">Brick 2x4</p>
                    <p text="sm gray-600">Classic red brick. Drawer B-7.</p>
                    <p text="sm" font="bold" m="t-3">47 in stock</p>
                </CardContainer>

                <CardContainer>
                    <p font="heading bold" text="lg" uppercase tracking="wide" m="b-2">Plate 1x2</p>
                    <p text="sm gray-600">White plate. Drawer C-14.</p>
                    <p text="sm" font="bold" m="t-3">182 in stock</p>
                </CardContainer>

                <CardContainer>
                    <p font="heading bold" text="lg" uppercase tracking="wide" m="b-2">Slope 45 2x1</p>
                    <p text="sm gray-600">Dark gray slope. Drawer A-3.</p>
                    <p text="sm" font="bold" m="t-3">23 in stock</p>
                </CardContainer>
            </div>
        </div>

        <!-- PageHeader -->
        <div m="b-12">
            <p class="brick-label" m="b-6">PageHeader</p>
            <div p="6" class="brick-border" bg="gray-50">
                <PageHeader title="My Inventory">
                    <PrimaryButton>Add Set</PrimaryButton>
                </PageHeader>
            </div>
        </div>

        <!-- StatCard -->
        <div m="b-12">
            <p class="brick-label" m="b-6">StatCard</p>
            <div grid="~ cols-1 sm:cols-2 lg:cols-3" gap="6">
                <StatCard label="Total Sets" value="42">
                    <p text="sm gray-600">Including 3 duplicates</p>
                </StatCard>
                <StatCard label="Storage Locations" value="12" />
                <StatCard label="Unique Parts" value="1,847">
                    <p text="sm gray-600">14,203 total pieces</p>
                </StatCard>
            </div>
        </div>

        <!-- DetailRow -->
        <div m="b-12">
            <p class="brick-label" m="b-6">DetailRow</p>
            <div p="6" class="brick-border" bg="gray-50" flex="~ col" gap="3">
                <DetailRow label="Name">Drawer A-3</DetailRow>
                <DetailRow label="Description">Top shelf, third from left</DetailRow>
                <DetailRow label="Row">1</DetailRow>
                <DetailRow label="Column">3</DetailRow>
            </div>
        </div>

        <!-- FilterChip -->
        <div m="b-12">
            <p class="brick-label" m="b-6">FilterChip</p>
            <div p="6" class="brick-border" bg="gray-50">
                <p text="xs" font="mono" text-color="gray-500" m="b-3">Click to toggle</p>
                <div flex gap="2" flex-wrap="wrap">
                    <FilterChip :active="activeFilter === 'sealed'" @click="toggleFilter('sealed')">Sealed</FilterChip>
                    <FilterChip :active="activeFilter === 'built'" @click="toggleFilter('built')">Built</FilterChip>
                    <FilterChip :active="activeFilter === 'in-progress'" @click="toggleFilter('in-progress')">
                        In Progress
                    </FilterChip>
                    <FilterChip :active="activeFilter === 'incomplete'" @click="toggleFilter('incomplete')">
                        Incomplete
                    </FilterChip>
                </div>
            </div>
        </div>

        <!-- BadgeLabel -->
        <div m="b-12">
            <p class="brick-label" m="b-6">BadgeLabel</p>
            <div p="6" class="brick-border" bg="gray-50">
                <div flex gap="3" flex-wrap="wrap" items="center">
                    <BadgeLabel>Sealed</BadgeLabel>
                    <BadgeLabel>Built</BadgeLabel>
                    <BadgeLabel variant="highlight">Drawer A-3 (12x)</BadgeLabel>
                    <BadgeLabel variant="highlight">Shelf B-1 (5x)</BadgeLabel>
                </div>
            </div>
        </div>

        <!-- ModalDialog -->
        <div m="b-12">
            <p class="brick-label" m="b-6">ModalDialog</p>
            <div p="6" class="brick-border" bg="gray-50">
                <PrimaryButton @click="modalOpen = true">Open Modal</PrimaryButton>
                <ModalDialog :open="modalOpen" @close="modalOpen = false">
                    <template #title>Confirm Action</template>
                    <p m="b-4">Are you sure you want to remove this brick from your inventory?</p>
                    <div flex gap="3">
                        <DangerButton @click="modalOpen = false">Remove</DangerButton>
                        <BackButton @click="modalOpen = false">Cancel</BackButton>
                    </div>
                </ModalDialog>
            </div>
        </div>

        <!-- Toasts -->
        <div m="b-12">
            <p class="brick-label" m="b-6">Toast Messages</p>
            <div flex="~ col" gap="4" max-w="lg">
                <ToastMessage
                    v-if="toastVisible"
                    message="Set added to your inventory."
                    variant="success"
                    @close="toastVisible = false"
                />
                <ToastMessage
                    v-if="errorToastVisible"
                    message="Could not connect to the brick vault."
                    variant="error"
                    @close="errorToastVisible = false"
                />
                <button
                    v-if="!toastVisible || !errorToastVisible"
                    @click="resetToasts"
                    text="sm"
                    font="bold"
                    underline="~ offset-4"
                    decoration="2 black"
                    cursor="pointer"
                    bg="transparent"
                    border="none"
                    p="0"
                    self="start"
                >
                    Reset toasts
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div m="b-12">
            <p class="brick-label" m="b-6">Empty State</p>
            <div p="8" class="brick-border" bg="gray-50">
                <EmptyState message="No bricks found. Time to go shopping." />
            </div>
        </div>
    </section>
</template>
