<script setup>
import { onMounted, ref } from "vue";
import api from "../api/axios";
import { useUiStore } from "../stores/ui";

const ui = useUiStore();
const loading = ref(false);
const error = ref("");
const orders = ref([]);

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "ready", label: "Ready to Deliver" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

function formatAddress(a) {
  if (!a) return "No address provided.";
  const parts = [
    a.fullName,
    a.phone,
    a.line1,
    a.line2,
    a.barangay,
    a.city,
    a.province,
    a.postalCode
  ].filter(Boolean);
  return parts.join(", ") + (a.notes ? ` — Notes: ${a.notes}` : "");
}

async function fetchAll() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get("/orders/all-orders");
    orders.value = data?.orders || [];
  } catch (e) {
    error.value = e?.response?.data?.message || "Failed to load orders.";
  } finally {
    loading.value = false;
  }
}

async function updateStatus(orderId, status) {
  try {
    await api.patch(`/orders/${orderId}/delivery-status`, { status });
    ui.centerToastNotify("Delivery status updated.");
  } catch (e) {
    ui.centerToastErrorNotify(e?.response?.data?.message || "Failed to update status.");
  }
}

onMounted(fetchAll);
</script>

<template>
  <div class="container py-4">
    <div class="glass p-4 mb-3">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h2 class="mb-1">Deliveries</h2>
          <div class="text-white-50">View customer addresses and update delivery status.</div>
        </div>
        <button class="btn btn-outline-light" @click="fetchAll" :disabled="loading">
          Refresh
        </button>
      </div>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>

    <div v-if="loading" class="text-white-50">Loading…</div>

    <div v-else class="row g-3">
      <div v-for="o in orders" :key="o._id" class="col-12">
        <div class="card card-glass p-3">
          <div class="d-flex flex-wrap justify-content-between gap-2">
            <div>
              <div class="fw-semibold">Order #{{ o._id }}</div>
              <div class="text-white-50">
                Customer:
                <span v-if="o.userId?.email">{{ o.userId.email }}</span>
                <span v-else>{{ o.userId }}</span>
              </div>
              <div class="text-white-50">Total: ₱{{ Number(o.totalPrice || 0).toFixed(2) }}</div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <select
                class="form-select input-soft"
                :value="o.deliveryStatus || 'pending'"
                @change="(e) => { o.deliveryStatus = e.target.value; updateStatus(o._id, e.target.value); }"
              >
                <option v-for="s in statusOptions" :key="s.value" :value="s.value">
                  {{ s.label }}
                </option>
              </select>
            </div>
          </div>

          <hr class="border-white-10 my-3" />

          <div class="row g-2">
            <div class="col-12 col-md-8">
              <div class="text-white-50 mb-1">Delivery Address</div>
              <div>{{ formatAddress(o.deliveryAddress || o.userId?.deliveryAddress) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-white-50 mb-1">Ordered On</div>
              <div>{{ new Date(o.orderedOn || o.createdAt).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="orders.length === 0" class="text-white-50">No orders yet.</div>
    </div>
  </div>
</template>