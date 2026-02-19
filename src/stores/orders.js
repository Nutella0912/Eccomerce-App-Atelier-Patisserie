import { defineStore } from "pinia";
import api from "../api/axios";

export const useOrdersStore = defineStore("orders", {
  state: () => ({
    mine: [],
    loading: false,
    error: "",
  }),

  actions: {
    /**
     * INITIAL CHECKOUT: Creates the Order record in the database.
     */
    async checkout(deliveryAddress = null) {
      this.error = "";
      this.loading = true;
      try {
        const res = await api.post("/orders/checkout", deliveryAddress ? { deliveryAddress } : {});
        return res.data; // { order }
      } catch (e) {
        this.error = "Checkout failed.";
        throw e;
      } finally {
        this.loading = false;
      }
    },

    /**
     * STRIPE FLOW (UPDATED to match backend)
     */
    async createStripeSession({ orderId, amount, methodType = "card", saveCard = true }) {
      try {
        const res = await api.post("/payments/stripe", {
          orderId,
          amount,
          methodType,
          saveCard,
        });

        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          throw new Error("Stripe session URL missing.");
        }
      } catch (e) {
        this.error = "Stripe initiation failed.";
        throw e;
      }
    },

    /**
     * MANUAL FLOW: GCash / Bank
     */
    async submitManualPayment(payload) {
      this.loading = true;
      this.error = "";
      try {
        const endpoint =
          payload.method === "gcash"
            ? "/payments/gcash"
            : payload.method === "paymaya"
            ? "/payments/maya"
            : "/payments/bank";

        const res = await api.post(endpoint, payload);
        return res.data;
      } catch (e) {
        this.error = "Failed to submit payment reference.";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    /**
     * ✅ Open Stripe hosted receipt URL
     * Backend route: GET /payments/:id/receipt -> { receiptUrl }
     */
    async downloadReceipt(paymentId) {
      try {
        const { data } = await api.get(`/payments/${paymentId}/receipt`);
        if (data?.receiptUrl) {
          window.open(data.receiptUrl, "_blank", "noopener,noreferrer");
          return;
        }
        throw new Error(data?.message || "Receipt not available yet.");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Could not open receipt.";
        throw new Error(msg);
      }
    },


    /**
     * FETCH ORDER HISTORY (includes paymentId)
     */
    async fetchMyOrders() {
      this.error = "";
      this.loading = true;
      try {
        const res = await api.get(`/orders/my-orders?t=${Date.now()}`);

        if (res.data && Array.isArray(res.data.orders)) {
          this.mine = res.data.orders;
        } else {
          this.mine = [];
        }
      } catch (e) {
        this.error = "Unable to retrieve your order history.";
        this.mine = [];
      } finally {
        this.loading = false;
      }
    },

    resetOrders() {
      this.mine = [];
      this.error = "";
    },
  },
});
