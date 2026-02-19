<script setup>
import { onMounted, ref } from "vue";
import api from "../api/axios";
import { useUiStore } from "../stores/ui";

const ui = useUiStore();

const loading = ref(false);
const saving = ref(false);
const error = ref("");

const form = ref({
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  barangay: "",
  city: "",
  province: "",
  postalCode: "",
  notes: ""
});

async function loadAddress() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/users/address");
    Object.assign(form.value, data?.deliveryAddress || {});
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to load address.";
  } finally {
    loading.value = false;
  }
}

async function saveAddress() {
  saving.value = true;
  error.value = "";
  try {
    await api.put("/users/address", { deliveryAddress: form.value });
    ui.centerToastNotify("Delivery address saved.");
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to save address.";
  } finally {
    saving.value = false;
  }
}

onMounted(loadAddress);
</script>

<template>
  <div class="container container-narrow py-4">
    <div class="glass p-4">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 class="mb-1">Delivery Address</h2>
          <div class="text-white-50">Save where you want your orders delivered.</div>
        </div>
        <button class="btn btn-accent" :disabled="saving" @click="saveAddress">
          <span v-if="saving">Saving…</span>
          <span v-else>Save</span>
        </button>
      </div>

      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      <div v-if="loading" class="text-white-50 mt-3">Loading…</div>

      <form v-else class="row g-3 mt-2" @submit.prevent="saveAddress">
        <div class="col-12 col-md-6">
          <label class="form-label">Full Name</label>
          <input v-model.trim="form.fullName" class="form-control input-soft" placeholder="Juan Dela Cruz" />
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Phone</label>
          <input v-model.trim="form.phone" class="form-control input-soft" placeholder="09XXXXXXXXX" />
        </div>

        <div class="col-12">
          <label class="form-label">Address Line 1</label>
          <input v-model.trim="form.line1" class="form-control input-soft" placeholder="House no., Street, Subdivision" />
        </div>

        <div class="col-12">
          <label class="form-label">Address Line 2 (optional)</label>
          <input v-model.trim="form.line2" class="form-control input-soft" placeholder="Unit / Floor / Building" />
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Barangay</label>
          <input v-model.trim="form.barangay" class="form-control input-soft" />
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">City / Municipality</label>
          <input v-model.trim="form.city" class="form-control input-soft" />
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Province</label>
          <input v-model.trim="form.province" class="form-control input-soft" />
        </div>

        <div class="col-12 col-md-6">
          <label class="form-label">Postal Code</label>
          <input v-model.trim="form.postalCode" class="form-control input-soft" />
        </div>

        <div class="col-12">
          <label class="form-label">Delivery Notes (optional)</label>
          <textarea v-model.trim="form.notes" class="form-control input-soft" rows="3" placeholder="Landmark, gate instructions, etc."></textarea>
        </div>

        <div class="col-12 d-md-none">
          <button class="btn btn-accent w-100" :disabled="saving">
            <span v-if="saving">Saving…</span>
            <span v-else>Save</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>